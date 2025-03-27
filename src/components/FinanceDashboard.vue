<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PTextField, PFlight } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()

const isModalVisible = ref(false)
const flightSelected = ref(null)

const isEditModalVisible = ref(false)
const modalBudget = eventStore.currentEvent?.maxBudget || 0;
const modalAuto = eventStore.currentEvent?.autoapprove || false;
const modalThreshold = eventStore.currentEvent?.autoapprove_threshold || 0;

const openEditModal = () => {
    isEditModalVisible.value = true
}

const closeEditModal = () => {
    isEditModalVisible.value = false
}

// Function to save the updated value
const saveUpdatedValue = async () => {
    try {
        const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maxBudget: modalBudget.value,
                autoapprove: modalAuto.value,
                autoapprove_threshold: modalThreshold.value
            })
        })
        if (response.ok) {

            closeEditModal()
        } else {
            console.error('Failed to update value:', await response.text())
        }
    } catch (error) {
        console.error('Error updating value:', error)
    }
}

onMounted(async () => {
    try {
        const response = await api.apiFetch(`/flights/eventflights/${eventStore.currentEvent.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            flightStore.setEventFlightResults(response.json())

        }
    } catch (error) {
        console.error('Failed to fetch flights:', error)
    }
})

//Send flightID back with approval
const updateFlight = async () => {
    try {
        const response = await api.apiFetch('/flights/booking/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                flightID: flightSelected.id
            }
        })
    } catch (error) {
        console.log(error);
    }
}

// Function to open the modal
const openModal = (flight) => {
    flightSelected.value = flight
    isModalVisible.value = true
}

// Function to close the modal
const closeModal = () => {
    isModalVisible.value = false
    flightSelected.value = null
}

// Function to handle modal option selection
const handleModalOption = (option) => {
    console.log(`Selected option: ${option}`)

    if(option == "Approve") {

    }

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
                    <h2 :style="{ color: budgetColor }">${{ eventStore.currentEvent.currentBudget }}/${{
                        eventStore.currentEvent.maxBudget }}</h2>
                    <div>
                        <h1>Auto Approve</h1>
                        <h3>{{ eventStore.currentEvent.autoapprove }}</h3>
                    </div>
                    <div>
                        <h1>Threshold</h1>
                        <h3>{{ eventStore.currentEvent.autoapprove_threshold }}</h3>
                    </div>
                    <svg @click="openEditModal('Threshold', eventStore.currentEvent.autoapprove_threshold, 'autoapprove_threshold')"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M8.707 19.707L18 10.414L13.586 6l-9.293 9.293a1 1 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263M21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586L19.414 9z" />
                    </svg>
                </div>
                <div class="flight-container">
                    <h3>Waiting for Approval</h3>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightStore.flightResults"
                            :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                            :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                            :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                            :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                            :flightType="flight.flightType" :flightClass="flight.flightClass"
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"
                            @click="openModal(flight)" />
                    </div>
                </div>

                <div class="flight-container">
                    <h3>Transaction History</h3>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightStore.flightResults"
                            :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                            :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                            :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                            :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                            :flightType="flight.flightType" :flightClass="flight.flightClass"
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"
                            @click="openModal(flight)" />
                    </div>
                </div>

                <div v-if="isEditModalVisible">
                    <div class="modal-overlay" @click="closeEditModal"></div>
                    <div class="modal">

                        <div>
                            <h2>Budget</h2>
                            <input v-model="modalBudget" type="text" />
                        </div>

                        <div>
                            <h2>Auto Approve</h2>
                            <input v-model="modalAuto" name="modalAuto" type="radio" id="autoapprove-yes"
                                :value="true" />
                            <label for="autoapprove-yes">Yes</label>
                            <input v-model="modalAuto" name="modalAuto" type="radio" id="autoapprove-no"
                                :value="false" />
                            <label for="autoapprove-no">No</label>
                        </div>

                        <div v-if="modalAuto">
                            <h2>Threshold</h2>
                            <input v-model="modalThreshold" type="text" />
                        </div>

                        <div class="modal-options">
                            <button @click="saveUpdatedValue">Save</button>
                        </div>
                    </div>
                </div>

                <div v-if="isModalVisible">
                    <div class="modal-overlay" @click="closeModal"></div>
                    <div class="modal">
                        <PFlight v-if="flightSelected" :flightClass="flightSelected.flightClass"
                            :price="flightSelected.price" :airline="flightSelected.airline"
                            :logoURL="flightSelected.logoURL" :flightDepTime="flightSelected.flightDepTime"
                            :flightArrTime="flightSelected.flightArrTime" design="finance" style=""></PFlight>

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