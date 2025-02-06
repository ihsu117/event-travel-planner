<script setup>
import {
    PButton,
    PTextField,
    PEvent,
    PProfilePic,
} from '@poseidon-components'
import '@poseidon-styles/index.css'
import { useEventStore } from '../stores/eventStore'
import { useRouter } from 'vue-router'

const eventStore = useEventStore()
const router = useRouter()

const props = defineProps({
    name: {
        type: String,
        default: 'name'
    },
    organization: {
        type: String,
        default: 'organization'
    },
    role: {
        type: String,
        default: 'role'
    },
    profileImage: {
        type: String,
        default: 'Poseidon-Design-System/PoseidonDesignSys/lib/assets/img/defaultPP.png'
    },
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
                <p>{{ name }} - {{ organization }} - {{ role }}</p>
                <PProfilePic design="small" profileImage='{{profileImage}}' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="p-event__container">
                <PEvent organization="Poseidon" event="Gate Review 1" :startDate="new Date(2025, 1, 11)"
                    :endDate="new Date(2025, 1, 13)"
                    bgImage="https://media.licdn.com/dms/image/v2/C5612AQGdAK3zSKJB5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1595251630672?e=2147483647&v=beta&t=9n9Ggoe-68JFjOG9OSHgGdAJBxTHCjOpJLhuCwzRCrU"
                    design="block" @event-click="handleEventClick" />

                <PEvent organization="Poseidon" event="Gate Review 2" :startDate="new Date(2025, 2, 25)"
                    :endDate="new Date(2025, 2, 27)"
                    bgImage="https://cdn.rit.edu/images/news/2021-07/MAN-SHED-DJI_0448.jpg"
                    design="block" @event-click="handleEventClick"/>
            </div>
        </div>
    </div>

</template>