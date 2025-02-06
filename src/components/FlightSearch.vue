<script setup>
import { useEventStore } from '../stores/eventStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PDropDown, PFlight } from '@poseidon-components'

const eventStore = useEventStore()
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
          departure="LAX"
          arrival="JFK"
          seatNumber="3A"
          flightType="Nonstop"
          flightGate="C1"
          flightClass="Economy"
          :price="230" />
      </div>

    </div>
  </div>
</template>