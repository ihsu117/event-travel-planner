<script setup>
import {
    PButton,
    PTextField,
    PEvent,
    PProfilePic,
} from '@poseidon-components'
import '@poseidon-styles/index.css'
import { useEventStore } from '../stores/eventStore'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import api from '../assets/scripts/api.js'
import { format } from 'date-fns'

const eventStore = useEventStore()
const userStore = useUserStore()
const router = useRouter()
const events = ref([])
const userInfo = ref({});
const editView = ref(false)
const loading = ref(false)

//Fetch events from the API
onMounted(async () => {
    checkAuth()
    loading.value = true
    try {
        const response = await api.apiFetch('/events', {
            credentials: 'include'
        })
        if (response.ok) {
            const eventsData = await response.json()
            console.log('Events:', eventsData)
            events.value = eventsData
        }
    } catch (error) {
        console.error('Failed to fetch events:', error)
    } finally {
        loading.value = false // Set loading to false after API call
    }
})

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

//Computed properties to check the role of the user
const isAttendee = computed(() => userStore.role_id === 'Attendee')
const isFinance = computed(() => userStore.role_id === 'Finance Manager')
const isEventPlanner = computed(() => userStore.role_id === 'Event Planner')
console.log('Role:', userStore.role_id)

const handleEventClick = async (eventData) => {
    try {
        const response = await api.apiFetch('/events/' + eventData.id, {
            credentials: 'include'
        })
        if (response.ok) {
            eventData = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch the selected event:', error)
    }
    eventStore.setCurrentEvent(eventData)
    if (isAttendee.value) {
        router.push({ name: 'Event' })
    } else if (isFinance.value) {
        router.push({ name: 'Finance' })
    } else if (isEventPlanner.value) {
        router.push({ name: 'Event' })
    }
}

const handleCreateEvent = () => {
    if (isEventPlanner.value) {
        router.push({ name: 'EventCreate' })
    }
}

const handleEditEventClick = async (eventData) => {
    try {
        const response = await api.apiFetch('/events/' + eventData.id, {
            credentials: 'include'
        })
        if (response.ok) {
            eventData = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch the selected event:', error)
    }
    if (isEventPlanner.value) {
        eventStore.setCurrentEvent(eventData);
        router.push({ name: 'Event', query: { editView: 'true', eventID: eventData.id } });
    }
};

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
    }
    closeModal()
}

</script>
<template>
    <!--Modal for User info-->
    <template v-if="isModalVisible">
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
                                <p>{{ userInfo.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') }}</p>
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
                        <PButton label="Edit" design="gradient-small" @click="() => handleModalOption('Edit')">Edit
                        </PButton>
                        <PButton label="Logout" design="gradient-small" @click="() => handleModalOption('Logout')">
                            Logout
                        </PButton>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <!--Home Page for Attendee-->
    <template v-if="isAttendee">
            <div class="home">
                <div class="home-header">

                    <div class="home-header__text">
                        <p>Welcome, {{ userStore.first_name }}</p>
                        <p class="role-bubble">{{ userStore.role_id }}</p>
                    </div>
                    <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
                </div>
                <h1>Upcoming Events</h1>
                <div class="p-event__container">
                    <div v-if="loading" class="spinner">
                        <div class="loading-spinner" v-show="loading">
                            <span class="loader"></span>
                        </div>
                    </div>
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :id="event.id" :organization="event.org"
                        :eventName="event.name" :startDate="new Date(event.startDate)"
                        :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                        :description="event.description" :currentBudget="event.currentBudget"
                        :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                        :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                        design="block" @event-click="handleEventClick" :class="{ 'fade-in': true, 'show': !loading }" />

                </div>
            </div>
    </template>

    <!--Home Page for Finance-->
    <template v-if="isFinance">
            <div class="home">
                <div class="home-header">
                    <div class="home-header__text">
                        <p>Welcome {{ userStore.first_name }} </p>
                        <p class="role-bubble">{{ userStore.role_id }}</p>
                    </div>
                    <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
                </div>
                <h1>Upcoming Events</h1>
                <div class="p-event__container">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :id="event.id" :organization="event.org"
                        :eventName="event.name" :startDate="new Date(event.startDate)"
                        :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                        :description="event.description" :currentBudget="event.currentBudget"
                        :maxBudget="event.maxBudget" :destinationCode="event.destinationCode"
                        :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                        :autoApproveThreshold="event.autoApproveThreshold" design="block-finance"
                        @event-click="handleEventClick" />
                </div>
            </div>
    </template>

    <!--Home Page for Event Planner-->
    <template v-if="isEventPlanner">
            <div class="home">
                <div class="home-header">

                    <div class="home-header__text">
                        <p>Welcome, {{ userStore.first_name }}</p>
                        <p class="role-bubble">{{ userStore.role_id }}</p>
                    </div>
                    <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
                </div>
                <h1>Upcoming Events</h1>
                <div class="p-event__container">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :id="event.id" :organization="event.org"
                        :eventName="event.name" :startDate="new Date(event.startDate)"
                        :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                        :description="event.description" :currentBudget="event.currentBudget"
                        :maxBudget="event.maxBudget" :destinationCode="event.destinationCode"
                        :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                        :autoApproveThreshold="event.autoApproveThreshold" design="block-planner"
                        @editClick="handleEditEventClick(event)" @event-click="handleEventClick(event)" />
                    <PButton label="Create Event" @click="handleCreateEvent" design="planner"></PButton>
                </div>
            </div>
    </template>

</template>