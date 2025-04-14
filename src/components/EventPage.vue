<script setup>

import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import { PEvent, PButton, PFinanceBlock, PDropDown, PTextField, PFlight, PProfilePic } from '@poseidon-components'
import { PlannerInvite } from './PlannerInvite.vue'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import api from '../assets/scripts/api.js'
// import { usePlacesAutocomplete } from 'vue-use-places-autocomplete'
import { format, isToday, parseISO } from 'date-fns';
import VueGoogleAutocomplete from "vue-google-autocomplete"
import VueDatePicker from '@vuepic/vue-datepicker';
import { checkAuth } from '../assets/scripts/checkAuth.js'
import '@vuepic/vue-datepicker/dist/main.css'
import HeaderBar from './Headerbar.vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const searchDate = ref(null)
const departDate = ref(null)
const returnDate = ref(null)
const arrivalDate = ref(null)
const bookingData = ref(null)
const bookingItinerary = ref(null)
const bookingPrice = ref(null)
const editView = ref(route.query.editView === 'true')
const flightType = ref(0);
const latitude = ref('');
const longitude = ref('');
const departureAirportField = ref('');
const errors = ref({ date: '', location: '' })
const roundtripRange = ref(null)
const showInviteModal = ref(false)
const isMobile = ref(window.innerWidth <= 768);
const userInfo = ref({});
const dateRange = ref([])

// const editableName = ref(eventStore.currentEvent.eventName)
// const editableStartDate = ref(eventStore.currentEvent.startDate)
// const editableEndDate = ref(eventStore.currentEvent.endDate)
// const description = ref(eventStore.currentEvent.description)

const editableName = computed({
    get() {
        return eventStore.currentEvent?.eventName || '';
    },
    set(newValue) {
        eventStore.currentEvent.eventName = newValue
    }
});

const editableStartDate = computed({
    get() {
        return eventStore.currentEvent?.startDate || '';
    },
    set(newDate) {
        eventStore.currentEvent.startDate = newDate
    }
});

const editableEndDate = computed({
    get() {
        return eventStore.currentEvent?.endDate || '';
    },
    set(newDate) {
        eventStore.currentEvent.endDate = newDate
    }
});

const description = computed({
    get() {
        return eventStore.currentEvent?.description || '';
    },
    set(newValue) {
        eventStore.currentEvent.description = newValue
    }
});

// Call the function when the component is mounted
onMounted(async () => {
    checkAuth()
    window.addEventListener('resize', updateScreenSize);
    checkAndLoadEvent()
    checkAndLoadFlightBooking()
    console.log('Organization:', eventStore.currentEvent.org)
    console.log(eventStore.currentEvent)
})

const updateScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
};

const formatDate = (date) => {
    if (!date) return 'Invalid date'; // Handle null or undefined dates
    const parsedDate = typeof date === 'string' ? new Date(date) : date; // Parse string to Date
    if (isNaN(parsedDate)) return 'Invalid date'; // Handle invalid dates
    return parsedDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

//Function to handle the back button
const handleBack = (targetRoute) => {
    router.push({ name: targetRoute })
}

//Function to handle the flight click
const handleFlightClick = (flight) => {
    router.push({ name: 'BookingItinerary', query: { eventID: eventStore.currentEvent.id } })
}

//Function to search for flights with Duffel API
const toFlightSearch = () => {
    errors.value.date = ''
    errors.value.location = ''
    console.log(departureAirportField.value)
    let hasError = false;

    if (latitude.value == '' || longitude.value == '' || departureAirportField.value == '') {
        errors.value.location = 'Departure airport is required.'
        hasError = true;
    }
    if (!departDate.value && !roundtripRange.value) {
        errors.value.date = 'Date is required.'
        hasError = true;
    }
    if (!hasError) {

        flightStore.clearFlights()
        console.log(eventStore.currentEvent);
        console.log('date being sent to api:', searchDate.value);
        // console.log(searchDate.value.toISOString())
        return api.apiFetch('/flights/search', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                departure_date: searchDate.value || eventStore.currentEvent.startDate,
                lat: latitude.value,
                long: longitude.value,
                destination: eventStore.currentEvent.destinationCode,
                type: flightType.value,
                ...(returnDate.value ? { return_date: returnDate.value } : {})
            })
        }).then(
            response => flightStore.setFlightResults(response.json())
        ).then(
            router.push({ name: 'Flight', query: { type: flightType.value } })
        )
    }
}

