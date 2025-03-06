<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PButton, PTextField } from '@poseidon-components'
import api from '../assets/scripts/api.js'

const router = useRouter()
const eventName = ref('')
const description = ref('')
const startDate = ref('')
const endDate = ref('')
const pictureLink = ref('')
const maxBudget = ref('')

const createEvent = async () => {
    try {
        const eventData = {
            name: eventName.value,
            description: description.value,
            startDate: startDate.value,
            endDate: endDate.value,
            pictureLink: pictureLink.value,
            maxBudget: maxBudget.value
        }

        const response = await api.apiFetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Event created successfully:', result)
            router.push({ name: 'Home' }) // Redirect to home or another page
        } else {
            console.error('Failed to create event:', await response.json())
        }
    } catch (error) {
        console.error('Error creating event:', error)
    }
}
</script>

<template>
    <div class="phone-container">
        <div class="event-page">
            <h2>Create an Event</h2>
            <div class="event-form">
                <PTextField label="Event Name" v-model="eventName" />
                <PTextField label="Description" v-model="description" />
                <PTextField label="Start Date" v-model="startDate" />
                <PTextField label="End Date" v-model="endDate" />
                <PTextField label="Picture Link" v-model="pictureLink" />
                <PTextField label="Max Budget" v-model="maxBudget" />
            </div>
            <PButton label="Create Event" @click="createEvent" design="gradient"></PButton>
        </div>
    </div>
</template>