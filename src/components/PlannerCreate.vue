<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PButton, PTextField, PEvent, PFinanceBlock } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import api from '../assets/scripts/api.js'

const router = useRouter()
const eventName = ref('')
const description = ref('')
const startDate = ref('')
const endDate = ref('')
const pictureLink = ref('')
const maxBudget = ref('')
const eventStore = useEventStore()
const userStore = useUserStore()
const isInvitePage = ref(false)

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
            body: JSON.stringify(eventData),
            credentials: 'include'
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

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

const toEventPage = () => {
    isInvitePage.value = true
    loadOrgUsers()
}

const loadOrgUsers = async () => {
    try {
        const response = await api.apiFetch('/organization/users', {
            method: 'GET',
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Organization users:', result)
            userStore.setUsers(result)
        } else {
            console.error('Failed to load organization users:', await response.json())
        }
    } catch (error) {
        console.error('Error loading organization users:', error)
    }
}

</script>

<template>
    <template v-if="isInvitePage">
        <div class="phone-container">
            <div class="planner-event">
                <PEvent design="small-header" name="Invitations" @back-click="isInvitePage = false" />
                <h2>Finance Manager</h2>
                <div class="p-event__container">
                    
                </div>

                <h2>Attendees</h2>
                <div class="p-event__container">

                </div>
                <PButton label="Send Invites" @click="createEvent" design="gradient"></PButton>
            </div>
        </div>
    </template>

    <template v-else>
        <div class="phone-container">

            <div class="planner-event">

                <PEvent design="small-header" name="Create an Event" @back-click="handleBack('Home')" />
                <div class="event-form">
                    <div>
                        <h2>Name</h2>
                        <PTextField label="Event Name" v-model="eventName" />
                    </div>
                    <div class="planner-description">
                        <h2>Description</h2>
                        <PTextField design="textarea" :maxlength=400 label="Description" v-model="description" />
                    </div>

                    <div class="planner-dates">
                        <div>
                            <h2>Start Date</h2>
                            <PTextField type="date" label="Start Date" v-model="startDate" />
                        </div>
                        <div>
                            <h2>End Date</h2>
                            <PTextField type="date" label="End Date" v-model="endDate" />
                        </div>
                        
                    </div>

                    <div>
                        <h2>Picture Link</h2>
                        <PTextField label="Picture Link" v-model="pictureLink" />
                    </div>
                    <div>
                        <h2>Max Budget</h2>
                        <PTextField label="Max Budget" v-model="maxBudget" />
                    </div>
                </div>
                <PButton label="Create Event" @click="toEventPage" design="gradient"></PButton>
            </div>
        </div>
    </template>
</template>