const parseDate = (date) => {
    if (!date) return null;
    return typeof date === 'string' ? parseISO(date) : date;
};

const formatDateForBackend = (date) => {
    console.log(date)
    const parsedDate = parseDate(date);
    if (!parsedDate) return '';
    return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");
};

// Function to handle the update of the fields for the event
const handleUpdate = ({ field, value }) => {
    if (field === 'name') editableName.value = value
    if (field === 'startDate') editableStartDate.value = value
    if (field === 'endDate') editableEndDate.value = value
    if (field === 'description') description.value = value
    console.log("HANDLE", field, value)
}

const saveChanges = async () => {
    console.log('Event ID:', eventStore.currentEvent.id)
    console.log('Editable Name:', editableName.value)
    console.log('Description:', description.value)
    console.log('DATE SET TO:', editableStartDate.value)
    console.log(dateRange.value[0])
    const updatedEvent = {
        name: editableName.value || eventStore.currentEvent.eventName,
        // startDate: formatDateForBackend(editableStartDate.value),
        startDate: dateRange.value[0]
            ? formatDateForBackend(dateRange.value[0])
            : formatDateForBackend(editableStartDate.value),
        // endDate: formatDateForBackend(editableEndDate.value),
        endDate: dateRange.value[1]
            ? formatDateForBackend(dateRange.value[1])
            : formatDateForBackend(editableEndDate.value),
        description: description.value,
    }
    try {
        const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEvent),
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Event created successfully:', result)
            router.push({ name: 'Home' }) // Redirect to home or another page
        } else {
            console.error('Failed to update event:', await response.json())
        }
    } catch (error) {
        console.error('Error updating event:', error)
    }
}

// Function to check and load event data from localStorage
const checkAndLoadEvent = async () => {
    if (route?.query?.eventID) {
        const eventId = route?.query?.eventID
        try {
            const response = await api.apiFetch('/events/' + eventId, {
                credentials: 'include'
            })
            if (response.ok) {
                const eventData = await response.json()
                eventStore.setCurrentEvent(eventData)
            }
        } catch (error) {
            console.error('Failed to fetch the selected event:', error)
        }
    } else {
        const eventData = localStorage.getItem('currentEvent');
        if (eventData) {
            eventStore.loadCurrentEvent();
        }
    }

}

const isAttendee = computed(() => userStore.role_id === 'Attendee')
const checkAndLoadFlightBooking = async () => {
    if (isAttendee.value) {
        try {
            const response = await api.apiFetch('/flights/bookedflight/' + eventStore.currentEvent.id, {
                credentials: 'include'
            })
            if (response.status === 404) {
                console.warn('No flight data found for the selected event.')

            } else if (response.ok) {
                const flightData = await response.json()
                console.log(flightData)
                flightStore.setCurrentFlight(flightData)
                console.log(flightStore.currentFlight)

                bookingData.value = flightData
                bookingPrice.value = bookingData.price
            }

        } catch (error) {
            console.error('Failed to fetch current booking data:', error)
        }
    }

    if (flightStore.currentFlight.itinerary) {
        bookingItinerary.value = flightStore.currentFlight.itinerary;
        bookingPrice.value = flightStore.currentFlight.price;
    }
}


const handlePlaceChanged = (place) => {
    latitude.value = place.latitude;
    longitude.value = place.longitude;
    console.log('Selected Location:', place);
}

