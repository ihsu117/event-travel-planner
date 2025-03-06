<script setup>
import { PButton, PFlight, PEvent } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import api from '../assets/scripts/api.js'

const router = useRouter()
const flightStore = useFlightStore()

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

const confirmPurchase = async () => {
  alert('Purchase confirmed - Offer ID: ' + flightStore.currentFlight.offer_id + ' Passenger ID: ' + flightStore.currentFlight.passID);
    console.log(flightStore.currentFlight.offer_id + ' ' + flightStore.currentFlight.passID)
  return api.apiFetch('/flights/hold', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      offerID: flightStore.currentFlight.offer_id,
      passID: flightStore.currentFlight.passID
    })
  }).then(
    response => console.log(response)
  ).then(
    router.push({ name: 'Event' })
  )
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
                <PButton design="shop" label="Hold" :price="flightStore.currentFlight.price" @click="confirmPurchase()"></PButton>
            </div>
        </div>
    </div>
</template>