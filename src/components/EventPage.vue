<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PFinanceBlock, PDropDown, PTextField, PFlight } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const searchDate = ref(null)
const arrivalDate = ref(null)
const zipcode = ref('')
const flightSelected = ref(false)
const editView = ref(false)

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
    router.push({ name: targetRoute });
}

//Function to handle the flight click
const handleFlightClick = (flight) => {
    flightStore.setCurrentFlight(flight)
    router.push({ name: 'FlightItinerary' })
}


//Function to search for flights with Duffel API
const toFlightSearch = () => {
    return api.apiFetch('/flights/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination: "JFK",
            departure_date: searchDate.value || eventStore.currentEvent.startDate,
            zip: zipcode.value
        })
    }).then(
        response => flightStore.setFlightResults(response.json())
    ).then(
        router.push({ name: 'Flight' })
    )
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

// Call the function when the component is mounted
onMounted(async () => {
    checkAndLoadEvent();
    checkAndLoadSelectedFlight();
    try {
        const response = await api.apiFetch('/user/' + eventStore.currentEvent.financeMan.id, {
            credentials: 'include'
        })
        if (response.ok) {
            eventStore.currentEvent.financeMan = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch finance manager:', error)
    }
});

</script>

<template>
    <div class="phone-container">
        <div class="event-page">
            <div>
                <PEvent :organization="eventStore.currentEvent.organization" :name="eventStore.currentEvent.name"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                    @back-click="() => handleBack('Home')" />
            </div>
            <div>
                <h1>Description</h1>
                <div class="event-description">
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <h1>Budget</h1>
                <div class="event-budget">
                    <p>Company will list budget here.</p>
                    <p> Plane Ticket - $230</p>
                    <p> Current Budget - ${{ eventStore.currentEvent.currentBudget }}</p>
                </div>
                <div>
                    <h1>Flight Information</h1>
                    <div class="selected-flight" v-if="flightSelected">
                        <PFlight design="block" v-bind="flightStore.currentFlight"
                            @click="handleFlightClick(flightStore.currentFlight)" />
                    </div>
                    <div class="p-dropdown__container">
                        <PDropDown design="event" dropDownLabel="Departure Date" :options="dateOptions"
                            @option-selected="handleDateSelect" v-model="searchDate">
                        </PDropDown>
                        <PDropDown design="event" dropDownLabel="Arrival Date" :options="dateOptions"
                            @option-selected="" v-model="arrivalDate">
                        </PDropDown>
                        <PTextField design="small" v-model="zipcode" label="Zip Code"></PTextField>
                    </div>
                    <PButton design="gradient" label="Book Your Flight Here Now!" @click="toFlightSearch" />
                </div>


                <h1>Finance Team</h1>
                <div class="finance-info">
                    <PFinanceBlock design="p-finance" :email="eventStore.currentEvent.financeMan.email"
                        :name="eventStore.currentEvent.financeMan.firstName + ' ' + eventStore.currentEvent.financeMan.lastName"
                        :jobTitle="eventStore.currentEvent.financeMan.role"
                        :phoneNum="eventStore.currentEvent.financeMan.phoneNum"
                        :profileImage="eventStore.currentEvent.financeMan.profilePic"></PFinanceBlock>
                </div>
            </div>
        </div>
    </div>
</template>