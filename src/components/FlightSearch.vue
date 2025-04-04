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
const sortOption = ref('') // Declare sortOption to store the selected sorting option

//Function to handle the back button
const handleBack = (targetRoute) => {
  router.push({ name: targetRoute });
}

//Function to handle the flight click
const handleFlightClick = (flight) => {
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

const handleOptionSelection = (option) => {
  sortOption.value = option; // Update sortOption with the selected option
}

const filteredAndSortedFlights = computed(() => {
  if (!flightStore.flightResults) return [];

  let flights = [...flightStore.flightResults];
  // Apply sorting
  switch (sortOption.value) {
    case 'Price' || null:
      flights.sort((a, b) => a.price - b.price);
      break;
    case 'Departure Time':
      flights.sort((a, b) => {
      const dateA = new Date(`1970-01-01T${a.flightDepTime}`);
      const dateB = new Date(`1970-01-01T${b.flightDepTime}`);
      return dateA - dateB;
      });
      break;
  }

  return flights;
});


</script>

<template>
  <div class="phone-container">
    <div class="flight-page">
      <div>
        <PEvent :organization="eventStore.currentEvent.org" :eventName="eventStore.currentEvent.eventName"
          :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
          :pictureLink="eventStore.currentEvent.pictureLink" design="header" @back-click="() => handleBack('Event')" />
      </div>

      <h1>Upcoming Flights</h1>
      <div class="p-dropdown__container">
        <PDropDown design="flight" dropDownLabel="Sort By" :options="['Departure Time', 'Price']" @option-selected="handleOptionSelection"></PDropDown>
        <!-- <PDropDown design="flight" dropDownLabel="Price" :options="['Lowest', 'Highest']" @option-selected="handleOptionSelection"></PDropDown> -->
      </div>

      <div class="p-event__container">
        <PFlight v-for="(flight, index) in filteredAndSortedFlights"
          :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="block" :flightID="flight.flightID" :flightDate="flight.flightDate"
          :origin="flight.origin" :destination="flight.destination" :flightDepTime="flight.flightDepTime"
          :flightArrTime="flight.flightArrTime" :seatNumber="flight.seatNumber" :seatAvailable="flight.seatAvailable"
          :price="flight.price" :flightType="flight.flightType" :flightClass="flight.flightClass"
          :flightGate="flight.flightGate" :airline="flight.airline" :logoURL="flight.logoURL" @click="handleFlightClick(flight)"/>
      </div>
    </div>
  </div>
</template>