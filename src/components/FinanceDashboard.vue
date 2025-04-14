<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import { PEvent, PTextField, PFlight, PButton, PProfilePic } from '@poseidon-components'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import api from '../assets/scripts/api.js'
import HeaderBar from './Headerbar.vue'
import { format, parseISO } from 'date-fns';


const eventStore = useEventStore()
const flightStore = useFlightStore()
const userStore = useUserStore()
const router = useRouter()
const userInfo = ref({});
const loading = ref(false)

const isApproveModalVisible = ref(false)
const flightSelected = ref(null)

const isEditModalVisible = ref(false)
const editModalBudget = ref('')
const editModalAuto = ref()
const editModalThreshold = ref('')

const openEditModal = () => {
    isEditModalVisible.value = true
}

const closeEditModal = () => {
    isEditModalVisible.value = false
}

//Computed properties to check the role of the user
const isAttendee = computed(() => userStore.role_id === 'Attendee')
const isFinance = computed(() => userStore.role_id === 'Finance Manager')
const isEventPlanner = computed(() => userStore.role_id === 'Event Planner')
const isAdmin = computed(() => userStore.role_id === 'Org Admin')
const isSiteAdmin = computed(() => userStore.role_id === 'Site Admin')
console.log('Role:', userStore.role_id)

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
                maxBudget: editModalBudget.value,
                autoApprove: Boolean(editModalAuto.value),
                autoApproveThreshold: Number(editModalThreshold.value) || 0
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
    loading.value = true;
    checkAndLoadEvent()
    await loadEventHistory();
    await getFlightsData();
    loading.value = false;
})

const getFlightsData = async() => {
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
}

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
            await getFlightsData();
            await loadEventHistory();
            console.log("booked flight")
        }
    } catch (error) {
        console.log(error);
    }
}

// Function to open the modal
const openApproveModal = (flight) => {
    console.log(flight);
    flightSelected.value = flight
    isApproveModalVisible.value = true
}

// Function to close the modal
const closeApproveModal = () => {
    isApproveModalVisible.value = false
    flightSelected.value = null
}

// Function to handle modal option selection
const handleApproveModalOption = (option) => {
    console.log(`Selected option: ${option}`)

    if (option == "Approve") {
        updateFlight(1)
    } else {
        updateFlight(0)
    }

    closeApproveModal()
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

// var eventHistory = ref([])
const eventHistory = ref([]); // Reactive variable to store the event history

const loadEventHistory = async () => {
    try {
        const response = await getEventHistory(); // Call the API function
        if (response && response.history) {
            eventHistory.value = response.history; // Update the reactive variable
            console.log('Event history loaded:', eventHistory.value);
        } else {
            console.warn('No history found in the response.');
            eventHistory.value = []; // Set to an empty array if no history is found
        }
    } catch (error) {
        console.error('Failed to load event history:', error);
        eventHistory.value = []; // Handle errors by resetting the variable
    }
};

const getEventHistory = async () => {
    try {
        const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch event history:', await response.text());
            return null; // Return null if the response is not OK
        }
    } catch (error) {
        console.error('Failed to fetch event history:', error);
        return null; // Return null in case of an error
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

const isMobile = ref(window.innerWidth <= 768);

const updateScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
};

//Fetch from the API
onMounted(async () => {
    window.addEventListener('resize', updateScreenSize);
})


onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
});

//THE USER PROFILE MODAL
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


const handleOrgClick = (org) => {
    router.push({ name: 'OrgList', params: { orgId: org.id } });
}

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

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Invalid Date'; // Handle null or undefined timestamps
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

</script>

