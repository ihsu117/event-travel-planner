<script setup>
import { PButton, PFlight, PEvent } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const flightStore = useFlightStore()

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}



</script>

<template>
    <div class="phone-container">
        <div class="flight-itinerary">

            <PEvent design="itinerary-header" :organization="flightStore.currentFlight.airline"
                :name="'Flight Itinerary'" :pictureLink="flightStore.currentFlight.logoURL"
                @back-click="() => handleBack('Flight')" />

            <div class="flight-itinerary-status">
                <h3>Flight Confimation Status</h3>
                <h2>Pending</h2>
            </div>

            <div class="p-event__container">
                <PFlight design="itinerary" v-bind="flightStore.currentFlight"></PFlight>
            </div>
            <div class="flight-itinerary-button">
                <PButton design="shop" label="Hold" :price="flightStore.currentFlight.price" :offerId="flightStore.currentFlight.offer_id"></PButton>
            </div>
        </div>
    </div>
</template>