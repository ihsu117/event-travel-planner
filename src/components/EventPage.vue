<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PFinanceBlock, PDropDown, PTextField } from '@poseidon-components'
import { computed, ref } from 'vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const searchDate = ref(null)
const arrivalDate = ref(null)
const zipcode = ref('')

const handleDateSelect = (date) => {
    const [month, day, year] = date.split('/').map(Number);
    searchDate.value = new Date(year, month - 1, day);
    console.log("Date: ", searchDate.value)
    console.log("Event Date: ", eventStore.currentEvent.startDate)
}

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
}

const dateOptions = computed(() => {
    const dates = []
    const startDate = new Date(eventStore.currentEvent.startDate)

    for (let i = 3; i >= 0; i--) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() - i)
        dates.push(formatDate(date))
    }
    return dates
})

const handleBack = () => {
    router.back()
}

const toFlightSearch = () => {
    return fetch('http://localhost:3000/api/flights/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            origin: "ATL",
            destination: "NYC",
            departure_date: searchDate.value || eventStore.currentEvent.startDate,
        })
    }).then(
        response => flightStore.setFlightResults(response.json())
    ).then(
        router.push({ name: 'Flight' })
    )
}
</script>

<template>
    <div class="phone-container">
        <div class="event-page">
            <div>
                <PEvent :organization="eventStore.currentEvent.organization" :name="eventStore.currentEvent.name"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :pictureLink="eventStore.currentEvent.pictureLink" design="header" @back-click="handleBack" />
            </div>
            <div>
                <h1>Description</h1>
                <p>{{ eventStore.currentEvent.description || 'No description available.' }}</p>

                <h1>Budget</h1>
                <p>Company will list budget here.</p>

                <p> Plane Ticket - $230</p>
                <p> Current Budget - ${{ eventStore.currentEvent.currentBudget }}</p>
                <div>
                    <h1>Flight Information</h1>
                    <div class="p-dropdown__container">
                        <PDropDown design="event" dropDownLabel="Departure Date" :options="dateOptions"
                            @option-selected="handleDateSelect" v-model="searchDate">
                        </PDropDown>
                        <PDropDown design="event" dropDownLabel="Arrival Date" :options="dateOptions"
                            @option-selected="" v-model="arrivalDate">
                        </PDropDown>
                        <PTextField design="small" v-model="zipcode" label="Zip Code"></PTextField>
                    </div>
                    <PButton design="gradient" label="Book Your Flight Here Now!" @click="toFlightSearch" />
                </div>


                <h1>Finance Team</h1>
                <div class="finance-info">
                    <PFinanceBlock design="p-finance" email="TWagner49@gmail.com" name="Timothy Wagner"
                        jobTitle="Finance Manager" phoneNum="246-123-5124" profileImage=""></PFinanceBlock>
                </div>
            </div>
        </div>
    </div>
</template>