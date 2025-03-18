<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PButton, PTextField, PEvent, PFinanceBlock } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import api from '../assets/scripts/api.js'

const router = useRouter()
const eventName = ref('')
const description = ref('')
const startDate = ref('')
const endDate = ref('')
const pictureLink = ref('')
const maxBudget = ref('')
const editEvent = ref(false)
const eventStore = useEventStore()

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


onMounted(() => {
    const query = router.currentRoute.value.query;
    if (query.edit) {
        editEvent.value = true;
        const eventData = JSON.parse(query.event);
        eventName.value = eventData.name;
        description.value = eventData.description;
        startDate.value = eventData.startDate;
        endDate.value = eventData.endDate;
        pictureLink.value = eventData.pictureLink;
        maxBudget.value = eventData.maxBudget;
    }
})

</script>

<template>
    <template v-if="editEvent">
        <div class="event-page">
            <div>
                <PEvent :organization="eventStore.currentEvent.organization" :name="eventStore.currentEvent.name"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :pictureLink="eventStore.currentEvent.pictureLink" design="header"
                    @back-click="() => handleBack('Home')" />
            </div>
            <div>
                <h1>Description</h1>
                <div class="event-description">
                    <PTextField design="textarea">{{ eventStore.currentEvent.description || 'No description available.' }}</PTextField>
                </div>
                <h1>Budget</h1>
                <div class="event-budget">
                    <p>Company will list budget here.</p>
                    <p> Plane Ticket - $230</p>
                    <p> Current Budget - ${{ eventStore.currentEvent.currentBudget }}</p>
                </div>

                <h1>Finance Team</h1>
                <div class="finance-info">
                    <PFinanceBlock design="p-finance" :email="eventStore.currentEvent.financeMan.email"
                        :name="eventStore.currentEvent.financeMan.firstName + ' ' + eventStore.currentEvent.financeMan.lastName"
                        :jobTitle="eventStore.currentEvent.financeMan.role"
                        :phoneNum="eventStore.currentEvent.financeMan.phoneNum"
                        :profileImage="eventStore.currentEvent.financeMan.profilePic"></PFinanceBlock>
                </div>
            </div>
        </div>
    </template>

    <template v-else>
        <div class="phone-container">

            <div class="planner-event">

                <PEvent design="small-header" name="Create an Event" @backClick="handleBack('Home')" />
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
                <PButton label="Create Event" @click="createEvent" design="gradient"></PButton>
            </div>
        </div>
    </template>
</template>