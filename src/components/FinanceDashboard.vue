<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PTextField, PFlight } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'

const eventStore = useEventStore()
const router = useRouter()

const isModalVisible = ref(false)
const flightData = ref([])

onMounted(async () => {
    try {
        const response = await api.apiFetch(`/flights/eventflights?id=${eventStore.currentEvent.id}`, {
            credentials: 'include'
        })
        if (response.ok) {
            flightData.value = await response.json()
            console.log('flights:', flightData.value)
        }
    } catch (error) {
        console.error('Failed to fetch flights:', error)
    }
})


//Function to format the date
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
}


// Function to open the modal
const openModal = () => {
    isModalVisible.value = true
}

// Function to close the modal
const closeModal = () => {
    isModalVisible.value = false
}

// Function to handle modal option selection
const handleModalOption = (option) => {
    console.log(`Selected option: ${option}`)
    closeModal()
}

//Function to handle the back button
const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

const budgetColor = computed(() => {
    const budgetThreshold = eventStore.currentEvent.maxBudget * 0.3;
    if (eventStore.currentEvent.currentBudget > budgetThreshold) {
        return 'var(--pos-green)';
    } else if (eventStore.currentEvent.currentBudget >= 0) {
        return 'var(--pos-yellow)';
    } else {
        return 'var(--pos-red)';
    }
});
</script>

<template>
    <div class="phone-container">
        <div class="finance-dashboard">
            <div>
                <PEvent :organization="eventStore.currentEvent.organization" :name="eventStore.currentEvent.name"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                    @back-click="() => handleBack('Home')" />
            </div>
            <div class="content-grid">
                <h1>Description</h1>
                <div class="event-description">
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <div class="budget-container">
                    <h1>Budget: </h1>
                    <h2 :style="{ color: budgetColor }">${{ eventStore.currentEvent.currentBudget }}/${{ eventStore.currentEvent.maxBudget }}</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M8.707 19.707L18 10.414L13.586 6l-9.293 9.293a1 1 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263M21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586L19.414 9z" />
                    </svg>
                </div>

                <div class="flight-container">
                    <h3>Waiting for Approval</h3>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightData"
          :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance" :flightDate="flight.flightDate"
          :origin="flight.origin" :destination="flight.destination" :flightDepTime="flight.flightDepTime"
          :flightArrTime="flight.flightArrTime" :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable"
          :price="flight.price" :flightType="flight.flightType" :flightClass="flight.flightClass"
          :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"/>
                    </div>
                </div>

                <div class="flight-container">
                    <h3>Transaction History</h3>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightData"
          :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance" :flightDate="flight.flightDate"
          :origin="flight.origin" :destination="flight.destination" :flightDepTime="flight.flightDepTime"
          :flightArrTime="flight.flightArrTime" :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable"
          :price="flight.price" :flightType="flight.flightType" :flightClass="flight.flightClass"
          :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL" />
                    </div>
                </div>

                <div v-if="isModalVisible">
                    <div class="modal-overlay" @click="closeModal"></div>
                    <div class="modal">
                        <PFlight flightClass="Economy" :price="142" airline="United"
                            logoURL="https://companieslogo.com/img/orig/UAL-44813086.png?t=1720244494"
                            flightDepTime="2:30" flightArrTime="4:30" design="finance" style=""></PFlight>

                        <div class="modal-options">
                            <h2 class="modal-approve" @click="handleModalOption('Approve')">Approve</h2>
                            <h2 class="modal-deny" @click="handleModalOption('Deny')">Deny</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>