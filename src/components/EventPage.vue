<script setup>

import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter, useRoute } from 'vue-router'
import { PEvent, PButton, PFinanceBlock, PDropDown, PTextField, PFlight } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'
import { usePlacesAutocomplete } from 'vue-use-places-autocomplete'
import VueGoogleAutocomplete from "vue-google-autocomplete"
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const route = useRoute()
const searchDate = ref(null)
const returnDate = ref(null)
const arrivalDate = ref(null)
const zipcode = ref('')
const flightSelected = ref(false)
const editView = ref(route.query.editView === 'true')
const flightType = ref('one-way');
const latitude = ref('');
const longitude = ref('');


//Function to handle the date selection
const handleDateSelect = (date) => {
    const [month, day, year] = date.split('/').map(Number);
    searchDate.value = new Date(year, month - 1, day + 1);
    console.log("Date: ", searchDate.value)
    console.log("Event Date: ", eventStore.currentEvent.startDate)
}

//Function to format the date
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
}

//Creates an array of dates for the dropdown
const dateOptions = computed(() => {
    const dates = []
    const startDate = new Date(eventStore.currentEvent.startDate)

    for (let i = 3; i >= 0; i--) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() - i)
        dates.push(formatDate(date))
    }
    return dates
})

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
    flightStore.clearFlights()
    console.log(eventStore.currentEvent);
    console.log(new Date(searchDate.value).toISOString())
    return api.apiFetch('/flights/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            departure_date: searchDate.value.toISOString().split('T')[0] || eventStore.currentEvent.startDate,
            lat: latitude.value,
            long: longitude.value,
            destination: eventStore.currentEvent.destinationCode,
            type: flightType.value
        })
    }).then(
        response => flightStore.setFlightResults(response.json())
    ).then(
        router.push({ name: 'Flight' })
    )
}
const editableName = ref(eventStore.currentEvent.eventName)
const editableStartDate = ref(eventStore.currentEvent.startDate)
const editableEndDate = ref(eventStore.currentEvent.endDate)
const description = ref(eventStore.currentEvent.description)

// Function to handle the update of the fields for the event
const handleUpdate = ({ field, value }) => {
    if (field === 'name') editableName.value = value
    if (field === 'startDate') editableStartDate.value = value
    if (field === 'endDate') editableEndDate.value = value
    if (field === 'description') description.value = value
}

