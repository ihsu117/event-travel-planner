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
import { format, parseISO } from 'date-fns';
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
const zipcode = ref('')
const bookingData = ref(null)
const bookingItinerary = ref(null)
const bookingPrice = ref(null)
const editView = ref(route.query.editView === 'true')
const flightType = ref(null);
const latitude = ref('');
const longitude = ref('');
const errors = ref({ date: '', location: '' })
const roundtripRange = ref(null)
const showInviteModal = ref(false)
const isMobile = ref(window.innerWidth <= 768);

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
    flightStore.setCurrentFlight(flight)
    router.push({ name: 'FlightItinerary' })
}

//Function to search for flights with Duffel API
const toFlightSearch = () => {
    if (!searchDate.value && !returnDate.value) {
        errors.value.date = 'Date is required.'
    }
    if (!latitude.value || !longitude.value) {
        errors.value.location = 'Departure airport is required.'
    }

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

const parseDate = (date) => {
    if (!date) return null;
    return typeof date === 'string' ? parseISO(date) : date;
};

const formatDateForBackend = (date) => {
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
    const updatedEvent = {
        name: editableName.value || eventStore.currentEvent.eventName,
        startDate: formatDateForBackend(editableStartDate.value),
        endDate: formatDateForBackend(editableEndDate.value),
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
            eventStore.setCurrentEvent(result)
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

</script>

<template>
    <!-----------------------------------------------------------MODAL------------------------------------------------------------>

    <!-- -----------------------------------------------------------DESKTOP------------------------------------------------------->

    <template v-if="editView && !isMobile">
        <div class="home-header-desktop">
            <div class="home-header__text-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
        </div>
        <div class="event-desktop-container">
            <div class="event-desktop-contentBox">
                <div class="event-desktop-contentBox__info">
                    <div class="event-desktop-contentBox__textField">
                        <input type="text" v-model="eventName" placeholder="Event Name" required />
                    </div>
                    <h2>Hosted By {{ userStore.org.name }}</h2> <!-- Organization name -->
                </div>
                <!-- <label for="imageUpload">this is atest</label>
                <input id="imageUpload" type="file" accept="image/*" @change="handleImageUpload" />
                <p v-if="pictureLink">Image uploaded successfully!</p> -->

                <div class="file-input-wrapper">
                    <label for="file-upload" class="custom-file-label">
                        <span>Add Image</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M18 20H4V6h9V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2zm-7.79-3.17l-1.96-2.36L5.5 18h11l-3.54-4.71zM20 4V1h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V6h3V4z" />
                        </svg>
                    </label>
                    <input type="file" id="file-upload" accept="image/*" @change="handleImageUpload" />
                </div>
            </div>
            <div class="event-form__desktop">
                <div class="event-form__desktop--topbar">
                    <div class="planner-event-destination">
                        <h2>Destination</h2>
                        <vue-google-autocomplete class="p-textfield" id="map" types="airport" country="us"
                            classname="form-control" placeholder="Destination Airport"
                            v-on:placechanged="handlePlaceChanged" required>
                        </vue-google-autocomplete>
                    </div>
                    <div class="planner-start-date">
                        <h2>Start Date</h2>
                        <VueDatePicker class="evTopMargin" v-model="startDate" :enable-time-picker="false"
                            :placeholder="'Start Date'" exactMatch="true"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply hide-input-icon>
                        </VueDatePicker>
                    </div>
                    <div class="planner-end-date">
                        <h2>End Date</h2>
                        <VueDatePicker class="evTopMargin" v-model="endDate" :enable-time-picker="false"
                            :placeholder="'End Date'" exactMatch="true"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply hide-input-icon>
                        </VueDatePicker>
                    </div>
                    <div class="planner-event-budget">
                        <h2>Max Budget</h2>
                        <PTextField class="evTopMargin" label="Max Budget" v-model="maxBudget" required />
                    </div>
                </div>

                <div class="planner-description">
                    <h2>Description</h2>
                    <PTextField class="evTopMargin" design="textarea" :maxlength=400 label="Description"
                        v-model="description" required />
                </div>
                <br>
                <br>
                <br>
                <div class="submitDiv">
                    <PButton label="Create Event" @click="createEvent" design="gradient"></PButton>
                </div>
            </div>
        </div>
    </template>

    <template v-if="userStore.role_id == 'Event Planner' && !editView && !isMobile">
        <div class="event-page-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
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
                    <div class="event-edit-button">
                        <PButton design="gradient" label="Add/Edit Users" @click="goToInvitePage"></PButton>
                    </div>
                    <div class="event-edit-button">
                        <PButton design="gradient" label="Save Changes" @click="saveChanges" />
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
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
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
            <div class="event-desktop-search">
                <div class="flight-type-toggle">
                    <button :class="['flight-btn', flightType === 0 ? 'active' : '']" @click="flightType = 0">
                        One way
                    </button>
                    <button :class="['flight-btn', flightType === 1 ? 'active' : '']" @click="flightType = 1">
                        Round trip
                    </button>
                </div>
                <div class="flight-search-form">
                    <div :class="['p-dropdown__container', { show: flightType === 0 || flightType === 1 }]"
                        id="flight-search">
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

    <template v-else-if="isMobile">
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

    <template v-if="route?.query?.editView && showInviteModal && isMobile">
        <div class="modal-overlay" @click="showInviteModal = false"></div>
        <div class="modal modal-container">
            <div class="event-invite">
                <PlannerInvite></PlannerInvite>
            </div>
        </div>
    </template>

</template>