<script setup>
import { PButton, PFlight, PEvent } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import api from '../assets/scripts/api.js'
import { onMounted, ref, computed} from 'vue'

const router = useRouter()
const flightStore = useFlightStore()
const matchingReturnOptions = ref(null)


const handleBack = (targetRoute) => {
  router.push({ name: targetRoute });
}

const handleReturnFlightClick = () => {
  flightStore.setReturningFlightResults(matchingReturnOptions.value);
  router.push({ name: 'Flight' });
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
console.log("CURRENTFLIGHT! ", flightStore.currentFlight)

onMounted(async () => {

  if (flightStore.currentFlight.itinerary.length > 1 && flightStore.currentFlight.itinerary[0].itinerary) {
    const flights = flightStore.flightResults;
    console.log("FLIGHT RESULTS: ", flights)
    const currentFlight = flightStore.currentFlight;

    console.log("This is a round trip flight!");

    const groupedByOutbound = flights.reduce((acc, flight) => {
      const outboundSegments = flight.itinerary[0].itinerary;

      // Build a unique key using every outbound segment's details
      const key = outboundSegments
        .map(segment =>
          `${segment.origin}-${segment.destination}-${segment.departure_date}-${segment.departure_time}-${segment.carrier}-${flight.itinerary[0].class}`
        )
        .join('|'); // Using a pipe to separate segments for clarity

      if (!acc[key]) {
        acc[key] = {
          outboundFlight: {
            // You can store summary details for the outbound journey if needed.
            origin: outboundSegments[0].origin,
            destination: outboundSegments[outboundSegments.length - 1].destination,
            departure_date: outboundSegments[0].departure_date,
            departure_time: outboundSegments[0].departure_time,
          },
          returnFlights: []
        };
      }

      // Push the return flight option with the corresponding offer_id.
      acc[key].returnFlights.push({
        ...flight.itinerary[1],
        offer_id: flight.offer_id,
        price: flight.price,
        passID: flight.passID,
        airline: flight.airline,
        logoURL: flight.logoURL,
        flightArrTime: flight.itinerary[1].itinerary[flight.itinerary[1].itinerary.length - 1].arrival_time,
        flightDepTime: flight.itinerary[1].itinerary[0].departure_time,
        flightDate: flight.itinerary[1].itinerary[0].departure_date,
        flightClass: flight.flightClass,

      });

      return acc;
    }, {});

    // Create a key for the current flight's outbound segments using the same method (including the airline)
    const currentOutboundSegments = currentFlight.itinerary[0].itinerary;
    const currentKey = currentOutboundSegments
      .map(segment =>
        `${segment.origin}-${segment.destination}-${segment.departure_date}-${segment.departure_time}-${segment.carrier}-${currentFlight.itinerary[0].class}`
      )
      .join('|');

    // Retrieve the matching return flight options using the key.
    matchingReturnOptions.value = groupedByOutbound[currentKey]?.returnFlights || [];

    console.log("Matching return flight options:", matchingReturnOptions.value);

  }

})

const itineraries = computed(() => {
  const flightItinerary = flightStore.currentFlight.itinerary;
  if (!flightItinerary || !flightItinerary.length) return [];
  
  const firstItem = flightItinerary[0];
  // If there's a nested itinerary array, use it; otherwise, assume flightItinerary is already the segments array.
  if (firstItem.itinerary && Array.isArray(firstItem.itinerary) && firstItem.itinerary.length > 0) {
    return firstItem.itinerary;
  }
  
  return flightItinerary;
});


console.log("ITINERARIES: ", itineraries.value)

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
        <div class="p-event__entry" v-for="(itinerary, index) in itineraries"
          :key="index">
          <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
            :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
            :flightDuration="itinerary.duration"
            :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
          </PFlight>
          <PFlight v-if="index !== itineraries.length - 1" design="layover"
            v-bind="itinerary" :layoverDuration="itinerary.layover"></PFlight>
        </div>

      </div>
      <div class="flight-itinerary-button">
        <PButton v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1)" design="shop" label="Hold"
          :price="flightStore.currentFlight.price" @click="confirmPurchase()">
        </PButton>
      </div>
      <div>
        <PButton v-if="flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1" design="gradient" label="Choose Return Flight"
          @click="handleReturnFlightClick()"></PButton>
      </div>
    </div>
  </div>
</template>