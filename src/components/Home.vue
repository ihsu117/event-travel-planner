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
import { ref, onMounted } from 'vue'

const eventStore = useEventStore()
const userStore = useUserStore()
const router = useRouter()
const events = ref([])

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/api/events', {
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

</script>

<template>
    <div class="phone-container">
        <div class="home">
            <div class="home-header">
                <p>{{ userStore.firstName }} {{ userStore.lastName }} - {{ userStore.organization }} - {{ userStore.role
                    }}</p>
                <PProfilePic design="small" :profileImage='userStore.profileImage' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="p-event__container">
                <PEvent organization="Poseidon" name="Gate Review 1" :startDate="new Date(2025, 4, 11)"
                    :endDate="new Date(2025, 4, 13)"
                    pictureLink="https://media.licdn.com/dms/image/v2/C5612AQGdAK3zSKJB5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1595251630672?e=2147483647&v=beta&t=9n9Ggoe-68JFjOG9OSHgGdAJBxTHCjOpJLhuCwzRCrU"
                    design="block" @event-click="handleEventClick" />

                <PEvent organization="Poseidon" name="Gate Review 2" :startDate="new Date(2025, 2, 25)"
                    :endDate="new Date(2025, 2, 27)"
                    pictureLink="https://cdn.rit.edu/images/news/2021-07/MAN-SHED-DJI_0448.jpg" design="block"
                    description="This is the description lol" @event-click="handleEventClick" />

                <PEvent v-for="event in events" :key="event.id" :organization="event.org.name" :name="event.name"
                    :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" design="block" @event-click="handleEventClick" />

            </div>
        </div>
    </div>

</template>