<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PDropDown, PFlight } from '@poseidon-components'
import { onMounted } from 'vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()

const handleBack = () => {
  router.back()
}

</script>

<template>
  <div class="phone-container">
    <div class="flight-page">
      <div>
        <PEvent :organization="eventStore.currentEvent.organization" :event="eventStore.currentEvent.eventName"
          :startDate="eventStore.currentEvent.startDate" :endDate="eventStore.currentEvent.endDate"
          :bgImage="eventStore.currentEvent.bgImage" design="header" @back-click="handleBack" />
      </div>
      
      <h1>Upcoming Flights</h1>
      <div class="p-dropdown__container">
        <PDropDown design="p-dropdown" dropDownLabel="Times" :options="['Earliest', 'Latest']"></PDropDown>
        <PDropDown design="p-dropdown" dropDownLabel="Price" :options="['Lowest', 'Highest']"></PDropDown>
      </div>

      <div class="p-event__container">
        <PFlight design="block" 
          :flightDate="new Date(2025, 1, 12)"
          airline="United"
          origin="LAX"
          destination="JFK"
          seatNumber="3A"
          flightType="Nonstop"
          flightGate="C1"
          flightClass="Economy"
          :price="230" />

          <PFlight 
      v-for="flight in flightStore.flightResults" 
      :key="flight.origin + flight.flightDepTime"
      design="block"
      :flightDate="flight.flightDate"
      :origin="flight.origin"
      :destination="flight.destination" 
      :flightDepTime="flight.flightDepTime"
      :flightArrTime="flight.flightArrTime"
      :seatNumber="flight.seatNumber"
      :seatAvailable="flight.seatAvailable"
      :price="flight.price"
      :flightType="flight.flightType"
      :flightClass="flight.flightClass"
      :flightGate="flight.flightGate"
      :airline="flight.airline"
    />
  </div>

    </div>
  </div>
</template>