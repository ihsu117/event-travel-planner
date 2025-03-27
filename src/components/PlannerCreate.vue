<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PButton, PTextField, PEvent, PFinanceBlock } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import api from '../assets/scripts/api.js'

const router = useRouter()
const eventName = ref('')
const description = ref('')
const destinationCode = ref('')
const startDate = ref('')
const endDate = ref('')
const pictureLink = ref('')
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
const isModalVisible = ref(false)
const lastCreatedEventId = ref(null);

const createEvent = async () => {
    try {
        const eventData = {
            name: eventName.value,
            description: description.value,
            startDate: startDate.value,
            endDate: endDate.value,
            destinationCode: destinationCode.value,
            pictureLink: pictureLink.value,
            maxBudget: maxBudget.value,
            financeMan: { id: selectedFinman.value },
            autoApprove: Boolean(false),
            autoApproveThreshold: 10,
            attendees: selectedUsers.value
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
            lastCreatedEventId.value = result.eventId
            console.log('Last created event ID:', lastCreatedEventId.value)
            return lastCreatedEventId.value
            
        } else {
            console.error('Failed to create event:', await response.json())
        }
    } catch (error) {
        console.error('Error creating event:', error)
    }
}

const addUser = () => {
    if (newEmail.value.trim() === '') {
        console.error('Email cannot be empty');
        return;
    }

    const newUser = {
        email: newEmail.value,
        profile_picture: ''
    }
    newUsers.value.push(newUser);
    inviteEmail.value = newEmail.value;
    newEmail.value = '';
    closeModal();
    console.log('User added:', newUser);
}

const handleSendInvites = async () => {
    try {
        await createEvent();
        console.log('EventID: ', lastCreatedEventId.value)

        if (newUsers.value.length > 0) {
            await createUser();
        } else {
            console.log('No new users to invite.');
        }
        router.push({ name: 'Home' }) 
    } catch (error) {
        console.error('Error sending invites:', error)
    }
}

const createUser = async () => {
    try {
        const schema = {
            eventId: lastCreatedEventId.value,
            attendee: {
                email: inviteEmail.value
            }
        }

        console.log('Creating user:', schema)
        const response = await api.apiFetch('/events/invite/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schema),
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            console.log('User created successfully:', result)
        } else {
            console.error('Failed to create user:', await response.json())
        }
    } catch (error) {
        console.error('Error creating user:', error)
    }
}

const handleBack = (targetRoute) => {
    router.push({ name: targetRoute });
}

const toEventPage = () => {
    isInvitePage.value = true
}

const loadOrgUsers = async () => {
    try {
        const response = await api.apiFetch('/organization/users', {
            method: 'GET',
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Organization users:', result)
            userStore.setUser(result)
        } else {
            console.error('Failed to load organization users:', await response.json())
        }
    } catch (error) {
        console.error('Error loading organization users:', error)
    }
}

const toggleUserSelection = (userID) => {
    const user = {
        id: userID
    }
    if (selectedUsers.value.some(selectedUser => selectedUser.id === userID)) {
        // Remove user from selected users
        selectedUsers.value = selectedUsers.value.filter(selectedUser => selectedUser.id !== userID);
        console.log('User unselected:', user);
    } else {
        // Add user to selected users
        selectedUsers.value.push(user);
        console.log('User selected:', user);
    }
    console.log('Selected users:', selectedUsers.value);
}

const isUserSelected = (userID) => {
    return selectedUsers.value.some(selectedUser => selectedUser.id === userID);
}

const selectFinanceManager = (userID) => {
    if (selectedFinman.value === userID) {
        // Deselect the currently selected finance manager
        selectedFinman.value = '';
        console.log('Finance manager unselected:', userID);
    } else {
        // Select the new finance manager
        selectedFinman.value = userID;
        console.log('Finance manager selected:', userID);
    }
}

const isFinanceManagerSelected = (userID) => {
    return selectedFinman.value === userID;
}

const closeModal = () => {
    isModalVisible.value = false
}

const openModal = () => {
    isModalVisible.value = true
}

onMounted(() => {
    loadOrgUsers()
})
</script>

<template>
    <template v-if="isInvitePage">
        <div class="phone-container">
            <div class="planner-event">

                <PEvent design="small-header" name="Invitations" @back-click="isInvitePage = false" />
                <div class="event-invite">

                    <h2>Finance Manager</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Finance Manager')"
                            :key="user.user_id" :name="user.first_name + ' ' + user.last_name" :email="user.email"
                            :profileImage="user.profile_picture"
                            :class="{ selected: isFinanceManagerSelected(user.user_id) }"
                            @click="selectFinanceManager(user.user_id)" required />
                    </div>

                    <h2>Attendees</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')"
                            :key="user.user_id" :name="user.first_name + ' ' + user.last_name" :email="user.email"
                            :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
                            @click="toggleUserSelection(user.user_id)" />

                        <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.user_id"
                            :email="user.email" :profileImage="user.profile_picture"
                            :class="{ selected: isUserSelected(user.user_id) }"
                            @click="toggleUserSelection(user.user_id)" />

                        <PButton design="planner" @click="openModal" label="Add User"></PButton>
                    </div>
                    <PButton label="Send Invites" @click="handleSendInvites" design="gradient"></PButton>
                </div>
            </div>
        </div>
    </template>

    <template v-else>
        <div class="phone-container">

            <div class="planner-event">

                <PEvent design="small-header" name="Create an Event" @back-click="handleBack('Home')" />
                <div class="event-form">
                    <div>
                        <h2>Name</h2>
                        <PTextField label="Event Name" v-model="eventName" required />
                    </div>
                    <div>
                        <h2>Destination</h2>
                        <PTextField label="Destination Zip" v-model="destinationCode" required />
                    </div>
                    <div class="planner-description">
                        <h2>Description</h2>
                        <PTextField design="textarea" :maxlength=400 label="Description" v-model="description"
                            required />
                    </div>

                    <div class="planner-dates">
                        <div>
                            <h2>Start Date</h2>
                            <PTextField type="date" label="Start Date" v-model="startDate" required />
                        </div>
                        <div>
                            <h2>End Date</h2>
                            <PTextField type="date" label="End Date" v-model="endDate" required />
                        </div>

                    </div>

                    <div>
                        <h2>Picture Link</h2>
                        <PTextField label="Picture Link" v-model="pictureLink" required />
                    </div>
                    <div>
                        <h2>Max Budget</h2>
                        <PTextField label="Max Budget" v-model="maxBudget" required />
                    </div>
                </div>
                <PButton label="Create Event" @click="toEventPage" design="gradient"></PButton>
            </div>
        </div>
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

</template>