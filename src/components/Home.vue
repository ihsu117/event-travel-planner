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
import api from '../assets/scripts/api.js'

const eventStore = useEventStore()
const userStore = useUserStore()
const router = useRouter()
const events = ref([])

console.log("First Name: " + userStore.first_name + " Last Name: " + userStore.last_name + " Org:" + userStore.org_id + " Role:" + userStore.role_id);

onMounted(async () => {
    try {
        const response = await api.apiFetch('/events', {
            credentials: 'include'
        })
        if (response.ok) {
            const eventsData = await response.json()
            events.value = eventsData
        }
    } catch (error) {
        console.error('Failed to fetch events:', error)
    }
})

const handleEventClick = (eventData) => {
    eventStore.setCurrentEvent(eventData)
    router.push({ name: 'Event' })
}

userStore.role_id = 1;

const isAttendee = computed(() => userStore.role_id === 1)
const isFinance = computed(() => userStore.role_id === 2)

</script>

<template>

    <!--Home Page for Attendee-->
    <template v-if="isAttendee">
        <div class="phone-container">
            <div class="home">
                <div class="home-header">
                    <p>{{ userStore.firstName }} {{ userStore.lastName }} - {{ userStore.organization }} - {{
                        userStore.role }}</p>
                    <PProfilePic design="small" :profileImage='userStore.profileImage' />
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
                    <p>{{ userStore.firstName }} {{ userStore.lastName }} - {{ userStore.organization }} - {{
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
                        :currentBudget="event.currentBudget" design="block" @event-click="handleEventClick" />
                </div>
            </div>
        </div>
    </template>

</template>