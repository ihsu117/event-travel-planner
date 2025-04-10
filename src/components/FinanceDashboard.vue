<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import { PEvent, PTextField, PFlight, PButton } from '@poseidon-components'
import { computed, ref, onMounted } from 'vue'
import api from '../assets/scripts/api.js'
import HeaderBar from './Headerbar.vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const userStore = useUserStore()
const router = useRouter()

const isModalVisible = ref(false)
const flightSelected = ref(null)

const isEditModalVisible = ref(false)
const modalBudget = ref('')
const modalAuto = ref()
const modalThreshold = ref('')

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
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maxBudget: modalBudget.value,
                autoApprove: Boolean(modalAuto.value),
                autoApproveThreshold: Number(modalThreshold.value) || 0
            })
        })
        if (response.ok) {
            closeEditModal()
            checkAndLoadEvent()
            window.location.reload()
        } else {
            console.error('Failed to update value:', await response.text())
        }
    } catch (error) {
        console.error('Error updating value:', error)
    }
}

const checkAndLoadEvent = () => {
    const eventData = localStorage.getItem('currentEvent');
    if (eventData) {
        eventStore.loadCurrentEvent();
    }
}

onMounted(async () => {
    checkAndLoadEvent()
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
const updateFlight = async (selection) => {
    console.log(flightSelected)
    try {
        const response = await api.apiFetch('/flights/booking', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: flightSelected.value.flightID,
                price: flightSelected.value.price,
                eventID: eventStore.currentEvent.id,
                selection: Boolean(selection)
            })
        })
        if (response.ok) {
            console.log("booked flight")
        }
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

    if (option == "Approve") {
        updateFlight(1)
    } else {
        updateFlight(0)
    }

    closeModal()
}

//Function to handle the back button
const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