const saveChanges = async () => {
    console.log('Event ID:', eventStore.currentEvent.id)
    console.log('Editable Name:', editableName.value)
    console.log('Description:', description.value)
    const updatedEvent = {
        name: editableName.value,
        startDate: editableStartDate.value,
        endDate: editableEndDate.value,
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
const checkAndLoadEvent = () => {
    const eventData = localStorage.getItem('currentEvent');
    if (eventData) {
        eventStore.loadCurrentEvent();
    }
}

const checkAndLoadSelectedFlight = () => {
    const selectedFlightData = localStorage.getItem('selectedFlight');
    const isFlightSelected = localStorage.getItem('flightSelected') === 'true';
    if (isFlightSelected && selectedFlightData) {
        flightStore.setCurrentFlight(JSON.parse(selectedFlightData));
        flightSelected.value = true;
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

// Call the function when the component is mounted
onMounted(async () => {
    checkAndLoadEvent()
    checkAndLoadSelectedFlight()
    console.log('Organization:', eventStore.currentEvent.org)
//     try {
//     const [financeResponse, eventResponse] = await Promise.all([
//         api.apiFetch('/user/' + eventStore.currentEvent.financeMan.id, {
//             credentials: 'include'
//         }),
//         api.apiFetch('/events/' + eventStore.currentEvent.id, {
//             credentials: 'include'
//         })
//     ]);

//     if (financeResponse.ok) {
//         const financeMan = await financeResponse.json();
//         financeMan.phoneNum = financeMan.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
//         eventStore.currentEvent.financeMan = financeMan;
//     } else {
//         console.error('Failed to fetch finance manager');
//     }

//     if (eventResponse.ok) {
//         const { createdBy } = await eventResponse.json();
//         createdBy.phoneNum = createdBy.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
//         eventStore.currentEvent.createdBy = createdBy;
//     } else {
//         console.error('Failed to fetch current event');
//     }

// } catch (error) {
//     console.error('One or both requests failed:', error);
// }

})

const departureDateChange = (date) => {
    console.log('Selected Departure Date:', date);
}

</script>

<template>

    <template v-if="editView">
        <div class="phone-container">
            <div class="event-page">
                <div>
                    <PEvent :organization="eventStore.currentEvent.org" :eventName="editableName"
                        :startDate="editableStartDate" :endDate="editableEndDate"
                        :pictureLink="eventStore.currentEvent.pictureLink" design="header-edit" @update="handleUpdate"
                        @back-click="() => handleBack('Home')" />
                </div>
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
                        <svg class="x-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24">
                            <g fill="none" fill-rule="evenodd">
                                <path
                                    d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                <path fill="#4c365d"
                                    d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414z" />
                            </g>
                        </svg>
                        <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                            :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                            jobTitle="Event Planner"
                            :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                            :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                        <PFinanceBlock :email="eventStore.currentEvent.financeMan?.email"
                            :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                            jobTitle="Finance Manager"
                            :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                            :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                    </div>
                </div>
                <div class="event-edit-button">
                    <PButton design="gradient" label="Save Changes" @click="saveChanges" />
                </div>
            </div>
        </div>
    </template>

    <template v-else>
        <div class="phone-container">
            <div class="event-page">
                <div>
                    <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                        :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                        :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                        @back-click="() => handleBack('Home')" />
                </div>
                <div>
                    <h1>Description</h1>
                    <div class="event-description">
                        <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                    </div>
                    <div>
                        <h1>Flight Information</h1>
                        <div class="selected-flight" v-if="flightSelected">
                            <PFlight design="block" v-bind="flightStore.currentFlight"
                                @click="handleFlightClick(flightStore.currentFlight)" />
                        </div>
                        <div class="flight-type">
                            <label>
                                <input type="radio" name="flightType" :value="0" v-model="flightType" />
                                One-Way
                            </label>
                            <label>
                                <input type="radio" name="flightType" :value="1" v-model="flightType" />
                                Roundtrip
                            </label>
                        </div>
                        <div class="p-dropdown__container">
                            <!-- <PTextField design="small" label="Departure Date" type="date" v-model="searchDate">
                            </PTextField> -->
                            <VueDatePicker v-if="flightType=== 0" v-model="searchDate" :enable-time-picker="false" :format="'MM/dd/yyyy'" :placeholder="'Departure Date'" @update:model-value="departureDateChange"></VueDatePicker>
                            <!-- <PTextField v-if="flightType === 'roundtrip'" design="small" label="Return Date" type="date"
                                v-model="returnDate"></PTextField> -->
                            <VueDatePicker v-if="flightType === 1" :range="true" :enable-time-picker="false" v-model="returnDate" :format="'MM/dd/yyyy'" :placeholder="'Departure & Return'"></VueDatePicker>
                            <vue-google-autocomplete class="p-textfield--small" id="map" types="airport" country="us" classname="form-control" placeholder="Start typing" v-on:placechanged="handlePlaceChanged">
                            </vue-google-autocomplete>
                        </div>
                        <PButton design="gradient" label="Search for Flights" @click="toFlightSearch" />
                    </div>


                    <h1>Planning Team</h1>
                    <div class="finance-info">
                        <PFinanceBlock :email="eventStore.currentEvent.createdBy?.email"
                            :name="eventStore.currentEvent.createdBy?.firstName + ' ' + eventStore.currentEvent.createdBy?.lastName"
                            jobTitle="Event Planner"
                            :phoneNum="eventStore.currentEvent.createdBy?.phoneNum"
                            :profileImage="eventStore.currentEvent.createdBy?.profilePic"></PFinanceBlock>
                        <PFinanceBlock :email="eventStore.currentEvent.financeMan?.email"
                            :name="eventStore.currentEvent.financeMan?.firstName + ' ' + eventStore.currentEvent.financeMan?.lastName"
                            jobTitle="Finance Manager"
                            :phoneNum="eventStore.currentEvent.financeMan?.phoneNum"
                            :profileImage="eventStore.currentEvent.financeMan?.profilePic"></PFinanceBlock>
                    </div>
                </div>
            </div>
        </div>
    </template>

</template>