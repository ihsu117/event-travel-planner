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

const eventStore = useEventStore()
const userStore = useUserStore()
const router = useRouter()
const events = ref([])
const userInfo = ref({});

//Fetch events from the API
onMounted(async () => {
    checkAuth()
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

const handleEventClick = (eventData) => {
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
        router.push({ name: 'Planner' })
    }
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
    }
    closeModal()
}

const handleEditEventClick = (eventData) => {
    router.push({
        name: 'Planner',
        query: { edit: true, event: JSON.stringify(eventData) }
    });
};

</script>
<template>

    <!--Home Page for Attendee-->
    <template v-if="isAttendee">
        <div class="phone-container">
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
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :organization="event.org.name" :name="event.name"
                        :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                        :pictureLink="event.pictureLink" :description="event.description"
                        :currentBudget="event.currentBudget" :financeMan="event.financeMan" design="block"
                        @event-click="handleEventClick" />

                </div>
            </div>
        </div>
    </template>

    <!--Home Page for Finance-->
    <template v-if="isFinance">
        <div class="phone-container">
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
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :organization="event.org.name" :name="event.name"
                        :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                        :pictureLink="event.pictureLink" :description="event.description"
                        :currentBudget="event.currentBudget" :maxBudget="event.maxBudget" :financeMan="event.financeMan"
                        design="block-finance" @event-click="handleEventClick" />
                </div>
            </div>
        </div>
    </template>

    <!--Home Page for Event Planner-->
    <template v-if="isEventPlanner">
        <div class="phone-container">
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
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :organization="event.org.name" :name="event.name"
                        :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                        :pictureLink="event.pictureLink" :description="event.description"
                        :currentBudget="event.currentBudget" :financeMan="event.financeMan" design="block-planner"
                        @event-click="handleEventClick" @editClick="handleEditEventClick"/>
                    <PButton label="Create Event" @click="handleCreateEvent" design="planner"></PButton>
                </div>
            </div>
        </div>
    </template>

    <!--Modal for User info-->
    <template v-if="isModalVisible">
        <div class="phone-container">
            <div class="modal-overlay" @click="closeModal"></div>
            <div class="modal-container">
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
                                <p>{{ userInfo.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') }}</p>
                            </div>
                            <div class="profile-content">
                                <h5>Known Travel Number</h5>
                                <p>{{ userInfo.known_traveler_number }}</p>
                            </div>
                            <div class="profile-content">
                                <h5>Gender</h5>
                                <p>{{ userInfo.gender }}</p>
                            </div>
                            <!-- <div class="profile-content">
                            <h5>Date of Birth</h5>
                            <p>{{ userInfo.dob }}</p>
                        </div> -->
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

</template>