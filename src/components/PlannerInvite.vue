<script>
export { default as PlannerInvite } from './PlannerInvite.vue'
</script>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PButton, PTextField, PFinanceBlock } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import api from '../assets/scripts/api.js'

const router = useRouter()
const eventStore = useEventStore()
const userStore = useUserStore()
const selectedUsers = ref([])
const selectedFinman = ref('')
const newUsers = ref([])
const newEmail = ref('')
const inviteEmail = ref('')

// Modal-specific reactive: do not include modal display logic here.
// The parent is responsible for showing/hiding this component.

// Functions remain the same:


const addUser = () => {
    if (newEmail.value.trim() === '') {
        console.error('Email cannot be empty')
        return;
    }
    const newUser = { email: newEmail.value, profile_picture: '' }
    newUsers.value.push(newUser)
    inviteEmail.value = newEmail.value
    newEmail.value = ''
    // You may want to notify parent that the modal should close.
    console.log('User added:', newUser)
}

const handleSendInvites = async () => {
    try {
        await createEvent()
        console.log('EventID: ', lastCreatedEventId.value)

        if (newUsers.value.length > 0) {
            await createUser()
        } else {
            console.log('No new users to invite.')
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
const handleUpdate = ({ field, value }) => {
    if (field === 'newEmailAddress') newEmail.value = value
    console.log("HANDLE", field, value)
}

onMounted(() => {
    loadOrgUsers()
})

</script>

<template>
    <div class="modal-overlay">
        <div class="modal modal-container">
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


                    <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.email" :email="user.email"
                        :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <!-- Optionally, add user functionality can also be part of the modal content -->
                </div>

                <PButton label="Send Invites" @click="handleSendInvites" design="gradient" />
                <div>
                    <PTextField v-model="newEmail" design="textarea-edit"
                        @update:modelValue="value => handleUpdate({ field: 'newEmailAddress', value })">
                    </PTextField>
                    <PButton label="Send Invite to New User" design="gradient" @click="addUser" />
                </div>
            </div>
        </div>
    </div>
</template>
