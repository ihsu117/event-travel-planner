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
  const flightData = {
    depart_loc: flightStore.currentFlight.origin,
    arrive_loc: flightStore.currentFlight.destination,
    depart_time: flightStore.currentFlight.flightDepTime,
    arrive_time: flightStore.currentFlight.flightArrTime,
    price: flightStore.currentFlight.price,
    date: flightStore.currentFlight.flightDate
  }
  //Saves selected flight to local storage
  //localStorage.setItem('selectedFlight', JSON.stringify(flightStore.currentFlight));
  //localStorage.setItem('flightSelected', 'true');

  const localStorageData = JSON.parse(localStorage.getItem('eventData'));
  const eventID = localStorageData?.id; // Extract the eventID

  return api.apiFetch('/flights/hold', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      offerID: flightStore.currentFlight.offer_id,
      passID: flightStore.currentFlight.passID,
      flight: flightData,
      eventID: eventID
    })
  }).then(
    response => console.log(response)
  ).then(
    router.push({ name: 'Event' })
  )
}
console.log(flightStore.currentFlight)
</script>

<template>
  <div class="phone-container">
    <div class="flight-itinerary">

      <PEvent design="itinerary-header" :airline="flightStore.currentFlight.airline" :name="'Flight Itinerary'"
        :pictureLink="flightStore.currentFlight.logoURL" @back-click="() => handleBack('Flight')" />

      <div class="flight-itinerary-status">
        <h3>Flight Confimation Status</h3>
        <h2>Pending</h2>
      </div>

      <div class="p-event__container">
        <div class="p-event__entry" v-for="(itinerary, index) in flightStore.currentFlight.itinerary[0].itinerary"
          :key="index">
          <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
            :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
            :flightDuration="itinerary.duration"
            :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
          </PFlight>
          <PFlight v-if="index !== flightStore.currentFlight.itinerary[0].itinerary.length - 1" design="layover"
            v-bind="itinerary" :layoverDuration="itinerary.layover"></PFlight>
        </div>

      </div>
      <div class="flight-itinerary-button">
        <PButton design="shop" label="Hold" :price="flightStore.currentFlight.price" @click="confirmPurchase()">
        </PButton>
      </div>
    </div>
  </div>
</template>