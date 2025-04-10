<script>
export { default as PlannerInvite } from './PlannerInvite.vue'
</script>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PButton, PTextField, PFinanceBlock, PEvent } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import api from '../assets/scripts/api.js'

const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()
const userStore = useUserStore()
const selectedUsers = ref([])
const newUsers = ref([])
const selectedFinman = ref('')
const emailInput = ref('')
const inviteEmail = ref('')
const isModalVisible = ref(false)
const isOrgListPage = computed(() => route.path.includes('/org/list'))
const orgId = computed(() => route.params.orgId)
console.log('Organization ID:', orgId.value)

// Modal-specific reactive: do not include modal display logic here.
// The parent is responsible for showing/hiding this component.

// Functions remain the same:

// Validate email and add to newUser array
const addUser = async (emailAddress) => {
    if (emailAddress.trim() === '') {
        console.error('Email cannot be empty')
        return;
    } else {
        try {
            const schema = {
                eventId: eventStore.currentEvent.id,
                attendee: { email: emailAddress }
            }

            console.log('Creating user:', schema)

            const response = await api.apiFetch('/events/invite/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema),
                credentials: 'include'
            })

            if (response.ok) {
                const result = await response.json()
                emailInput.value = ''
                console.log('User created successfully:', result)
                loadOrgUsers()
            } else {
                console.error('FAILED to create user:', await response.json())
            }

        } catch (error) {
            console.error('Error creating user:', error)
        }
    }


}

const handleSendInvites = async () => {
    try {
        if (newUsers.value.length > 0) {
            await createAttendeeAndInvite()
        } else {
            console.log('No new users to invite.')
        }
        router.push({ name: 'Home' })
    } catch (error) {
        console.error('Error sending invites:', error)
    }
}

const createAttendeeAndInvite = async () => {
    try {
        const schema = {
            eventId: eventStore.currentEvent.id,
            attendee: { email: inviteEmail.value }
        }

        console.log('Creating user:', schema)
        const response = await api.apiFetch('/events/invite/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

const loadOrgUsers = async () => {
    userStore.clearUserList()
    try {
        const response = await api.apiFetch(`/organization/${userStore.org.id}/users`, {
            method: 'GET',
            credentials: 'include'
        })


        if (response.ok) {
            const result = await response.json()
            console.log('Organization users:', result)
            userStore.setUserList(result)
        } else {
            console.error('Failed to load organization users:', await response.json())
        }
    } catch (error) {
        console.error('Error loading organization users:', error)
    }
}

const adminGetUsers = async () => {
    userStore.clearUserList()
    try {
        const response = await api.apiFetch(`/organization/${orgId.value}/users`, {
            method: 'GET',
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            console.log('Admin: Organization users:', result)
            userStore.setUserList(result)
        } else {
            console.error('Failed to load organization users:', await response.json())
        }
    } catch (error) {
        console.error('Error loading organization users:', error)
    }
}

const toggleUserSelection = (userID) => {
    const user = { id: userID }
    if (selectedUsers.value.some(selectedUser => selectedUser.id === userID)) {
        selectedUsers.value = selectedUsers.value.filter(selectedUser => selectedUser.id !== userID)
        console.log('User unselected:', user)
    } else {
        selectedUsers.value.push(user)
        console.log('User selected:', user)
    }
    console.log('Selected users:', selectedUsers.value)
}

const isUserSelected = (userID) => {
    return selectedUsers.value.some(selectedUser => selectedUser.id === userID)
}

const selectFinanceManager = (userID) => {
    if (selectedFinman.value === userID) {
        selectedFinman.value = ''
        console.log('Finance manager unselected:', userID)
    } else {
        selectedFinman.value = userID
        console.log('Finance manager selected:', userID)
    }
}

const isFinanceManagerSelected = (userID) => {
    return selectedFinman.value === userID
}

const closeModal = () => {
    isModalVisible.value = false
}

const openModal = () => {
    isModalVisible.value = true
}

//Function to handle the back button
const handleBack = (targetRoute) => {
    router.push({ name: targetRoute })
}

onMounted(() => {
    if (!isOrgListPage.value) {
        loadOrgUsers()
    } else {
        adminGetUsers()
    }
})

</script>


<template>

    <template v-if="isOrgListPage">
        <div class="planner-event">
            <PEvent design="small-header" eventName="Invitations" @back-click="() => handleBack('Home')"/>
            <div class="event-invite">

                <h2>Org Admins</h2>
                <div class="p-event__container">
                    <PFinanceBlock design="invite"
                        v-for="user in userStore.users.filter(user => user.role_id === 'Org Admin')"
                        :key="user.user_id" :name="user.first_name + ' ' + user.last_name" :email="user.email"
                        :profileImage="user.profile_picture"
                        :class="{ selected: isFinanceManagerSelected(user.user_id) }"
                        @click="selectFinanceManager(user.user_id)" required />
                </div>

                <h2>Event Planners</h2>
                <div class="p-event__container">
                    <PFinanceBlock design="invite"
                        v-for="user in userStore.users.filter(user => user.role_id === 'Event Planner')"
                        :key="user.user_id" :name="user.first_name + ' ' + user.last_name" :email="user.email"
                        :profileImage="user.profile_picture"
                        :class="{ selected: isFinanceManagerSelected(user.user_id) }"
                        @click="selectFinanceManager(user.user_id)" required />
                </div>

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
                        v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')" :key="user.user_id"
                        :name="(user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) : user.email"
                        :email="user.email" :profileImage="user.profile_picture"
                        :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.user_id" :email="user.email"
                        :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <PButton design="planner" @click="openModal" label="Add User"></PButton>
                </div>
                <PButton label="Send Invites" @click="handleSendInvites" design="gradient"></PButton>
            </div>
        </div>
    </template>

    <template v-else>

        <div class="planner-event">
            <PEvent design="small-header" eventName="Invitations" @back-click="() => handleBack('Home')"/>
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
                        v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')" :key="user.user_id"
                        :name="(user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) : user.email"
                        :email="user.email" :profileImage="user.profile_picture"
                        :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.user_id" :email="user.email"
                        :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <PButton design="planner" @click="openModal" label="Add User"></PButton>
                </div>
                <PButton label="Send Invites" @click="handleSendInvites" design="gradient"></PButton>
            </div>
        </div>

    </template>

    <template v-if="isModalVisible">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal">
            <div class="new-user">
                <PTextField v-model="emailInput" label="Enter Attendee Email" />
                <PButton @click="addUser(emailInput)" design="gradient" label="Send Invite"></PButton>
            </div>
        </div>
    </template>

</template>

<!-- <PEvent design="small-header" eventName="Create an Event" @back-click="handleBack('Home')" />
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
            <PFinanceBlock design="invite" v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')"
                :key="user.user_id"
                :name="(user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) : user.email"
                :email="user.email" :profileImage="user.profile_picture"
                :class="{ selected: isUserSelected(user.user_id) }" @click="toggleUserSelection(user.user_id)" />


        <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.email" :email="user.email"
        :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
        @click="toggleUserSelection(user.user_id)" /> -->

<!-- Optionally, add user functionality can also be part of the modal content
</div> -->

<!-- <PButton label="Send Invites" @click="handleSendInvites" design="gradient" /> -->


<!-- <div>
    <PTextField v-model="emailInput">
    </PTextField>
    <PButton label="Send Invite to New User" design="gradient" @click="addUser(emailInput)" />
</div> -->
