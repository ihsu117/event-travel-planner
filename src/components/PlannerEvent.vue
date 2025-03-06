<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PFinanceBlock, PDropDown, PTextField } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const searchDate = ref(null)
const arrivalDate = ref(null)
const zipcode = ref('')

//Function to handle the date selection
const handleDateSelect = (date) => {
    const [month, day, year] = date.split('/').map(Number);
    searchDate.value = new Date(year, month - 1, day + 1);
    console.log("Date: ", searchDate.value)
    console.log("Event Date: ", eventStore.currentEvent.startDate)
}

//Function to handle the back button
const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

// Function to check and load event data from localStorage
const checkAndLoadEvent = () => {
    const eventData = localStorage.getItem('currentEvent');
    if (eventData) {
        eventStore.loadCurrentEvent();
    }
}

// Call the function when the component is mounted
onMounted(() => {
    checkAndLoadEvent();
});

</script>

<!-- <template>
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

                    <h1>Finance Team</h1>
                    <div class="finance-info">
                        <PFinanceBlock design="p-finance" email="TWagner49@gmail.com" name="Timothy Wagner"
                            jobTitle="Finance Manager" phoneNum="246-123-5124" profileImage=""></PFinanceBlock>
                    </div>
                </div>
            </div>
        </div>
    </template> -->

<template>
    <div class="phone-container">
        <div class="event-page">
            <h2>Create an Event</h2>
            <div class="event-form">
                <PTextField label="Event Name" v-model="eventName" />
                <PTextField label="description" v-model="description" />
                <PTextField label="Start Date" v-model="startDate" />
                <PTextField label="End Date" v-model="endDate" />
                <PTextField label="Picture Link" v-model="pictureLink" />
                <PTextField label="Max Budget" v-model="maxBudget" />
            </div>
            <PButton label="Create Event" @click="" design="gradient"></PButton>
        </div>
    </div>
</template>