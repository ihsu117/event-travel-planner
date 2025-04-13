<script setup>
import { PButton, PFlight, PEvent, PProfilePic } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import api from '../assets/scripts/api.js'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useEventStore } from '../stores/eventStore'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import HeaderBar from './Headerbar.vue'

const router = useRouter()
const route = useRoute()
// Create a reactive constant for the eventID query parameter
const eventID = ref(route.query.eventID)

const flightStore = useFlightStore()
const userStore = useUserStore()
const eventStore = useEventStore()
const bookingData = ref(null)

const isMobile = ref(window.innerWidth <= 768);

const updateScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Call the function when the component is mounted
onMounted(async () => {
    checkAuth()
    window.addEventListener('resize', updateScreenSize);
    checkAndLoadFlightBooking()
})

onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
})

const isAttendee = computed(() => userStore.role_id === 'Attendee')
const checkAndLoadFlightBooking = async () => {
    if (isAttendee.value) {
        try {
            const response = await api.apiFetch('/flights/bookedflight/' + eventID.value, {
                credentials: 'include'
            })
            if (response.status === 404) {
                console.warn('No flight data found for the selected event.')

            } else if (response.ok) {
                const flightData = await response.json()
                bookingData.value = flightData
                console.log(bookingData.value)
            }
                
        } catch (error) {
            console.error('Failed to fetch current booking data:', error)
        }
    }
}

const departItineraries = computed(() => {
  const flightItinerary = bookingData?.value?.itinerary.itinerary;
  if (!flightItinerary || !flightItinerary.length) return [];

  const firstItem = flightItinerary[0];
  // If there's a nested itinerary array, use it; otherwise, assume flightItinerary is already the segments array.
  if (firstItem.itinerary && Array.isArray(firstItem.itinerary) && firstItem.itinerary.length > 0) {
    return firstItem.itinerary;
  }

  return flightItinerary;
});

const returnItineraries = computed(() => {
  const flightItinerary = bookingData?.value?.itinerary.itinerary;
  if (!flightItinerary || !flightItinerary.length) return [];

  const firstItem = flightItinerary[1];
  // If there's a nested itinerary array, use it; otherwise, assume flightItinerary is already the segments array.
  if (firstItem.itinerary && Array.isArray(firstItem.itinerary) && firstItem.itinerary.length > 0) {
    return firstItem.itinerary;
  }

  return flightItinerary;
});

</script>

<template>
    <template v-if="!isMobile">
    <!-- <template v-if="!isMobile"> -->
        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage="userStore.profile_picture" />
            </div>
            <div class="itnry-container">
                <h1>Departing Itinerary</h1>
                <div v-for="(itinerary, index) in departItineraries" :key="index">
                    <PFlight design="desktop-itinerary" v-bind="itinerary" :airline="itinerary.carrier"
                        :originCity="itinerary.origin_city" :destinationCity="itinerary.destination_city"
                        :flightDepTime="itinerary.departure_time" :logoURL="bookingData?.itinerary?.logoURL"
                        :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
                        :flightClass="itinerary.class" :flightDuration="itinerary.duration" :currentIndex="index + 1"
                        :totalFlights="departItineraries.length"
                        :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
                    </PFlight>
                    <PFlight v-if="index !== departItineraries.length - 1" design="layover" v-bind="itinerary"
                        :layoverDuration="itinerary.layover"></PFlight>
                </div>

                <h1>Returning Itinerary</h1>
                <div v-for="(itinerary, index) in returnItineraries" :key="index">
                    <PFlight design="desktop-itinerary" v-bind="itinerary" :airline="itinerary.carrier"
                        :originCity="itinerary.origin_city" :destinationCity="itinerary.destination_city"
                        :flightDepTime="itinerary.departure_time" :logoURL="bookingData?.itinerary?.logoURL"
                        :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
                        :flightClass="itinerary.class" :flightDuration="itinerary.duration" :currentIndex="index + 1"
                        :totalFlights="returnItineraries.length"
                        :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
                    </PFlight>
                    <PFlight v-if="index !== returnItineraries.length - 1" design="layover" v-bind="itinerary"
                        :layoverDuration="itinerary.layover"></PFlight>
                </div>
            </div>
        </div>
    </template>

    <!-- <template v-if="!isMobile"> -->
    <template v-if="isMobile">
        <div class="p-event__container">
            <h1>Departing Itinerary</h1>
            <div class="p-event__entry" v-for="(itinerary, index) in departItineraries" :key="index">
                <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
                    :flightArrTime="itinerary.arrival_time" :destinationCity="itinerary.destination_city"
                    :originCity="itinerary.origin_city" :flightNumber="itinerary.flight_num"
                    :flightClass="itinerary.class" :flightDuration="itinerary.duration"
                    :currentIndex="index + 1" :totalFlights="departItineraries.length"
                    :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
                </PFlight>
                <PFlight v-if="index !== departItineraries.length - 1" design="layover" v-bind="itinerary"
                    :layoverDuration="itinerary.layover"></PFlight>
            </div>

            <h1>Returning Itinerary</h1>
            <div class="p-event__entry" v-for="(itinerary, index) in returnItineraries" :key="index">
                <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
                    :flightArrTime="itinerary.arrival_time" :flightNumber="itinerary.flight_num"
                    :flightClass="itinerary.class" :flightDuration="itinerary.duration"
                    :destinationCity="itinerary.destination_city" :originCity="itinerary.origin_city"
                    :currentIndex="index + 1" :totalFlights="returnItineraries.length"
                    :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
                </PFlight>
                <PFlight v-if="index !== returnItineraries.length - 1" design="layover" v-bind="itinerary"
                    :layoverDuration="itinerary.layover"></PFlight>
            </div>
        </div>
    </template>
</template>
