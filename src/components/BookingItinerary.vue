<script setup>
import { PButton, PFlight, PEvent, PProfilePic } from '@poseidon-components'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import api from '../assets/scripts/api.js'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useEventStore } from '../stores/eventStore'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import { format, isToday, parseISO } from 'date-fns';
import HeaderBar from './Headerbar.vue'

const router = useRouter()
const route = useRoute()
const userInfo = ref({});
const showInviteModal = ref(false)
const isModalVisible = ref(false)

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

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

// Function to handle modal option selection
const handleModalOption = async (option) => {
    console.log(`Selected option: ${option}`)
    if (option === 'Logout') {
        try {
            const response = await api.apiFetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                userStore.$reset() // Reset the user store
                localStorage.clear() // Clear local storage
                router.push({ name: 'Login' }) // Redirect to login page
            }
        } catch (error) {
            console.error('Failed to logout:', error)
        }
    } else if (option === 'Edit') {
        router.push({ name: 'EditUser' })
    }
    closeModal()
}

const fetchUserData = async () => {
    try {
        const response = await api.apiFetch(`/user/${userStore.user_id}`, {
            credentials: 'include'
        });
        if (response.ok) {
            userInfo.value = await response.json();
        } else {
            console.error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

// Function to open the modal
const openModal = async () => {
    await fetchUserData();
    isModalVisible.value = true
}

// Function to close the modal
const closeModal = () => {
    isModalVisible.value = false
}

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
        console.log(firstItem.itinerary)
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

const timeStringToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToHHMM = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) {
        return `${mins} m`;
    } else {
        return `${hrs} hr ${mins} m`;
    }
};

const layoverDurationCalc = (arrival_time, departure_time) => {
    let arrivalMinutes = timeStringToMinutes(arrival_time);
    let departureMinutes = timeStringToMinutes(departure_time);

    // Handle cases where the departure is on the next day
    if (departureMinutes < arrivalMinutes) {
        departureMinutes += 1440; // 24 hours * 60 minutes
    }

    const durationMinutes = departureMinutes - arrivalMinutes;
    return minutesToHHMM(durationMinutes);
};

const statusClass = computed(() => {
    const statusName = bookingData.value?.status?.name?.toLowerCase();
    if (statusName === 'pending approval') {
        return 'pending';
    } else if (statusName === 'denied') {
        return 'denied';
    } else if (statusName === 'approved') {
        return 'approved';
    } else {
        return ''; // For approved or any other status, no extra style
    }
});

</script>

<template>
    <!-----------------------------------------------------------MODAL------------------------------------------------------------>
    <template v-if="isModalVisible && !isMobile">
        <div>
            <div class="modal-overlay" @click="closeModal"></div>
            <div class="modal modal-container">
                <div class="modal-profile">
                    <div class="modal-profile-img-name">
                        <h4>{{ userStore.first_name }} {{ userStore.last_name }}</h4>
                        <PProfilePic design="big" :profileImage='userStore.profile_picture' />
                        <div class="modal-profile-title-org">
                            <h5>{{ userStore.role_id }}</h5>
                            <p>{{ userStore.org.name }}</p>
                        </div>
                    </div>

                    <div class="modal-profile-info-container">
                        <div class="modal-profile-info">
                            <div class="profile-content">
                                <h5>Email</h5>
                                <p>{{ userStore.email }}</p>
                            </div>
                            <div class="profile-content">
                                <h5>Phone</h5>
                                <p>{{ userInfo.phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
                                    }}</p>
                            </div>

                            <div class="profile-content">
                                <h5>Gender</h5>
                                <p v-if="userInfo.gender == 'm'">Male</p>
                                <p v-else>Female</p>
                            </div>
                            <div class="profile-content">
                                <h5>Date of Birth</h5>
                                <p>{{ format(userInfo.dob, 'MMMM do, yyyy') }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-profile-options">
                        <PButton label="Edit" design="gradient-small" @click="() => handleModalOption('Edit')" />
                        <PButton label="Logout" design="gradient-small" @click="() => handleModalOption('Logout')" />
                    </div>
                </div>
            </div>
        </div>
    </template>
    <!-- -----------------------------------------------------------DESKTOP------------------------------------------------------->
    <template v-if="!isMobile">
        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage="userStore.profile_picture" backButton />
            </div>
            <div class="itnry-container">
                <h1>Booking Status: <p class="role-bubble" :class="statusClass" style="display: inline; font-size: 1rem;">
                        {{ bookingData?.status?.name }}</p>
                </h1>
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
                        :layoverDuration="layoverDurationCalc(itinerary.arrival_time, departItineraries[index + 1].departure_time)">
                    </PFlight>
                </div>

                <div v-if="bookingData?.itinerary?.itinerary?.length > 1" class="itnry-container">
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
                            :layoverDuration="layoverDurationCalc(itinerary.arrival_time, returnItineraries[index + 1].departure_time)">
                        </PFlight>
                    </div>
                </div>
            </div>
        </div>
    </template>
    <!-- -----------------------------------------------------------MOBILE------------------------------------------------------->
    <template v-if="isMobile">
        <div class="flight-itinerary">
            <PEvent design="itinerary-header" :airline="bookingData?.itinerary?.airline" :name="'Flight Itinerary'"
                :pictureLink="bookingData?.itinerary?.logoURL" @back-click="() => handleBack('Event')" />

            <div class="p-event__container">
                <h1>Booking Status: <p class="role-bubble" :class="statusClass" style="text-align: center; margin-right: 0; font-size: 1rem;">
                        {{ bookingData?.status?.name }}</p>
                </h1>
                <h1>Departing Itinerary</h1>
                <div class="p-event__entry" v-for="(itinerary, index) in departItineraries" :key="index">
                    <PFlight design="itinerary" v-bind="itinerary" :flightDepTime="itinerary.departure_time"
                        :flightArrTime="itinerary.arrival_time" :destinationCity="itinerary.destination_city"
                        :originCity="itinerary.origin_city" :flightNumber="itinerary.flight_num"
                        :flightClass="itinerary.class" :flightDuration="itinerary.duration" :currentIndex="index + 1"
                        :totalFlights="departItineraries.length"
                        :flightDate="new Date(itinerary.departure_date.split('-')[0], itinerary.departure_date.split('-')[1] - 1, itinerary.departure_date.split('-')[2])">
                    </PFlight>
                    <PFlight v-if="index !== departItineraries.length - 1" design="layover" v-bind="itinerary"
                        :layoverDuration="layoverDurationCalc(itinerary.arrival_time, departItineraries[index + 1].departure_time)"></PFlight>
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
                        :layoverDuration="layoverDurationCalc(itinerary.arrival_time, returnItineraries[index + 1].departure_time)"></PFlight>
                </div>
            </div>
        </div>
    </template>
</template>