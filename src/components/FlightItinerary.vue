<script setup>
import { PButton, PFlight, PEvent, PProfilePic } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import api from '../assets/scripts/api.js'
import { onMounted, onUnmounted, ref, computed, onUpdated} from 'vue'
import { useEventStore } from '../stores/eventStore'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import { onDuffelAncillariesPayloadReady, renderDuffelAncillariesCustomElement } from "@duffel/components/custom-elements";
import HeaderBar from './Headerbar.vue'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()
const userStore = useUserStore()
const matchingReturnOptions = ref(null)
const eventStore = useEventStore()
const ancillariesComponent = ref(null)

const loading = ref(false)

const isMobile = ref(window.innerWidth <= 768);

const updateScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};


const handleBack = (targetRoute) => {
  router.push({ name: targetRoute });
}

const handleReturnFlightClick = () => {
  flightStore.setReturningFlightResults(matchingReturnOptions.value);
  console.log(matchingReturnOptions.value)
  flightStore.clearItinerary()
  flightStore.setItinerary([itineraries.value])
  router.push({ name: 'Flight', query: { type: "return" } });
}

const handleGoToSummary = () => {
  flightStore.setItinerary([itineraries.value])
  console.log(flightStore.itineraries)
  router.push({ name: 'FlightItinerary', query: { type: "bookingSummary" } })
}

const confirmPurchase = async () => {
  loading.value = true;
  const flightData = {
    depart_loc: flightStore.currentFlight.origin,
    arrive_loc: flightStore.currentFlight.destination,
    depart_time: flightStore.currentFlight.flightDepTime,
    arrive_time: flightStore.currentFlight.flightArrTime,
    price: flightStore.currentFlight.price,
    date: flightStore.currentFlight.flightDate,
    seatNumber: flightStore.currentFlight.seatNumber,
  };

  const localStorageData = JSON.parse(localStorage.getItem('currentEvent'));
  const eventID = localStorageData?.id; // Extract the eventID

  try {
    const response = await api.apiFetch('/flights/hold', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        offerID: flightStore.currentFlight.offer_id,
        passID: flightStore.currentFlight.passID,
        flight: flightData,
        eventID: eventID,
      }),
    });

    console.log(response); // Log the response for debugging or further processing

    // Now that the response is received, navigate to the event page
    router.push({ name: 'Event' });
  } catch (error) {
    console.error('Error during purchase confirmation:', error);
    loading.value = false;
    // Optionally, handle errors (show an error message, etc.)
  }
};

console.log("CURRENTFLIGHT! ", flightStore.currentFlight)

