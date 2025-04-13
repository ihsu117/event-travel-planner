<script setup>
import {
    PButton,
    PTextField,
    PEvent,
    PProfilePic,
    PFinanceBlock
} from '@poseidon-components'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import { format, parseISO } from 'date-fns';
import api from '../assets/scripts/api.js'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import HeaderBar from './Headerbar.vue'
import VueGoogleAutocomplete from "vue-google-autocomplete"
import { de } from 'date-fns/locale'


const router = useRouter()
const eventName = ref('')
const description = ref('')
const destinationCode = ref('')
const startDate = ref('')
const endDate = ref('')
const dateRange = ref([])
const pictureLink = ref('') // This will hold the base64-encoded image
const maxBudget = ref('')
const eventStore = useEventStore()
const userStore = useUserStore()
const isInvitePage = ref(false)
const selectedUsers = ref([])
const selectedFinman = ref('')
const org = userStore.org_id
const attendees = ref([])
const newUsers = ref([])
const newEmail = ref('')
const inviteEmail = ref('')
const lastCreatedEventId = ref(null)
const userInfo = ref({});
const latitude = ref('');
const longitude = ref('');

const organizations = ref([])

//Computed properties to check the role of the user
const isAttendee = computed(() => userStore.role_id === 'Attendee')
const isFinance = computed(() => userStore.role_id === 'Finance Manager')
const isEventPlanner = computed(() => userStore.role_id === 'Event Planner')
const isAdmin = computed(() => userStore.role_id === 'Org Admin')
const isSiteAdmin = computed(() => userStore.role_id === 'Site Admin')
console.log('Role:', userStore.role_id)

const isMobile = ref(window.innerWidth <= 768);

const updateScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
};