// Function to handle exporting event history
const exportEventHistory = async () => {
    try {
        const response = await api.apiFetch(`/events/history/${eventStore.currentEvent.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                // Optional: Specify accepted content type if needed
                // 'Accept': 'text/csv' 
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Determine filename (you might get this from Content-Disposition header or set a default)
            a.download = `event_history_${eventStore.currentEvent.id}.csv`; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log('Event history exported successfully.');
        } else {
            console.error('Failed to export event history:', response.status, await response.text());
            // Handle error display to the user if needed
        }
    } catch (error) {
        console.error('Error exporting event history:', error);
        // Handle error display to the user if needed
    }
};

const budgetColor = computed(() => {
    const budgetThreshold = eventStore.currentEvent.maxBudget * 0.3;
    if (eventStore.currentEvent.maxBudget > budgetThreshold) {
        return 'var(--pos-green)';
    } else if (eventStore.currentEvent.maxBudget >= 0) {
        return 'var(--pos-yellow)';
    } else {
        return 'var(--pos-red)';
    }
});

console.log(eventStore.currentEvent.id)
</script>
<template>
    <!-- -----------------------------------------------------------DESKTOP------------------------------------------------------->
    <template v-if="!isMobile">
        <div class="finance-dashboard-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture'/>
            </div>

            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="desktop-header"
                @back-click="() => handleBack('Home')" />

            <div class="event-desktop-content">
                <div class="event-date-desktop">
                    <h2>Description</h2>
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <div class="budget-card">
                    <div class="budget-card-header">
                        <h3>Event Budget Settings</h3>
                        <svg @click="openEditModal" class="budget-edit-icon" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <path
                                d="M8.707 19.707L18 10.414L13.586 6l-9.293 9.293a1 1 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263M21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586L19.414 9z" />
                        </svg>
                    </div>
                    <div class="budget-card-row">
                        <span class="budget-card-label">Budget:</span>
                        <span class="budget-card-value budget-green">
                            {{ new Intl.NumberFormat('en-US', {
                                style: 'currency', currency: 'USD'
                            }).format(eventStore.currentEvent.maxBudget) }}
                        </span>
                    </div>
                    <div class="budget-card-row">
                        <span class="budget-card-label">Auto Approve:</span>
                        <span class="budget-card-value">
                            {{ eventStore.currentEvent.autoapprove ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                    <div class="budget-card-row" v-if="eventStore.currentEvent.autoapprove">
                        <span class="budget-card-label">Threshold:</span>
                        <span class="budget-card-value">
                            {{ new Intl.NumberFormat('en-US', {
                                style: 'currency', currency: 'USD'
                            }).format(eventStore.currentEvent.autoapprove_threshold) }}
                        </span>
                    </div>
                </div>

                <div v-if="isEditModalVisible">
                    <div class="modal-overlay" @click="closeEditModal"></div>
                    <div class="modal budget-modal">
                        <h2 class="modal-title">Set Budget</h2>

                        <label class="modal-label" for="budget-amount">Amount</label>
                        <PTextField v-model="modalBudget" id="budget-amount" class="modal-input" type="number"
                            placeholder="Enter amount" />

                        <label class="modal-label">Auto Approve</label>
                        <label class="switch">
                            <input type="checkbox" v-model="modalAuto" />
                            <span class="slider round"></span>
                        </label>

                        <div v-if="modalAuto" class="threshold-container">
                            <label class="modal-label" for="threshold">Threshold</label>
                            <PTextField v-model="modalThreshold" id="threshold" class="modal-input" type="number"
                                placeholder="Enter threshold" />
                        </div>

                        <div class="modal-options">
                            <PButton design="gradient-small" label="Save" @click="saveUpdatedValue"></PButton>
                        </div>
                    </div>
                </div>

                <div v-if="isModalVisible">
                    <div class="modal-overlay" @click="closeModal"></div>
                    <div class="modal">
                        <PFlight v-if="flightSelected" :flightClass="flightSelected.flightClass"
                            :price="flightSelected.price" :airline="flightSelected.airline"
                            :logoURL="flightSelected.logoURL" :flightDepTime="flightSelected.flightDepTime"
                            :flightArrTime="flightSelected.flightArrTime" :flightID="flightSelected.flightID"
                            design="finance" style=""></PFlight>

                        <div class="modal-options">
                            <h2 class="modal-approve" @click="handleModalOption('Approve')">Approve</h2>
                            <h2 class="modal-deny" @click="handleModalOption('Deny')">Deny</h2>
                        </div>
                    </div>
                </div>

            </div>

            <div class="finance-flight-cont">
                <div class="flight-container">
                    <h3>Waiting for Approval</h3>
                    <Button class="hiddenB"></Button>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightStore.flightResults"
                            :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                            :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                            :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                            :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                            :flightType="flight.flightType" :flightClass="flight.flightClass" :passangerName="flight.owner"
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"
                            :flightID="flight.flightID" @click="openModal(flight)" />
                    </div>
                </div>

                <div class="flight-container">
                    <h3>Transaction History</h3>
                    <PButton design="gradient-small" label="Get Report" @click="exportEventHistory"></PButton>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightStore.flightResults"
                            :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                            :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                            :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                            :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                            :flightType="flight.flightType" :flightClass="flight.flightClass" :passangerName="flight.owner"
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"
                            :flightID="flight.flightID" @click="openModal(flight)" />
                    </div>
                </div>
            </div>

        </div>
    </template>

    <!-- ----------------------------------------------------------MOBILE------------------------------------------------------->
    <template v-if="isMobile">
        <div class="finance-dashboard">
                <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                    @back-click="() => handleBack('Home')" />
            <div class="content-grid">
                <h1>Description</h1>
                <div class="event-description">
                    <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>
                </div>
                <div class="budget-card">
                    <div class="budget-card-header">
                        <h3>Event Budget Settings</h3>
                        <svg @click="openEditModal" class="budget-edit-icon" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <path
                                d="M8.707 19.707L18 10.414L13.586 6l-9.293 9.293a1 1 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263M21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586L19.414 9z" />
                        </svg>
                    </div>
                    <div class="budget-card-row">
                        <span class="budget-card-label">Budget:</span>
                        <span class="budget-card-value budget-green">
                            {{ new Intl.NumberFormat('en-US', {
                                style: 'currency', currency: 'USD'
                            }).format(eventStore.currentEvent.maxBudget) }}
                        </span>
                    </div>
                    <div class="budget-card-row">
                        <span class="budget-card-label">Auto Approve:</span>
                        <span class="budget-card-value">
                            {{ eventStore.currentEvent.autoapprove ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                    <div class="budget-card-row" v-if="eventStore.currentEvent.autoapprove">
                        <span class="budget-card-label">Threshold:</span>
                        <span class="budget-card-value">
                            {{ new Intl.NumberFormat('en-US', {
                                style: 'currency', currency: 'USD'
                            }).format(eventStore.currentEvent.autoapprove_threshold) }}
                        </span>
                    </div>
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
                            :flightID="flight.flightID" @click="openModal(flight)" />
                    </div>
                </div>

                <div class="flight-container">
                    <h3>Transaction History</h3>
                    <PButton design="gradient-small" label="Get Report" @click="exportEventHistory"></PButton>
                    <div class="p-event__container">
                        <PFlight v-for="(flight, index) in flightStore.flightResults"
                            :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                            :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                            :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                            :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                            :flightType="flight.flightType" :flightClass="flight.flightClass"
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL"
                            :flightID="flight.flightID" @click="openModal(flight)" />
                    </div>
                </div>

                <div v-if="isEditModalVisible">
                    <div class="modal-overlay" @click="closeEditModal"></div>
                    <div class="modal budget-modal">
                        <h2 class="modal-title">Set Budget</h2>

                        <label class="modal-label" for="budget-amount">Amount</label>
                        <PTextField v-model="modalBudget" id="budget-amount" class="modal-input" type="number"
                            placeholder="Enter amount" />

                        <label class="modal-label">Auto Approve</label>
                        <label class="switch">
                            <input type="checkbox" v-model="modalAuto" />
                            <span class="slider round"></span>
                        </label>

                        <div v-if="modalAuto" class="threshold-container">
                            <label class="modal-label" for="threshold">Threshold</label>
                            <PTextField v-model="modalThreshold" id="threshold" class="modal-input" type="number"
                                placeholder="Enter threshold" />
                        </div>

                        <div class="modal-options">
                            <PButton design="gradient-small" label="Save" @click="saveUpdatedValue"></PButton>
                        </div>
                    </div>
                </div>

                <div v-if="isModalVisible">
                    <div class="modal-overlay" @click="closeModal"></div>
                    <div class="modal">
                        <PFlight v-if="flightSelected" :flightClass="flightSelected.flightClass"
                            :price="flightSelected.price" :airline="flightSelected.airline"
                            :logoURL="flightSelected.logoURL" :flightDepTime="flightSelected.flightDepTime"
                            :flightArrTime="flightSelected.flightArrTime" :flightID="flightSelected.flightID"
                            design="finance" style=""></PFlight>

                        <div class="modal-options">
                            <h2 class="modal-approve" @click="handleModalOption('Approve')">Approve</h2>
                            <h2 class="modal-deny" @click="handleModalOption('Deny')">Deny</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </template>
</template>