const handleBlur = () => {
    setTimeout(() => {
        isInputFocused.value = false;
    }, 100);
};



onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
})

const handleRoundtripDate = (date) => {
    // console.log('!!!DATE CHANGE:', date);
    console.log('date input:', date);
    searchDate.value = date[0].toLocaleDateString('sv-SE')
    returnDate.value = date[1].toLocaleDateString('sv-SE')
    console.log('date output', searchDate.value, returnDate.value);

}

const handleOneWayDate = (date) => {
    searchDate.value = date.toLocaleDateString('sv-SE')
    console.log('date input:', date);
    console.log('date output:', searchDate.value);

}

const goToInvitePage = () => {
    router.push({ name: "Invite" });
}

// const openInviteModal = () => {
//     showInviteModal.value = true
//  }

//  console.log(bookingData.itinerary[0])

const isModalVisible = ref(false)

// Function to open the modal
const openModal = async () => {
    await fetchUserData();
    isModalVisible.value = true
}

// Function to close the modal
const closeModal = () => {
    isModalVisible.value = false
}



// Function to handle modal option selection
const handleModalOption = async (option) => {
    console.log(`Selected option: ${option}`)
    if (option === 'Logout') {
        try {
            const response = await api.apiFetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                userStore.$reset() // Reset the user store
                localStorage.clear() // Clear local storage
                router.push({ name: 'Login' }) // Redirect to login page
            }
        } catch (error) {
            console.error('Failed to logout:', error)
        }
    } else if (option === 'Edit') {
        router.push({ name: 'EditUser' })
    }
    closeModal()
}