<template>
    <!-- -----------------------------------------------------------MODAL------------------------------------------------------->
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
    <template v-if="!isMobile && (isFinance || isEventPlanner || isAdmin || isSiteAdmin)">
        <div class="finance-dashboard-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' backButton/>
            </div>

            <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
                :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                :pictureLink="eventStore.currentEvent.pictureLink" design="desktop-header"
                @back-click="() => handleBack('Home')" />

            <div class="finance-desktop-content">
                <div class="finance-event-info">
                    <div class="finance-event-desc">
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
                            <PTextField v-model="editModalBudget" id="budget-amount" class="modal-input" type="number"
                                placeholder="Enter amount" />

                            <label class="modal-label">Auto Approve</label>
                            <label class="switch">
                                <input type="checkbox" v-model="editModalAuto" />
                                <span class="slider round"></span>
                            </label>

                            <div v-if="editModalAuto" class="threshold-container">
                                <label class="modal-label" for="threshold">Threshold</label>
                                <PTextField v-model="editModalThreshold" id="threshold" class="modal-input" type="number"
                                    placeholder="Enter threshold" />
                            </div>

                            <div class="modal-options">
                                <PButton design="gradient-small" label="Save" @click="saveUpdatedValue"></PButton>
                            </div>
                        </div>
                    </div>

                    <div v-if="isApproveModalVisible">
                        <div class="modal-overlay" @click="closeApproveModal"></div>
                        <div class="modal">

                            <!-- <div>{{flightSelected}}</div> -->
                            <PFlight v-if="flightSelected" :flightClass="flightSelected.flightClass"
                                :price="flightSelected.price" :airline="flightSelected.airline" :flightDate="flightSelected.flightDate"
                                :logoURL="flightSelected.itinerary.logoURL" :flightDepTime="flightSelected.flightDepTime"
                                :flightArrTime="flightSelected.flightArrTime" :flightID="flightSelected.flightID" :passangerName="flightSelected.owner"
                                design="finance" style=""></PFlight>

                            <div class="modal-options">
                                <h2 class="modal-approve" @click="handleApproveModalOption('Approve')">Approve</h2>
                                <h2 class="modal-deny" @click="handleApproveModalOption('Deny')">Deny</h2>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="finance-items-cont">
                    <div class="finance-item">
                        <h3>Waiting for Approval</h3>
                        <div class="finance-approval-cont">
                            <PFlight v-for="(flight, index) in flightStore.flightResults"
                                :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="finance"
                                :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
                                :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime"
                                :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable" :price="flight.price"
                                :flightType="flight.flightType" :flightClass="flight.flightClass" :passangerName="flight.owner"
                                :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.itinerary.logoURL"
                                :flightID="String(flight.flightID)" @click="openApproveModal(flight)" />
                        </div>

                        <div v-if="!loading && flightStore.flightResults.length == 0" style="color: black;">
                            <p>No approvals at the moment! :)</p>
                        </div>
                    </div>

                <div class="finance-items-cont">
                    <div class="finance-item">
                        <div class="finance-flight-title">
                            <h3>Transaction History</h3>
                            <PButton design="gradient-small" label="Get Report" @click="exportEventHistory"></PButton>
                        </div>
                    </div>
                        <div v-if="eventHistory.length > 0">
                            <div class="finance-approval-cont">
                                <div v-for="(event, index) in eventHistory" class="history-card" :key="index">
                                    <h4>{{ formatTimestamp(event.lastEdited)}}</h4>
                                    <p>Created By: {{ event.updater.firstName }} {{ event.updater.lastName }}</p>
                                    <p v-if="event.updatedBudget != null">Budget Update: {{event.originalBudget}} -> {{event.updatedBudget}}</p>
                                    <p v-if="event.updatedAutoApprovethreshold != null">AA Threshold: {{event.originalAutoApproveThreshold}} -> {{event.updatedAutoApprovethreshold}}</p>
                                    <div v-if="event.approvedFlight != null" class="approved-card">
                                        <p>Order #: {{ event.approvedFlight.order_id || 'NA'}}</p>
                                        <p>Flight #: {{ event.approvedFlight.flight_number || 'NA'}}</p>
                                        <p>Cost: ${{ event.approvedFlight.price }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p style="color: black; justify-self: center;">No event history available.</p>
                        </div>
                </div>

                </div>
            </div>
        </div>
    </template>

    <!-- ----------------------------------------------------------MOBILE------------------------------------------------------->
    <template v-if="isMobile && (isFinance || isEventPlanner || isAdmin || isSiteAdmin)">
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
                            :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.itinerary.logoURL"
                            :flightID="flight.flightID" @click="openApproveModal(flight)" />
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
                            :flightID="flight.flightID" @click="openApproveModal(flight)" />
                    </div>
                </div>

                <div v-if="isEditModalVisible">
                    <div class="modal-overlay" @click="closeEditModal"></div>
                    <div class="modal budget-modal">
                        <h2 class="modal-title">Set Budget</h2>

                        <label class="modal-label" for="budget-amount">Amount</label>
                        <PTextField v-model="editModalBudget" id="budget-amount" class="modal-input" type="number"
                            placeholder="Enter amount" />

                        <label class="modal-label">Auto Approve</label>
                        <label class="switch">
                            <input type="checkbox" v-model="editModalAuto" />
                            <span class="slider round"></span>
                        </label>

                        <div v-if="editModalAuto" class="threshold-container">
                            <label class="modal-label" for="threshold">Threshold</label>
                            <PTextField v-model="editModalThreshold" id="threshold" class="modal-input" type="number"
                                placeholder="Enter threshold" />
                        </div>

                        <div class="modal-options">
                            <PButton design="gradient-small" label="Save" @click="saveUpdatedValue"></PButton>
                        </div>
                    </div>
                </div>

                <div v-if="isApproveModalVisible">
                    <div class="modal-overlay" @click="closeApproveModal"></div>
                    <div class="modal">
                        <PFlight v-if="flightSelected" :flightClass="flightSelected.flightClass"
                            :price="flightSelected.price" :airline="flightSelected.airline"
                            :logoURL="flightSelected.logoURL" :flightDepTime="flightSelected.flightDepTime"
                            :flightArrTime="flightSelected.flightArrTime" :flightID="flightSelected.flightID"
                            design="finance" style=""></PFlight>

                        <div class="modal-options">
                            <h2 class="modal-approve" @click="handleApproveModalOption('Approve')">Approve</h2>
                            <h2 class="modal-deny" @click="handleApproveModalOption('Deny')">Deny</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </template>
</template>
