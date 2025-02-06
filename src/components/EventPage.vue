<script setup>
import { useEventStore } from '../stores/eventStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton } from '@poseidon-components'

const eventStore = useEventStore()
const router = useRouter()

const handleBack = () => {
    router.back()
}

const toFlightSearch = () => {
    router.push({
        name: 'Flight'
    })
}

</script>

<template>
    <div class="phone-container">
        <div class="event-page">
            <div>
                <PEvent :organization="eventStore.currentEvent.organization" :event="eventStore.currentEvent.eventName"
                    :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
                    :bgImage="eventStore.currentEvent.bgImage" design="header" @back-click="handleBack" />
            </div>
            <div>
                <h1>Description</h1>
                <p>Company will list details of event here.
                    Autem nam magni earum id eiusmodi dolorum dicta alias unde minima cum error sequi.
                    Iure quia provident sit magni optio adipisci cupiditate ratione doloribus</p>

                <h1>Budget</h1>
                <p>Company will list budget here.</p>

                <p> Plane Ticket - $230</p>
                <div>
                    <h1>Flight Information</h1>
                    <PButton design="gradient" label="Book Your Flight Here Now!" @click="toFlightSearch" />
                </div>
            </div>
        </div>
    </div>
</template>