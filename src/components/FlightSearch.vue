<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PDropDown, PFlight } from '@poseidon-components'
import { onMounted, ref, computed } from 'vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const sortPrice = ref('none')

const handleBack = (targetRoute) => {
  router.push({ name: targetRoute });
}

const handleFlightClick = (flight) => {
  console.log('Selected flight offer ID:', flight.offer_id)
  flightStore.setCurrentFlight(flight)
  router.push({ name: 'FlightItinerary' })
}

// const handlePriceSort = (option) => {
//   sortPrice.value = option
// }

// const sortedFlights = computed(() => {
//   if (!flightStore.flightResults) return []

//   const flights = [...flightStore.flightResults]

//   switch (sortPrice.value) {
//     case 'Lowest':
//       return flights.sort((a, b) => a.price - b.price)
//     case 'Highest':
//       return flights.sort((a, b) => b.price - a.price)
//     case 'Price':
//       return flights
//   }
// })

</script>

<template>
  <div class="phone-container">
    <div class="flight-page">
      <div>
        <PEvent :organization="eventStore.currentEvent.organization" :name="eventStore.currentEvent.name"
          :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
          :pictureLink="eventStore.currentEvent.pictureLink" design="header" @back-click="() => handleBack('Event')" />
      </div>

      <h1>Upcoming Flights</h1>
      <div class="p-dropdown__container">
        <PDropDown design="flight" dropDownLabel="Times" :options="['Earliest', 'Latest']"></PDropDown>
        <PDropDown design="flight" dropDownLabel="Price" :options="['Lowest', 'Highest']"></PDropDown>
      </div>

      <div class="p-event__container">
        <PFlight v-for="(flight, index) in flightStore.flightResults"
          :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="block" :flightDate="flight.flightDate"
          :origin="flight.origin" :destination="flight.destination" :flightDepTime="flight.flightDepTime"
          :flightArrTime="flight.flightArrTime" :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable"
          :price="flight.price" :flightType="flight.flightType" :flightClass="flight.flightClass"
          :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL" @click="handleFlightClick(flight)"/>
      </div>
    </div>
  </div>
</template>