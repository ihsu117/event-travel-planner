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
    }
}

const isModalVisible = ref(false)

// Function to open the modal
const openModal = () => {
    isModalVisible.value = true
    console.log('Modal opened')
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

    <!--Home Page for Attendee-->
    <template v-if="isAttendee || isEventPlanner">
        <div class="phone-container">
            <div class="home">
                <div class="home-header">

                    <div class="home-header__text">
                        <p>Welcome, {{ userStore.first_name }} {{ userStore.last_name }}</p>
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
                        :currentBudget="event.currentBudget" design="block" @event-click="handleEventClick" />

                </div>
            </div>
        </div>
    </template>

    <!--Home Page for Finance-->
    <template v-if="isFinance">
        <div class="phone-container">
            <div class="home">
                <div class="home-header">
                    <p>{{ userStore.first_name }} {{ userStore.last_name }} - {{ userStore.org_id }} - {{
                        userStore.role
                        }}
                    </p>
                    <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
                </div>
                <h1>Upcoming Events</h1>
                <div class="p-event__container">
                    <!--Dynamic Events-->
                    <PEvent v-for="event in events" :key="event.id" :organization="event.org.name" :name="event.name"
                        :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                        :pictureLink="event.pictureLink" :description="event.description"
                        :currentBudget="event.currentBudget" design="block-finance" @event-click="handleEventClick" />
                </div>
            </div>
        </div>
    </template>

    <template v-if="isModalVisible">
        <div class="phone-container">
            <div class="modal-overlay" @click="closeModal"></div>
            <div class="modal-profile">

                <div class="modal-profile-img-name">
                    <h4>{{ userStore.first_name }} {{ userStore.last_name }}</h4>
                    <PProfilePic design="big" :profileImage='userStore.profile_picture' />
                    <div class="modal-profile-title-org">
                        <h5>{{ userStore.role_id }}</h5>
                        <p>{{ userStore.org_id }}</p>
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
                            <p><!--{{ userStore.phone }}-->246-123-5124</p>
                        </div>
                        <div class="profile-content">
                            <h5>Known Travel Number</h5>
                            <p><!--{{ userStore.ktn }}-->98884256</p>
                        </div>
                        <div class="profile-content">
                            <h5>Gender</h5>
                            <p><!--{{ userStore.gender }}-->Male</p>
                        </div>
                        <div class="profile-content">
                            <h5>Date of Birth</h5>
                            <p><!--{{ userStore.dob }}-->12/12/1990</p>
                        </div>
                    </div>
                </div>

                <div class="modal-profile-options">
                    <PButton label="Edit" design="gradient-small" @click="() => handleModalOption('Edit')">Edit
                    </PButton>
                    <PButton label="Logout" design="gradient-small" @click="() => handleModalOption('Logout')">Logout
                    </PButton>
                </div>
            </div>
        </div>
    </template>

</template>