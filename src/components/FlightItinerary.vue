<script setup>
import { PButton, PFlight } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'

const flightStore = useFlightStore()
</script>

<template>
    <div class="flight-itinerary">

        <div class="flight-itinerary-header">
            <img :src="flightStore.currentFlight.logoURL" alt="Airline Logo" />
            <h3>{{ flightStore.currentFlight.airline }}</h3>
        </div>

        <h3>Flight Confimation Status</h3>
        <h2></h2>

        <div class="p-event__container">
            <PFlight design="itinerary" v-bind="flightStore.currentFlight"></PFlight>
        </div>
        <PButton design="shop" label="Buy"></PButton>
    </div>

</template>