onMounted(async () => {
  checkAuth()

  doDuffelSeatmapRendering()
  

  window.addEventListener('resize', updateScreenSize);
  console.log("!!!!",flightStore.currentFlight)
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
        search_key: flight.search_key

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

onUpdated( async () => {
 doDuffelSeatmapRendering()
})

const doDuffelSeatmapRendering = async () => {
  console.log(flightStore.currentFlight.price)
  var gender;
  var title;
  var phoneNum;

  const userDetails = await api.apiFetch(`/user/${userStore.user_id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'applications/json'
    }
  }).then(
    response => {
      gender = response.gender,
      title = response.title,
      phoneNum = "+1" + response.phone_num
    }
  )
  console.log(ancillariesComponent.value)
  if (ancillariesComponent.value) {
    userStore.loadUser()
    console.log("TRUE", ancillariesComponent.value)
    renderDuffelAncillariesCustomElement({
    offer_id: flightStore.currentFlight.offer_id,
    services: ["seats"],
    passengers: [
        {
          given_name: userStore.first_name,
          family_name: userStore.last_name,
          gender: gender,
          title: title,
          born_on: userStore.dob,
          email: userStore.email,
          phone_number: phoneNum
        }
      ],
    client_key: flightStore.currentFlight.search_key
    });

    onDuffelAncillariesPayloadReady((data, metadata) => {
      console.table(data);
      console.log(flightStore.currentFlight.price)
      flightStore.currentFlight.price = data.payments[0].amount;
      console.log(flightStore.currentFlight.price)
      flightStore.currentFlight.seatNumber = metadata.seat_services[0].serviceInformation.designator;
    });
  }
}

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

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
  // flightStore.setCurrentFlight([])
});

console.log("ITINERARIES: ", itineraries.value)

</script>

<template>

  <!---------------------------------------------------------------DESKTOP-------------------------------------------------------->

  <template v-if="!isMobile">
    <div class="home-desktop">
      <div class="home-header-desktop">
        <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' backButton/>
      </div>

      <div v-if="$route?.query?.type !== 'bookingSummary'">
        <div class="itnry-container">
          <div v-for="(itinerary, index) in itineraries" :key="index">
            <PFlight design="desktop-itinerary" v-bind="itinerary" :airline="flightStore.currentFlight.airline"
              :logoURL="flightStore.currentFlight.logoURL" :flightDepTime="itinerary.departure_time"
              :flightArrTime="itinerary.arrival_time" :destinationCity="itinerary.destination_city"
              :originCity="itinerary.origin_city" :flightNumber="itinerary.flight_num"
              :flightDuration="itinerary.duration" :currentIndex="index + 1" :totalFlights="itineraries.length"
              :flightClass="flightStore.currentFlight.flightClass"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== itineraries.length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>
          <div v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1) && $route?.query?.type !== 'return' && $route?.query?.type !== 'returnItinerary'">
            <duffel-ancillaries ref="ancillariesComponent">
              
            </duffel-ancillaries>
          </div>
          <div class="flight-itinerary-button">
            <PButton
              v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1) && $route?.query?.type !== 'return' && $route?.query?.type !== 'returnItinerary'"
              design="shop" label="Hold" :price="Math.ceil(flightStore.currentFlight.price)" @click="confirmPurchase()">
            </PButton>
            <PButton
              v-if="flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1 && $route?.query?.type !== 'return'"
              design="gradient" label="Search for Returning Flights" @click="handleReturnFlightClick()"></PButton>
            <PButton v-if="$route?.query?.type == 'returnItinerary'" design="gradient" label="Go to Booking Summary"
              @click="handleGoToSummary()"></PButton>
          </div>
        </div>
      </div>
      <div v-if="$route?.query?.type == 'bookingSummary'">
        <div class="itnry-container">

          <h1>Departing Itinerary</h1>
          <div v-for="(itinerary, index) in flightStore.itineraries[0]" :key="index">
            <PFlight design="desktop-itinerary" v-bind="itinerary" :airline="itinerary.carrier" :originCity="itinerary.origin_city" :destinationCity="itinerary.destination_city" :flightDepTime="itinerary.departure_time"
              :logoURL="flightStore.currentFlight.logoURL" :flightArrTime="itinerary.arrival_time"
              :flightNumber="itinerary.flight_num" :flightClass="itinerary.class"
              :flightDuration="itinerary.duration" :currentIndex="index + 1" :totalFlights="flightStore.itineraries[0].length"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== flightStore.itineraries[0].length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>

          <h1>Returning Itinerary</h1>
          <div v-for="(itinerary, index) in flightStore.itineraries[1]" :key="index">
            <PFlight design="desktop-itinerary" v-bind="itinerary" :airline="itinerary.carrier" :originCity="itinerary.origin_city" :destinationCity="itinerary.destination_city" :flightDepTime="itinerary.departure_time"
              :logoURL="flightStore.currentFlight.logoURL" :flightArrTime="itinerary.arrival_time"
              :flightNumber="itinerary.flight_num" :flightClass="itinerary.class"
              :flightDuration="itinerary.duration" :currentIndex="index + 1" :totalFlights="flightStore.itineraries[1].length"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== flightStore.itineraries[1].length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>
          <div>
            <duffel-ancillaries ref="ancillariesComponent">
              
            </duffel-ancillaries>
          </div>
          <div class="flight-hold-button">
            <PButton
              v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1) && $route?.query?.type !== 'return' && $route?.query?.type !== 'returnItinerary'"
              design="shop" label="Hold" :price="Math.ceil(flightStore.currentFlight.price)" @click="confirmPurchase()">
            </PButton>
          </div>

        </div>

      </div>
    </div>
  </template>


  <!-----------------------------------------------------------MOBILE------------------------------------------------------------>
  <template v-else>
    <div class="flight-itinerary">
      <PEvent design="itinerary-header" :airline="flightStore.currentFlight.airline" :name="'Flight Itinerary'"
        :pictureLink="flightStore.currentFlight.logoURL" @back-click="() => handleBack('Flight')" />

      <div v-if="$route?.query?.type !== 'bookingSummary'">
        <div class="p-event__container">
          <div class="p-event__entry" v-for="(itinerary, index) in itineraries" :key="index">
            <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
              :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
              :flightDuration="itinerary.duration" :destinationCity="itinerary.destination_city"
              :originCity="itinerary.origin_city" :seatNumber="flightStore.currentFlight.seatNumber"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== itineraries.length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>

        </div>
        <div class="flight-itinerary-button">
          <PButton
            v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1) && $route?.query?.type !== 'return' && $route?.query?.type !== 'returnItinerary'"
            design="shop" label="Hold" :price="Math.ceil(flightStore.currentFlight.price)" @click="confirmPurchase()">
          </PButton>
        </div>
        <div class="flight-itinerary-button">
          <PButton
            v-if="flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1 && $route?.query?.type !== 'return'"
            design="gradient" label="Search for Returning Flights" @click="handleReturnFlightClick()"></PButton>
        </div>
        <div>
          <PButton v-if="$route?.query?.type == 'returnItinerary'" design="gradient" label="Go to Booking Summary"
            @click="handleGoToSummary()"></PButton>
        </div>
      </div>

      <div v-if="$route?.query?.type == 'bookingSummary'">
        <div class="p-event__container">

          <h1>Departing Itinerary</h1>

          <div class="p-event__entry" v-for="(itinerary, index) in flightStore.itineraries[0]" :key="index">
            <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
              :flightArrTime="itinerary.arrival_time" :destinationCity="itinerary.destination_city"
              :originCity="itinerary.origin_city" :flightNumber="itinerary.flight_num"
              :flightClass="flightStore.currentFlight.flightClass" :flightDuration="itinerary.duration"
              :currentIndex="index + 1" :totalFlights="itineraries.length"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== flightStore.itineraries[0].length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>

          <h1>Returning Itinerary</h1>

          <div class="p-event__entry" v-for="(itinerary, index) in flightStore.itineraries[1]" :key="index">
            <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
              :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
              :flightClass="flightStore.currentFlight.flightClass" :flightDuration="itinerary.duration"
              :destinationCity="itinerary.destination_city" :originCity="itinerary.origin_city"
              :currentIndex="index + 1" :totalFlights="itineraries.length"
              :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
            </PFlight>
            <PFlight v-if="index !== flightStore.itineraries[1].length - 1" design="layover" v-bind="itinerary"
              :layoverDuration="itinerary.layover"></PFlight>
          </div>

          <div class="flight-hold-button">
            <PButton
              v-if="!(flightStore.currentFlight.itinerary[0].itinerary && flightStore.currentFlight.itinerary.length > 1) && $route?.query?.type !== 'return' && $route?.query?.type !== 'returnItinerary'"
              design="shop" label="Hold" :price="Math.ceil(flightStore.currentFlight.price)" @click="confirmPurchase()">
            </PButton>
          </div>

        </div>

      </div>

    </div>
  </template>

  <!-- Loading Modal -->
  <template v-if="loading">
    <div class="modal-overlay" id="mfa"></div>
    <div class="modal" id="mfa" :class="{ expanded: !loading }">
      <div class="loading-spinner" v-show="loading">
        <span class="loader"></span>
      </div>
    </div>
  </template>
</template>