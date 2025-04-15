<script setup>
import {
    PButton,
    PTextField,
    PEvent,
    PProfilePic,
} from '@poseidon-components'
import '@poseidon-styles/index.css'
import { useEventStore } from '../stores/eventStore'
import { useFlightStore } from '../stores/flightStore'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import api from '../assets/scripts/api.js'
import { format } from 'date-fns'
import HeaderBar from './Headerbar.vue'
import PlannerInvite from './PlannerInvite.vue'

const eventStore = useEventStore()
const flightStore = useFlightStore()
const userStore = useUserStore()
const router = useRouter()

const events = ref([])
const organizations = ref([])
const userInfo = ref({});
const editView = ref(false)
const loading = ref(false)
const eventContainer = ref(null)
const orgModal = ref(false)
const inviteModalID = ref(null)
const isInviteVisible = ref(false)
const searchQuery = ref('')

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

//Fetch events from the API
onMounted(async () => {
    window.addEventListener('resize', updateScreenSize);
    checkAuth()
    fetchData()
    console.log('User ID:', userStore.user_id)
    loading.value = true

});

onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
});

const fetchData = async () => {
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
        } finally {
            loading.value = false // Set loading to false after API call
        }
    } else if (isAdmin.value) {
        try {
            const response = await api.apiFetch(`/organization/${userStore.org.id}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const orgData = await response.json()
                console.log('Organizations:', orgData)
                events.value = orgData
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', response.statusText)
        } finally {
            loading.value = false // Set loading to false after API call
        }
    } else {
        try {
            const response = await api.apiFetch('/events', {
                credentials: 'include'
            })
            if (response.ok) {
                const eventsData = await response.json()
                console.log('Events:', eventsData)
                events.value = eventsData
            }
        } catch (error) {
            console.error('Failed to fetch events:', error)
        } finally {
            loading.value = false // Set loading to false after API call
        }
    }
}

const filteredOrganizations = computed(() => {
    const orgs = organizations.value.slice(1);
    if (!searchQuery.value.trim()) {
        return orgs;
    }
    const query = searchQuery.value.toLowerCase();
    return orgs.filter(org => org.name.toLowerCase().includes(query));
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

const handleEventClick = async (eventData) => {
    try {
        const response = await api.apiFetch('/events/' + eventData.id, {
            credentials: 'include'
        })
        if (response.ok) {
            eventData = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch the selected event:', error)
    }
    eventStore.setCurrentEvent(eventData)
    if (isAttendee.value) {
        router.push({ name: 'Event' })
    } else if (isFinance.value) {
        router.push({ name: 'Finance' })
    } else if (isEventPlanner.value) {
        router.push({ name: 'Event' })
    }
}

const handleCreateEvent = () => {
    if (isEventPlanner.value) {
        router.push({ name: 'EventCreate' })
    }
}

const handleCreateOrg = () => {
    if (isSiteAdmin.value) {
        openModal()
    }
}

const handleEditEventClick = async (eventData) => {
    try {
        const response = await api.apiFetch('/events/' + eventData.id, {
            credentials: 'include'
        })
        if (response.ok) {
            eventData = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch the selected event:', error)
    }
    if (isEventPlanner.value) {
        eventStore.setCurrentEvent(eventData);
        router.push({ name: 'Event', query: { editView: 'true', eventID: eventData.id } });
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

const orgModalOpen = () => {
    orgModal.value = true
}
const orgModalClose = () => {
    orgModal.value = false
}

const inviteModalName = ref('')

const inviteModalOpen = (orgId, orgName) => {
    isInviteVisible.value = true
    inviteModalID.value = orgId
    inviteModalName.value = orgName
}
const inviteModalClose = () => {
    isInviteVisible.value = false
    inviteModalID.value = ''
    inviteModalName.value = ''
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

// Filter past events for Previous Events section
const previousEvents = computed(() =>
    events.value.filter(event => new Date(event.endDate) < new Date())
)
const upcomingEvents = computed(() =>
    events.value.filter(event => new Date(event.endDate) >= new Date())
)

const orgName = ref('')
const createOrg = () => {
    console.log('Creating organization:', orgName.value)
    if (orgName.value) {
        api.apiFetch('/organization',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json', // Add this header
                },
                body: JSON.stringify({
                    name: orgName.value
                })
            }).then(response => {
                if (response.ok) {
                    orgName.value = ''
                    orgModalClose()
                    fetchData()

                } else {
                    console.error('Failed to create organization:', response.statusText)
                }
            }).catch(error => {
                console.error('Error creating organization:', error)
            })
    }
}


const handleHScroll = (e) => {
    const element = e.currentTarget;
    if (element) {
        if (e.deltaY > 0) element.scrollLeft += 100;
        else element.scrollLeft -= 100;
    }
}

</script>

<template>

    <!-------------------------------------------------------------------MODAL------------------------------------------------------------------->

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

    <!-------------------------------------------------------------------DESKTOP VIEWS------------------------------------------------------------------->

    <!--Home Page for Attendee-->

    <template v-if="isAttendee && !isMobile">

        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="home-body-wrapper">
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll" ref="scrWrapper">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <!--Dynamic Events-->
                        <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :maxBudget="event.maxBudget" :destinationCode="event.destinationCode"
                            :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                            :autoApproveThreshold="event.autoApproveThreshold" design="block"
                            @event-click="handleEventClick" />

                    </div>
                    <div v-if="!loading && upcomingEvents.length == 0" style="color: black;">
                        <p>You have not been invited to any upcoming events...</p>
                    </div>
                </div>

                <hr>
                <h1>Previous Events</h1>
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                            :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                            design="block" @event-click="handleEventClick" />
                    </div>
                    <div v-if="!loading && previousEvents.length == 0" style="color: black;">
                        <p>You have no previous events to show...</p>
                    </div>

                </div>
                <hr>
            </div>
            

        </div>
    </template>

    <!-- Home Page for Financial Manager -->
    <template v-if="isFinance && !isMobile">
        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="home-body-wrapper">
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll" ref="scrWrapper">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <!--Dynamic Events-->
                        <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :maxBudget="event.maxBudget" :destinationCode="event.destinationCode"
                            :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                            :autoApproveThreshold="event.autoApproveThreshold" design="block-finance"
                            @event-click="handleEventClick" />

                    </div>

                    <div v-if="!loading && upcomingEvents.length == 0" style="color: black;">
                        <p>You have not been invited to any upcoming events...</p>
                    </div>

                </div>
                <hr>
                <h1>Previous Events</h1>
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                            :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                            design="block-finance" @event-click="handleEventClick" />
                    </div>

                    <div v-if="!loading && previousEvents.length == 0" style="color: black;">
                        <p>You have no previous events to show...</p>
                    </div>

                </div>
                <hr>

            </div>
            

        </div>
    </template>

    <!--Home Page for event planner-->

    <template v-if="isEventPlanner && !isMobile">

        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <h1>Upcoming Events</h1>
                <PButton label="Create Event" @click="handleCreateEvent" design="gradient-small"></PButton>
            </div>
            <div class="home-body-wrapper">
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll" ref="scrWrapper">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <!--Dynamic Events-->
                        <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :maxBudget="event.maxBudget" :destinationCode="event.destinationCode"
                            :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                            :autoApproveThreshold="event.autoApproveThreshold" design="block-planner"
                            @event-click="handleEventClick" @editClick="handleEditEventClick" />

                    </div>
                    <div v-if="!loading && upcomingEvents.length == 0" style="color: black;">
                        <p>You have not been invited to any upcoming events...</p>
                    </div>

                </div>

                <hr>
                <h1>Previous Events</h1>
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <div class="scroll-wrapper" @wheel.stop="handleHScroll">
                    <div class="p-event__container-desktop" ref="eventContainer">
                        <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                            :eventName="event.name" :startDate="new Date(event.startDate)"
                            :endDate="new Date(event.endDate)" :pictureLink="event.pictureLink"
                            :description="event.description" :currentBudget="event.currentBudget"
                            :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                            :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                            design="block-planner" @event-click="handleEventClick" />
                    </div>
                    <div v-if="!loading && previousEvents.length == 0" style="color: black;">
                        <p>You have no previous events to show...</p>
                    </div>

                </div>
                <hr>
            </div>

        </div>
    </template>

    <!--Home Page for Site Admin-->

    <template v-if="isSiteAdmin && !isMobile">
        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <div class="home-desktop__admin-body">
                <div class="home-desktop__admin-search">
                    <h1>Organizations</h1>
                    <div class="home-desktop__admin-searchHeader">
                        <label for="searchBox">Search</label>
                        <PTextField id='searchBox' label="Search" v-model="searchQuery"
                            placeholder="Organization Name" />
                    </div>
                    <hr>
                </div>

                <!--Organizations-->

                <div class="home-desktop__admin-buttonGrid">
                    <div v-if="filteredOrganizations.length > 0" class="p-event__wrapper--NoGradient">
                        <PButton label="Create Organization" @click="orgModalOpen()" design="planner"></PButton>
                        <div v-if="loading" class="spinner">
                            <div class="loading-spinner" v-show="loading">
                                <span class="loader"></span>
                            </div>
                        </div>
                        <!--Dynamic Organizations (Filtered)-->
                        <PEvent design="org-block" v-for="org in filteredOrganizations" :key="org.id" :id="org.id"
                            :organization="org" @click="inviteModalOpen(org.id, org.name)" />
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isSiteAdmin && !isMobile && isInviteVisible" class="planner-invite-modal">
            <div class="modal-overlay" @click="inviteModalClose"></div>
            <div class="modal modal-container">
                <PlannerInvite :modalOrgId="inviteModalID" :orgName="inviteModalName"></PlannerInvite>
            </div>
        </div>
    </template>

    <template v-if="isAdmin && !isMobile">
        <div class="home-desktop">
            <div class="home-header-desktop">
                <HeaderBar :openModal="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <div class="home-desktop__admin-body">
                <div class="home-desktop__admin-search">
                    <h1>Organizations</h1>
                    <div class="home-desktop__admin-searchHeader">
                        <label for="searchBox">Search</label>
                        <PTextField id='searchBox' label="Search" v-model="searchQuery"
                            placeholder="Organization Name" />
                    </div>
                    <hr>
                </div>

                <!--Organizations-->

                <div class="home-desktop__admin-search">              
                        <PEvent design="org-block" :id="userStore.id"
                            :organization="userStore.org" @click="inviteModalOpen(userStore.id, userStore.org.name)" />
                </div>
            </div>
        </div>

        <div v-if="isAdmin && !isMobile && isInviteVisible" class="planner-invite-modal">
            <div class="modal-overlay" @click="inviteModalClose"></div>
            <div class="modal modal-container">
                <PlannerInvite :modalOrgId="inviteModalID" :orgName="inviteModalName"></PlannerInvite>
            </div>
        </div>
    </template>


    <!-------------------------------------------------------------------MOBILE VIEW------------------------------------------------------------------->

    <!--Modal for User info-->
    <template v-if="isModalVisible && isMobile">
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
                        <PButton label="Edit" design="gradient-small" @click="() => handleModalOption('Edit')">Edit
                        </PButton>
                        <PButton label="Logout" design="gradient-small" @click="() => handleModalOption('Logout')">
                            Logout
                        </PButton>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <!--ORG CREATE MODAL-->

    <template v-if="orgModal">
        <div class="modal-overlay" @click="orgModalClose"></div>
        <div class="modal modal-container">
            <div class="modal-profile">
                <h4>Create Organization</h4>
                <PTextField label="Organization Name" v-model="orgName" placeholder="Enter organization name" />
                <PButton label="Create" design="gradient-small" @click="createOrg()" />
            </div>
        </div>
    </template>

    <!--Home Page for Attendee-->
    <template v-if="isAttendee && isMobile">
        <div class="home">
            <div class="home-header">

                <div class="home-header__text">
                    <p>Welcome, {{ userStore.first_name }}</p>
                    <p class="role-bubble">{{ userStore.role_id }}</p>
                </div>
                <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="p-event__container">
                <div v-if="loading" class="spinner">
                    <div class="loading-spinner" v-show="loading">
                        <span class="loader"></span>
                    </div>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :destinationCode="event.destinationCode"
                    :financeMan="event.financeMan" :autoApprove="event.autoApprove"
                    :autoApproveThreshold="event.autoApproveThreshold" design="block" @event-click="handleEventClick"
                    :class="{ 'fade-in': true, 'show': !loading }" />
            </div>
            <hr>
            <h1>Previous Events</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :maxBudget="event.maxBudget"
                    :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                    :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                    design="block-planner" @editClick="handleEditEventClick(event)"
                    @event-click="handleEditEventClick(event)" />
            </div>
        </div>
    </template>

    <!--Home Page for Finance-->
    <template v-if="isFinance && isMobile">
        <div class="home">
            <div class="home-header">
                <div class="home-header__text">
                    <p>Welcome {{ userStore.first_name }} </p>
                    <p class="role-bubble">{{ userStore.role_id }}</p>
                </div>
                <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :maxBudget="event.maxBudget"
                    :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                    :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                    design="block-finance" @event-click="handleEventClick" />
            </div>
            <hr>
            <h1>Previous Events</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :maxBudget="event.maxBudget"
                    :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                    :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                    design="block-planner" @editClick="handleEditEventClick(event)"
                    @event-click="handleEditEventClick(event)" />
            </div>
        </div>
    </template>

    <!--Home Page for Event Planner-->
    <template v-if="isEventPlanner && isMobile">
        <div class="home">
            <div class="home-header">

                <div class="home-header__text">
                    <p>Welcome, {{ userStore.first_name }}</p>
                    <p class="role-bubble">{{ userStore.role_id }}</p>
                </div>
                <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
            </div>
            <h1>Upcoming Events</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in upcomingEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :maxBudget="event.maxBudget"
                    :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                    :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                    design="block-planner" @editClick="handleEditEventClick(event)"
                    @event-click="handleEventClick(event)" />
                <PButton label="Create Event" @click="handleCreateEvent" design="planner"></PButton>
            </div>
            <hr>
            <h1>Previous Events</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent v-for="event in previousEvents" :key="event.id" :id="event.id" :organization="event.org"
                    :eventName="event.name" :startDate="new Date(event.startDate)" :endDate="new Date(event.endDate)"
                    :pictureLink="event.pictureLink" :description="event.description"
                    :currentBudget="event.currentBudget" :maxBudget="event.maxBudget"
                    :destinationCode="event.destinationCode" :financeMan="event.financeMan"
                    :autoApprove="event.autoApprove" :autoApproveThreshold="event.autoApproveThreshold"
                    design="block-planner" @editClick="handleEditEventClick(event)"
                    @event-click="handleEventClick(event)" />
            </div>
        </div>
    </template>

    <!--Home Page for Site Admin-->

    <template v-if="isSiteAdmin && isMobile">
        <div class="home">
            <div class="home-header">

                <div class="home-header__text">
                    <p>Welcome, {{ userStore.first_name }}</p>
                    <p class="role-bubble">{{ userStore.role_id }}</p>
                </div>
                <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
            </div>

            <h1>Organizations</h1>
            <div class="p-event__container">
                <PButton label="Create Org" @click="orgModalOpen()" design="planner"></PButton>
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent design="org-block" v-for="org in organizations.slice(1)" :key="org.id" :id="org.id"
                    :organization="org" @click="handleOrgClick(org)" />
            </div>
        </div>
    </template>

    <template v-if="isAdmin && isMobile">
        <div class="home">
            <div class="home-header">

                <div class="home-header__text">
                    <p>Welcome, {{ userStore.first_name }}</p>
                    <p class="role-bubble">{{ userStore.role_id }}</p>
                </div>
                <PProfilePic design="small" @click="openModal" :profileImage='userStore.profile_picture' />
            </div>

            <h1>Organizations</h1>
            <div class="p-event__container">
                <div class="loading-spinner" v-show="loading">
                    <span class="loader"></span>
                </div>
                <!--Dynamic Events-->
                <PEvent design="org-block" :organization="userStore.org" @click="handleOrgClick(userStore.org)" />
            </div>
        </div>
    </template>

</template>