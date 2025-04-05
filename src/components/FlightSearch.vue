<script setup>
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useRouter } from 'vue-router'
import { PEvent, PButton, PDropDown, PFlight, PTimeRangeDropDown } from '@poseidon-components'
import { onMounted, ref, computed } from 'vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const router = useRouter()
const sortOption = ref('') // Declare sortOption to store the selected sorting option
const filterStops = ref('') // Declare filterStops to store the selected filtering option
const airlineSelection = ref('') // Declare airlineSelection to store the selected airline option
const arrivalTimeRange = ref('') // Declare arrivalTimeRange to store the selected arrival time range
const departureTimeRange = ref('') // Declare departureTimeRange to store the selected departure time range
const loading = ref(false) // Declare loading to manage loading state
//Function to handle the back button
const handleBack = (targetRoute) => {
  router.push({ name: targetRoute });
}

//Function to handle the flight click
const handleFlightClick = (flight) => {
  console.log(flight)
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

const handleSortSelection = (option) => {
  sortOption.value = option; // Update sortOption with the selected option
}

const handleStopsSelection = (option) => {
  filterStops.value = option; // Update filterStops with the selected option
}

const handleAirlineSelection = (option) => {
  airlineSelection.value = option; // Update airlineSelection with the selected option
}

const handleTimeRangeUpdate = ({ type, value }) => {
  if (type === 'arrival') {
    arrivalTimeRange.value = value; // Update arrivalTimeRange with the selected range
  } else if (type === 'departure') {
    departureTimeRange.value = value; // Update departureTimeRange with the selected range
  }
};

const filteredAndSortedFlights = computed(() => {
  if (flightStore.flightResults.length === 0) {
    loading.value = true; // Set loading to true if no flight results are available
  } else {
    loading.value = false; // Set loading to false if flight results are available
  };
  if (!flightStore.flightResults) return [];

  let flights = [...flightStore.flightResults];

  if (flights.length > 0) {
    flights.forEach(flight => {
      const numStops = flight.itinerary[0].itinerary.length - 1;
      flight.stops = numStops; // Add stops property to each flight object
      flight.flightType = numStops === 0
        ? 'Non-Stop'
        : numStops === 1
          ? '1 Stop'
          : `${numStops} Stops`; // Set flightType based on numStops
      flight.itinerary[0].itinerary.forEach((itinerary, index) => {
        if (index < numStops) {
          const arrivalTime = new Date(`1970-01-01T${itinerary.arrival_time}`);
          const nextDepartureTime = new Date(`1970-01-01T${flight.itinerary[0].itinerary[index + 1].departure_time}`);
          const layoverMinutes = (nextDepartureTime - arrivalTime) / (1000 * 60); // Calculate layover in minutes
          const hours = Math.floor(layoverMinutes / 60);
          const minutes = layoverMinutes % 60;
          itinerary.layover = `${hours}h ${minutes}m`; // Add layover property in the format 00h 00m
        }
      });
    });
  }


  // Apply filtering based on stops
  switch (filterStops.value) {
    case 'Nonstop only':
      flights = flights.filter(flight => flight.stops === 0);
      break;
    case '1 stop or fewer':
      flights = flights.filter(flight => flight.stops <= 1);
      break;
    case '2 stops or fewer':
      flights = flights.filter(flight => flight.stops <= 2);
      break;
    case 'Any number of stops':
    default:
      // No filtering needed
      break;
  }

  // Apply filtering based on airline selection
  if (airlineSelection.value && airlineSelection.value !== 'Any') {
    flights = flights.filter(flight => flight.airline === airlineSelection.value);
  }

  // Apply filtering based on departure time range
  if (departureTimeRange.value && departureTimeRange.value.length === 2) {
    const [depStart, depEnd] = departureTimeRange.value.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes; // Convert HH:mm to minutes
    });

    flights = flights.filter(flight => {
      const flightDepTime = new Date(`1970-01-01T${flight.flightDepTime}`);
      const flightDepMinutes = flightDepTime.getHours() * 60 + flightDepTime.getMinutes();
      return flightDepMinutes >= depStart && flightDepMinutes <= depEnd;
    });
  }

  // Apply filtering based on arrival time range
  if (arrivalTimeRange.value && arrivalTimeRange.value.length === 2) {
    const [arrStart, arrEnd] = arrivalTimeRange.value.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes; // Convert HH:mm to minutes
    });

    flights = flights.filter(flight => {
      const flightArrTime = new Date(`1970-01-01T${flight.flightArrTime}`);
      const flightArrMinutes = flightArrTime.getHours() * 60 + flightArrTime.getMinutes();
      return flightArrMinutes >= arrStart && flightArrMinutes <= arrEnd;
    });
  }

  // Apply sorting
  switch (sortOption.value) {
    case 'Price':
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
      <div class="p-dropdown__container" style="margin-bottom: 15px;">
        <PDropDown design="flight" dropDownLabel="Stops"
          :options="['Any number of stops', 'Nonstop only', '1 stop or fewer', '2 stops or fewer']"
          @option-selected="handleStopsSelection"></PDropDown>
        <PDropDown design="flight" dropDownLabel="Airline"
          :options="['Any', ...new Set(flightStore.flightResults.map(flight => flight.airline))]"
          @option-selected="handleAirlineSelection"></PDropDown>
        <PTimeRangeDropDown dropDownLabel="Select Time Range" design="flight" :minTime="0" :maxTime="1440"
          @range-updated="handleTimeRangeUpdate">
        </PTimeRangeDropDown>
      </div>
      <div class="p-dropdown__container">
        <PDropDown design="flight" dropDownLabel="Sort By" :options="['Departure Time', 'Price']"
          @option-selected="handleSortSelection"></PDropDown>
      </div>

      <div class="p-event__container">
        <div v-if="loading" class="spinner">
          <div class="loading-spinner" v-show="loading" style="margin-top:0">
            <span class="loader"></span>
          </div>
        </div>
        <PFlight v-for="(flight, index) in filteredAndSortedFlights"
          :key="`${flight.origin}-${flight.flightDepTime}-${index}`" design="block" :flightID="flight.flightID"
          :flightDate="flight.flightDate" :origin="flight.origin" :destination="flight.destination"
          :flightDepTime="flight.flightDepTime" :flightArrTime="flight.flightArrTime" :seatNumber="flight.seatNumber"
          :seatAvailable="flight.seatAvailable" :price="flight.price" :flightType="flight.flightType"
          :flightClass="flight.flightClass" :flightGate="flight.flightGate" :airline="flight.airline"
          :logoURL="flight.logoURL" :itinerary="flight.itinerary" @click="handleFlightClick(flight)" />
      </div>
    </div>
  </div>
</template>