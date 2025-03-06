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

console.log("First Name: " + userStore.first_name + " Last Name: " + userStore.last_name + " Org:" + userStore.org_id + " Role:" + userStore.role_id);

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

//The role_id is hardcoded for now, but will be dynamic in the future
//1 = Attendee, 2 = Finance


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

console.log('Profile Image URL:', userStore.profile_picture);

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
                    <PProfilePic design="small" :profileImage='userStore.profile_picture' />
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
                    <PProfilePic design="small" :profileImage='userStore.profileImage' />
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

</template>