const fetchUserData = async () => {
    try {
        const response = await api.apiFetch(`/user/${userStore.user_id}`, {
            credentials: 'include'
        });
        if (response.ok) {
            userInfo.value = await response.json();
        } else {
            console.error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const statusClass = computed(() => {
    const statusName = bookingData.value?.status?.name?.toLowerCase();
    if (statusName === 'pending approval') {
        return 'pending';
    } else if (statusName === 'denied') {
        return 'denied';
    } else if (statusName === 'approved') {
        return 'approved';
    } else {
        return ''; // For approved or any other status, no extra style
    }
});

const formatTimeForDisplay = (dateTimeStart, dateTimeEnd) => {
    const startDate = new Date(dateTimeStart);
    const endDate = new Date(dateTimeEnd);

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };

    return `${startDate.toLocaleString('en-US', options)} - ${endDate.toLocaleString('en-US', options)}`;
}

</script>

<template>
    <!-----------------------------------------------------------MODAL------------------------------------------------------------>
    <template v-if="isModalVisible && !isMobile">
        <div>
            <div class="modal-overlay" @click="closeModal"></div>
            <div class="modal modal-container">
                <div class="modal-profile">
                    <div class="modal-profile-img-name">
                        <h4>{{ userStore.first_name }} {{ userStore.last_name }}</h4>
                        <PProfilePic design="big" :profileImage='userStore.profile_picture' />
                        <div class="modal-profile-title-org">
                            <h5>{{ userStore.role_id }}</h5>
                            <p>{{ userStore.org.name }}</p>
                        </div>
                    </div>

                    <div class="modal-profile-info-container">
                        <div class="modal-profile-info">
                            <div class="profile-content">
                                <h5>Email</h5>
                                <p>{{ userStore.email }}</p>
                            </div>
                            <div class="profile-content">
                                <h5>Phone</h5>
                                <p>{{ userInfo.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
                                }}</p>
                            </div>

                            <div class="profile-content">
                                <h5>Gender</h5>
                                <p v-if="userInfo.gender == 'm'">Male</p>
                                <p v-else>Female</p>
                            </div>
                            <div class="profile-content">
                                <h5>Date of Birth</h5>
                                <p>{{ format(userInfo.dob, 'MMMM do, yyyy') }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-profile-options">
                        <PButton label="Edit" design="gradient-small" @click="() => handleModalOption('Edit')" />
                        <PButton label="Logout" design="gradient-small" @click="() => handleModalOption('Logout')" />
                    </div>
                </div>
            </div>
        </div>
    </template>
    <!-- -----------------------------------------------------------DESKTOP------------------------------------------------------->

    <!-----------------------------------------------------------EVENT PLANNER DESKTOP EDIT------------------------------------------------------->
    <template v-if="editView && !isMobile">
        <div class="event-page-desktop">
            <div class="home-header__text-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' backButton />
            </div>
            <!-- <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="desktop-header" /> -->

            <div class="event-desktop-contentBox" :style="{
                backgroundImage: `var(--gradient), url(${eventStore.currentEvent.pictureLink}), url(${pictureLink})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }">
                <div class="event-desktop-contentBox__info">
                    <div class="event-desktop-contentBox__textField">
                        <input type="text" v-model="eventName" :placeholder="editableName" required />
                    </div>
                    <h2>Hosted By {{ userStore.org.name }}</h2> <!-- Organization name -->
                </div>
                <div class="file-input-wrapper">
                    <label for="file-upload" class="custom-file-label">
                        <span>Replace Image</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M18 20H4V6h9V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2zm-7.79-3.17l-1.96-2.36L5.5 18h11l-3.54-4.71zM20 4V1h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V6h3V4z" />
                        </svg>
                    </label>
                    <input type="file" id="file-upload" accept="image/*" @change="handleImageUpload" />
                </div>
            </div>

            <div class="editEvent-desktop-content">
                <div class="event-date-desktop">
                    <h2>Date</h2>
                    <VueDatePicker class="evTopMargin" v-model="dateRange" :range="true" :enable-time-picker="false"
                        :placeholder="formatTimeForDisplay(editableStartDate, editableEndDate)" exactMatch="true"
                        :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply hide-input-icon>
                    </VueDatePicker>
                    <h2>Description</h2>
                    <PTextField class="evTopMargin" design="textarea" :maxlength=400 label="Description"
                        v-model="description" required />
                </div>

                <div class="event-people-desktop">
                    <div class="event-people-desktop__userAdd">
                        <h2>Users</h2>
                        <div class="event-edit-button">
                            <PButton design="gradient" label="Edit/Add" @click="goToInvitePage"></PButton>
                        </div>
                    </div>
                    <hr>
                    <div class="finance-info-desktop">
                        <div v-if="eventStore.currentEvent.financeMan?.id">
                            <h2>Finance Lead</h2>
                            <PFinanceBlock :email="eventStore.currentEvent.financeMan?.email"
                                :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                                jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                                :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                        </div>
                        <div>
                            <h2>Event Planner</h2>
                            <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                                :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                                jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                                :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            <hr>
            <br>
            <div class="event-edit-button">
                <PButton design="gradient" label="Save Changes" @click="saveChanges" />
            </div>
        </div>
    </template>

    <!-----------------------------------------------------------EVENT PLANNER DESKTOP NO EDIT------------------------------------------------------->

    <template v-if="userStore.role_id == 'Event Planner' && !editView && !isMobile">
        <div class="event-page-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' backButton />
            </div>
            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="desktop-header" />
            <div class="event-desktop-content">
                <div class="event-date-desktop">
                    <h2>Date</h2>
                    <p>{{ formatDate(eventStore.currentEvent.startDate) }} - {{
                        formatDate(eventStore.currentEvent.endDate) }}</p>
                    <h2>Description</h2>
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>

                <div class="event-people-desktop">
                    <h2>Users</h2>
                    <hr>
                    <div class="finance-info-desktop">
                        <div v-if="eventStore.currentEvent.financeMan?.id">
                            <h2>Finance Lead</h2>
                            <PFinanceBlock :email="eventStore.currentEvent.financeMan?.email"
                                :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                                jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                                :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                        </div>
                        <div>
                            <h2>Event Planner</h2>
                            <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                                :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                                jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                                :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                        </div>
                    </div>
                </div>
            </div>

            <div class="selected-flight" v-if="bookingData" v-for="(segment, index) in bookingItinerary.itinerary">
                <PFlight design="block" :airline="bookingItinerary.airline" :logoURL="bookingItinerary.logoURL"
                    :price="bookingPrice" :flightClass="segment.class" :flightType="segment.flight_type" :seat
                    :origin="segment.origin" :destination="segment.destination"
                    :flightDate="new Date(segment.departure_time)" :flightDepTime="segment.departure_time"
                    :flightArrTime="segment.arrival_time" :flightDuration="segment.duration"
                    @click="handleFlightClick(flightStore.currentFlight)" />
            </div>
        </div>

    </template>

    <template v-if="userStore.role_id == 'Attendee' && !editView && !isMobile">
        <div class="event-page-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' backButton />
            </div>
            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="desktop-header" />

            <div v-if="!bookingData || bookingData?.status?.id == 2" class="event-desktop-search">
                <!--Search Bar-->
                <div class="flight-search-header">
                    <h2>Flight Search</h2>
                    <div class="flight-type-toggle">
                        <button :class="['flight-btn', flightType === 0 ? 'active' : '']" @click="flightType = 0">
                            One way
                        </button>
                        <button :class="['flight-btn', flightType === 1 ? 'active' : '']" @click="flightType = 1">
                            Round trip
                        </button>
                    </div>
                </div>

                <div class="search-inputs">
                    <div class="autocomplete-wrapper">

                        <div :class="['error-container', { show: errors.location }]">
                            <svg v-if="errors.location" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16"
                                height="16" viewBox="0 0 16 16">
                                <path fill="#FEB96E" fill-rule="evenodd"
                                    d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p v-if="errors.location" class="input-error">{{ errors.location }}</p>
                        </div>

                        <!-- Your SVG icon -->
                        <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em"
                            viewBox="0 0 24 24">
                            <path fill="#a9a9a9"
                                d="m12 20.9l4.95-4.95a7 7 0 1 0-9.9 0zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0zM12 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 2a4 4 0 1 1 0-8a4 4 0 0 1 0 8" />
                        </svg>
                        <!-- VueGoogleAutocomplete component -->
                        <VueGoogleAutocomplete class="p-textfield" id="map" types="airport" country="us"
                            classname="form-control" placeholder="Departure Airport" v-model="departureAirportField"
                            v-on:placechanged="handlePlaceChanged" required />
                    </div>

                    <div class="date-picker-wrapper">

                        <div :class="['error-container', { show: errors.date }]">
                            <svg v-if="errors.date" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16"
                                height="16" viewBox="0 0 16 16">
                                <path fill="#FEB96E" fill-rule="evenodd"
                                    d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p v-if="errors.date" class="input-error">{{ errors.date }}</p>
                        </div>

                        <VueDatePicker v-if="flightType === 0" v-model="departDate" :min-date="new Date()"
                            :enable-time-picker="false" :placeholder="'Departure Date'" exactMatch="true"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            @update:model-value="handleOneWayDate"></VueDatePicker>

                        <VueDatePicker v-if="flightType === 1" :range="true" :min-date="new Date()"
                            :enable-time-picker="false" v-model="roundtripRange" format='MM/dd/yyyy'
                            :placeholder="'Departure & Return Dates'"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            @update:model-value="handleRoundtripDate">
                        </VueDatePicker>
                    </div>

                    <PButton design="gradient" label="Search" @click="toFlightSearch" />


                </div>
            </div>
            <div v-if="bookingData" class="holding-flights">
                <h2>Your Flight: <p class="role-bubble" :class="statusClass" style="display: inline; font-size: 1rem;">
                        {{ bookingData?.status?.name }}</p>
                </h2>

                <div class="selected-flight" v-if="bookingData" v-for="(segment, index) in bookingItinerary.itinerary">
                    <PFlight design="desktop-block" :airline="bookingItinerary.airline"
                        :logoURL="bookingItinerary.logoURL" :price="bookingPrice" :flightClass="segment.class"
                        :flightType="segment.flight_type" :seat :origin="segment.origin"
                        :destination="segment.destination" :flightDate="new Date(segment.departure_time)"
                        :flightDepTime="segment.departure_time" :flightArrTime="segment.arrival_time"
                        :flightDuration="segment.duration" @click="handleFlightClick(flightStore.currentFlight)" />
                </div>
            </div>

            <hr>
            <div class="event-desktop-content">
                <div class="event-date-desktop">
                    <h2>Date</h2>
                    <p>{{ formatDate(eventStore.currentEvent.startDate) }} - {{
                        formatDate(eventStore.currentEvent.endDate) }}</p>
                    <h2>Description</h2>
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>

                <div class="event-people-desktop">

                    <div class="finance-info-desktop">
                        <div v-if="eventStore.currentEvent.financeMan?.id">
                            <h2>Finance Lead</h2>
                            <PFinanceBlock :email="eventStore.currentEvent.financeMan?.email"
                                :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                                jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                                :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                        </div>

                        <h2>Event Planner</h2>
                        <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                            :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                            jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                            :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                    </div>
                </div>
            </div>
        </div>

    </template>

    <!-----------------------------------------------------------MOBILE------------------------------------------------------->

    <template v-else-if="route?.query?.editView && isMobile">
        <div class="event-page">

            <PEvent :organization="eventStore.currentEvent.org" :eventName="editableName" :startDate="editableStartDate"
                :endDate="editableEndDate" :pictureLink="eventStore.currentEvent.pictureLink" design="header-edit"
                @update="handleUpdate" @back-click="() => handleBack('Home')" />

            <div>
                <h1>Description</h1>
                <div class="event-description">
                    <PTextField v-model="description" design="textarea-edit"
                        :description="eventStore.currentEvent.description"
                        @update:modelValue="value => handleUpdate({ field: 'description', value })">
                    </PTextField>
                </div>

                <h1>Planning Team</h1>
                <div class="finance-info">
                    <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                        :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                        jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                        :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                    <PFinanceBlock v-if="eventStore.currentEvent.financeMan?.id"
                        :email="eventStore.currentEvent.financeMan?.email"
                        :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                        jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                        :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                </div>
            </div>
            <div class="event-edit-button">
                <PButton design="gradient" label="Add/Edit Users" @click="goToInvitePage"></PButton>
            </div>
            <div class="event-edit-button">
                <PButton design="gradient" label="Save Changes" @click="saveChanges" />
            </div>
        </div>
    </template>

    <template v-else-if="isMobile && userStore.role_id != 'Event Planner'">
        <div class="event-page">

            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                @back-click="() => handleBack('Home')" />

            <div class="event-content">
                <h1>Description</h1>
                <div class="event-description">
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <div class="selected-flight" v-if="bookingData" v-for="(segment, index) in bookingItinerary.itinerary">
                    <PFlight design="block" :airline="bookingItinerary.airline" :logoURL="bookingItinerary.logoURL"
                        :price="bookingPrice" :flightClass="segment.class" :flightType="segment.flight_type"
                        :origin="segment.origin" :destination="segment.destination"
                        :flightDate="new Date(segment.departure_time)" :flightDepTime="segment.departure_time"
                        :flightArrTime="segment.arrival_time" :flightDuration="segment.duration"
                        @click="handleFlightClick(flightStore.currentFlight)" />
                </div>
                <div v-if="!bookingData || bookingData?.status?.id == 2">
                    <div class="flight-search-form">
                        <h1>Flight Search</h1>
                    </div>
                    <div class="flight-type-toggle">
                        <button :class="['flight-btn', flightType === 0 ? 'active' : '']" @click="flightType = 0">
                            One way
                        </button>
                        <button :class="['flight-btn', flightType === 1 ? 'active' : '']" @click="flightType = 1">
                            Round trip
                        </button>
                    </div>
                    <div :class="['p-dropdown__container', { show: flightType === 0 || flightType === 1 }]"
                        id="flight-search">
                        <!-- <PTextField design="small" label="Departure Date" type="date" v-model="searchDate">
                                </PTextField> -->
                        <div :class="['error-container', { show: errors.date }]">
                            <svg v-if="errors.date" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16"
                                height="16" viewBox="0 0 16 16">
                                <path fill="#FEB96E" fill-rule="evenodd"
                                    d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p v-if="errors.date" class="input-error">{{ errors.date }}</p>
                        </div>
                        <VueDatePicker v-if="flightType === 0" v-model="departDate" :min-date="new Date()"
                            :enable-time-picker="false" :placeholder="'Departure Date'" exactMatch="true"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            @update:model-value="handleOneWayDate"></VueDatePicker>

                        <VueDatePicker v-if="flightType === 1" :range="true" :min-date="new Date()"
                            :enable-time-picker="false" v-model="roundtripRange" :format="'MM/dd/yyyy'"
                            :placeholder="'Departure & Return Dates'"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            @update:model-value="handleRoundtripDate">
                        </VueDatePicker>

                    </div>
                    <div :class="['p-dropdown__container', { show: flightType === 0 || flightType === 1 }]"
                        id="flight-search">
                        <div :class="['error-container', { show: errors.location }]">
                            <svg v-if="errors.location" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16"
                                height="16" viewBox="0 0 16 16">
                                <path fill="#FEB96E" fill-rule="evenodd"
                                    d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p v-if="errors.location" class="input-error">{{ errors.location }}</p>
                        </div>

                        <vue-google-autocomplete v-if="flightType != null" class="p-textfield--small" id="map"
                            types="airport" country="us" classname="form-control" placeholder="Departure Airport"
                            v-on:placechanged="handlePlaceChanged">
                        </vue-google-autocomplete>
                    </div>
                    <div :class="['p-dropdown__container', { show: flightType === 0 || flightType === 1 }]"
                        style="display: block;" id="flight-search">
                        <PButton v-if="flightType != null" design="gradient" label="Search for Flights"
                            @click="toFlightSearch" />
                    </div>
                </div>
            </div>


            <h1>Planning Team</h1>
            <div class="finance-info">
                <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                    :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                    jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                    :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                <PFinanceBlock v-if="eventStore.currentEvent.financeMan?.id"
                    :email="eventStore.currentEvent.financeMan?.email"
                    :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                    jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                    :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
            </div>
        </div>
    </template>

    <template v-else="isMobile && userStore.role_id == 'Event Planner'">
        <div class="event-page">

            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                @back-click="() => handleBack('Home')" />

            <div class="event-content">
                <h1>Description</h1>
                <div class="event-description">
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <h1>Planning Team</h1>
                <div class="finance-info">
                    <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                        :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                        jobTitle="Event Planner" :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                        :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                    <PFinanceBlock v-if="eventStore.currentEvent.financeMan?.id"
                        :email="eventStore.currentEvent.financeMan?.email"
                        :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                        jobTitle="Finance Manager" :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                        :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                </div>
            </div>
        </div>
    </template>

    <template v-if="route?.query?.editView && showInviteModal && isMobile">
        <div class="modal-overlay" @click="showInviteModal = false"></div>
        <div class="modal modal-container">
            <div class="event-invite">
                <PlannerInvite></PlannerInvite>
            </div>
        </div>
    </template>

</template>