//Fetch from the API
onMounted(async () => {
    window.addEventListener('resize', updateScreenSize);
    checkAuth()
    console.log('User ID:', userStore.user_id)
    if (isSiteAdmin.value) {
        try {
            const response = await api.apiFetch('/organizations', {
                credentials: 'include'
            })
            if (response.ok) {
                const orgData = await response.json()
                console.log('Organizations:', orgData)
                organizations.value = orgData
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', response.statusText)
        }
    } else if (isAdmin.value) {
        try {
            const response = await api.apiFetch(`/organizations/${userStore.user_id}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const orgData = await response.json()
                console.log('Organizations:', orgData)
                events.value = orgData
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', response.statusText)
        }
    }
}
)


onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
});

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


const handleOrgClick = (org) => {
    router.push({ name: 'OrgList', params: { orgId: org.id } });
}

const isModalVisible = ref(false)

// Function to open the modal
const openModal = async () => {
    await fetchUserData();
    isModalVisible.value = true
}

// Function to close the modal
const closeModal = () => {
    isModalVisible.value = false
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

// Function to handle image upload and convert to base64
const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = () => {
            pictureLink.value = reader.result // Set the base64 string to pictureLink
        }
        reader.readAsDataURL(file) // Convert the file to a base64 string
    }
}

const createEvent = async () => {
    try {
        const eventData = {
            name: eventName.value,
            description: description.value,
            startDate: formatDateForBackend(startDate.value),
            endDate: formatDateForBackend(endDate.value),
            destinationCode: destinationCode.value,
            // lat: latitude.value,
            // long: longitude.value,
            pictureLink: pictureLink.value, // Send the base64-encoded image
            maxBudget: maxBudget.value,
            financeMan: {},
            autoApprove: Boolean(false),
        }

        const response = await api.apiFetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData),
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Event created successfully:', result)
            toEventPage(result.eventId)

        } else {
            console.error('Failed to create event:', await response.json())
        }
    } catch (error) {
        console.error('Error creating event:', error)
    }
}

const createEventDesktop = async () => {
    try {
        const eventData = {
            name: eventName.value,
            description: description.value,
            startDate: formatDateForBackend(dateRange.value[0]),
            endDate: formatDateForBackend(dateRange.value[1]),
            // destinationCode: destinationCode.value,
            lat: latitude.value,
            long: longitude.value,
            pictureLink: pictureLink.value, // Send the base64-encoded image
            maxBudget: maxBudget.value,
            financeMan: {},
            autoApprove: Boolean(false),
        }

        const response = await api.apiFetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData),
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Event created successfully:', result)
            toEventPage(result.eventId)

        } else {
            console.error('Failed to create event:', await response.json())
        }
    } catch (error) {
        console.error('Error creating event:', error)
    }
}

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

const toEventPage = async (eventId) => {
    try {
        const response = await api.apiFetch('/events/' + eventId, {
            credentials: 'include'
        })
        if (response.ok) {
            const eventData = await response.json()
            eventStore.setCurrentEvent(eventData)
        }
    } catch (error) {
        console.error('Failed to fetch the selected event:', error)
    }
    router.push({ name: 'Event', query: { editView: 'true', eventID: eventId } })
}

const parseDate = (date) => {
    if (!date) return null;
    return typeof date === 'string' ? parseISO(date) : date;
};

const formatDateForBackend = (date) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return '';
    return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");
};

const handlePlaceChanged = (place) => {
    latitude.value = place.latitude;
    longitude.value = place.longitude;
    console.log('Selected Location:', place);
}

// Computed style for the background image
const backgroundImageStyle = computed(() => {
  return pictureLink.value
    ? { backgroundImage: `url(${pictureLink.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
});

</script>

<template>
    <template v-if="isMobile">
        <div class="planner-event">

            <PEvent design="small-header" eventName="Create an Event" @back-click="handleBack('Home')" />
            <div class="event-form">
                <div class="planner-event-name">
                    <h2>Name</h2>
                    <PTextField label="Event Name" v-model="eventName" required />
                </div>
                <div class="planner-event-destination">
                    <h2>Destination</h2>
                    <PTextField label="Event Name" v-model="destinationCode" />
                    <vue-google-autocomplete class="p-textfield" id="map" types="airport" country="us"
                        classname="form-control" placeholder="Destination Airport"
                        v-on:placechanged="handlePlaceChanged">
                    </vue-google-autocomplete>
                </div>
                <div class="planner-description">
                    <h2>Description</h2>
                    <PTextField design="textarea" :maxlength=400 label="Description" v-model="description" />
                </div>

                <div class="planner-dates">
                    <div class="planner-start-date">
                        <h2>Start Date</h2>
                        <VueDatePicker v-model="startDate" :enable-time-picker="false" :placeholder="'Start Date'"
                            exactMatch="true" :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            hide-input-icon>
                        </VueDatePicker>
                    </div>
                    <div class="planner-end-date">
                        <h2>End Date</h2>
                        <VueDatePicker v-model="endDate" :enable-time-picker="false" :placeholder="'End Date'"
                            exactMatch="true" :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply
                            hide-input-icon>
                        </VueDatePicker>
                    </div>

                </div>

                <div class="planner-event-picture">
                    <h2>Picture</h2>
                    <!-- File input for image upload -->
                    <input type="file" accept="image/*" @change="handleImageUpload" />
                    <p v-if="pictureLink">Image uploaded successfully!</p>
                </div>
                <div class="planner-event-budget">
                    <h2>Max Budget</h2>
                    <PTextField label="Max Budget" v-model="maxBudget" required />
                </div>
            </div>
        </div>
        <PButton label="Create Event" @click="createEvent" design="gradient"></PButton>
    </template>

    <template v-if="isModalVisible">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal">
            <div class="new-user">
                <PTextField v-model="newEmail" label="Enter Attendee Email" />
                <PButton @click="addUser" design="login" label="Send Invite"></PButton>
            </div>
        </div>
    </template>


    <!--------------------------------------------------------------- DESKTOP --------------------------------------------------------------->
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

    <!--Event Create Page for event planner-->

    <template v-if="isEventPlanner && !isMobile">
        <div class="home-header-desktop">
            <div class="home-header__text-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
        </div>
        <div class="event-desktop-container">
            <div class="event-desktop-contentBox" :style="{
                backgroundImage: `var(--gradient), url(${pictureLink})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }">

                <div class="event-desktop-contentBox__info">
                    <div class="event-desktop-contentBox__textField">
                        <input type="text" v-model="eventName" placeholder="Event Name" required />
                    </div>
                    <h2>Hosted By {{ userStore.org.name }}</h2> <!-- Organization name -->
                </div>
                <!-- <label for="imageUpload">this is atest</label>
                <input id="imageUpload" type="file" accept="image/*" @change="handleImageUpload" />
                <p v-if="pictureLink">Image uploaded successfully!</p> -->
                <div class="file-input-wrapper">
                    <label for="file-upload" class="custom-file-label">
                        <span>Add Image</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M18 20H4V6h9V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2zm-7.79-3.17l-1.96-2.36L5.5 18h11l-3.54-4.71zM20 4V1h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V6h3V4z" />
                        </svg>
                    </label>

                    <input type="file" id="file-upload" accept="image/*" @change="handleImageUpload" />
                </div>
            </div>
            <div class="event-form__desktop">
                <div class="event-form__desktop--topbar">
                    <div class="planner-date">
                        <h2>Date</h2>
                        <VueDatePicker class="evTopMargin" v-model="dateRange" :range="true" :enable-time-picker="false"
                            :placeholder="'mm/dd/yyyy - mm/dd/yyyy'" exactMatch="true"
                            :config="{ closeOnAutoApply: false, keepActionRow: true }" auto-apply hide-input-icon>
                        </VueDatePicker>
                    </div>
                    <div class="planner-event-budget">
                        <h2>Budget</h2>
                        <PTextField class="evTopMargin" label="Max Budget" v-model="maxBudget" placeholder="$00000" required />
                    </div>
                    <div class="planner-event-destination">
                        <h2>Destination</h2>
                        <vue-google-autocomplete class="p-textfield" id="map" types="airport" country="us"
                            classname="form-control" placeholder="Destination Airport"
                            v-on:placechanged="handlePlaceChanged" required>
                        </vue-google-autocomplete>
                    </div>
                </div>

                <div class="planner-description">
                    <h2>Description</h2>
                    <PTextField class="evTopMargin" design="textarea" :maxlength=400 label="Description"
                        v-model="description" required />
                </div>
                <br>
                <br>
                <br>
                <div class="submitDiv">
                    <PButton label="Create Event" @click="createEventDesktop" design="gradient"></PButton>
                </div>
            </div>
        </div>
    </template>

</template>