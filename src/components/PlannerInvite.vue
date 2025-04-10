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
const fileInput = ref(null)

const orgId = computed(() => route.params.orgId)
const role_id = ref('Attendee')
const isOrgListPage = computed(() => route.path.includes(`/org/list/${orgId.value}`))
console.log('Organization ID:', orgId.value)

// Modal-specific reactive: do not include modal display logic here.
// The parent is responsible for showing/hiding this component.

// Functions remain the same:

// Validate email and add to newUser array

const adminAddUser = async () => {
    try {
        const response = await api.apiFetch('/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailInput.value,
                role: role_id.value,
                org: orgId.value
            }),
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json()
            console.log('User created successfully:', result)
            emailInput.value = ''
            adminGetUsers()
        } else {
            console.error('Failed to create user:', await response.json())
        }
    } catch (error) {
        console.error('Error adding user:', error)
    }
}


const saveEmail = (emailAddress) => {
    if (emailAddress.trim() === '') {
        console.error('Email cannot be empty')
        return;
    } else {
        newEmail.value = emailAddress
        console.log('Email saved:', newEmail.value)
    }
}

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
            if (selectedFinman.value !== '') {
                try {
                    const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}`,
                        {
                            method: 'PUT',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                financeMan: {id: selectedFinman.value},

                            }),
                            credentials: 'include'
                        })
                    if (response.ok) {
                        const result = await response.json()
                        console.log('Invites sent successfully:', result)
                        router.push({ name: 'Home' })
                        SendInvites()
                    } else {
                        console.error('Failed to send invites:', await response.json())
                    }

                } catch (error) {
                    console.error('Error sending invites:', error)
                }
            } else {
                SendInvites();
            }
        } catch (error) {
            console.error('Error sending invites:', error)
        }
        console.log('Selected users:', selectedUsers.value)
    }

    const SendInvites = async () => {
        try {
            const response = await api.apiFetch('/events/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: eventStore.currentEvent.id,
                    attendees: selectedUsers.value.map(user => ({ id: user.user_id }))
                }),
                credentials: 'include'
            })
            if (response.ok) {
                const result = await response.json()
                console.log('Invites sent successfully:', result)
                if (newUsers.value.length > 0) {
                    createAttendeeAndInvite()
                }
            } else {
                console.error('Failed to send invites:', await response.json())
            }
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


    const addByCSV = () => {
        // Access the file input via its ref.
        const file = fileInput.value?.files[0];

        if (!file) {
            console.error("No file selected");
        return;
    }

    // Basic check to ensure the file is a CSV.
    if (!file.name.toLowerCase().endsWith(".csv")) {
        console.error("Selected file is not a .csv file");
        return;
    }

    // Create a FileReader to read the file.
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
        // Split the Data URL and extract the Base64-encoded string.
        const base64File = reader.result.split(",")[1];

        // Prepare the payload for the API.
        const payload = {
            fileName: file.name,
            fileType: "text/csv", // Explicitly set the fileType to "text/csv"
            fileData: base64File,
        };

        try {
            // POST the payload to the API.
            const response = await api.apiFetch(`/organization/${orgId.value}/importUsers`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                return;
            }

            const data = await response.json();
            console.log("Success:", data);
        } catch (error) {
            console.error("Network or Fetch Error:", error);
        }
    };

    reader.onerror = () => {
        console.error("FileReader Error:", reader.error);
    };
};


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
            <PEvent design="small-header" eventName="Invitations" @back-click="() => handleBack('Home')" />
            <div class="event-invite">
                <PButton design="planner" @click="openModal" label="Add User"></PButton>
                <form @submit.prevent="addByCSV">
                    <input type="file" ref="fileInput" name="file" accept=".csv" required />
                    <!-- The button triggers the form submission -->
                    <PButton label="Add User by .CSV" type="submit" design="gradient" />
                </form>

                <h2>Org Admins</h2>
                <div class="p-event__container">
                    <PFinanceBlock design="invite"
                        v-for="user in userStore.users.filter(user => user.role_id === 'Org Admin')" :key="user.user_id"
                        :name="user.first_name + ' ' + user.last_name" :email="user.email"
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

                </div>

            </div>
        </div>
    </template>

    <template v-else>

        <div class="planner-event">
            <PEvent design="small-header" eventName="Invitations" @back-click="() => handleBack('Home')" />
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
                    <PButton design="planner" @click="openModal" label="Add User"></PButton>
                    <PFinanceBlock design="invite"
                        v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')" :key="user.user_id"
                        :name="(user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) : user.email"
                        :email="user.email" :profileImage="user.profile_picture"
                        :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />

                    <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.user_id" :email="user.email"
                        :profileImage="user.profile_picture" :class="{ selected: isUserSelected(user.user_id) }"
                        @click="toggleUserSelection(user.user_id)" />
                </div>
                <div>
                    <PButton label="Send Invites" @click="handleSendInvites" design="gradient"></PButton>
                </div>
            </div>
        </div>

    </template>

    <template v-if="isModalVisible">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal">
            <div class="new-user">

                <div v-if="userStore.role_id == 'Site Admin' || userStore.role_id == 'Org Admin'" class="role-selection">
                    <label>
                        <input v-if="userStore.role_id == 'Site Admin'" type="radio" v-model="role_id"
                            value="Org Admin" />
                        Org Admin
                    </label>
                    <label>
                        <input type="radio" v-model="role_id" value="Event Planner" />
                        Event Planner
                    </label>
                    <label>
                        <input type="radio" v-model="role_id" value="Finance Manager" />
                        Finance Manager
                    </label>
                    <label>
                        <input type="radio" v-model="role_id" value="Attendee" default />
                        Attendee
                    </label>
                </div>
                <PTextField v-model="emailInput" label="Enter Attendee Email" />
                <PButton v-if="userStore.role_id == 'Site Admin' || userStore.role_id == 'Org Admin'" @click="adminAddUser"
                    design="gradient" label="Send Invite"></PButton>
                <PButton v-if="userStore.role_id == 'Event Planner'" @click="addUser(emailInput)" design="gradient"
                    label="Add User"></PButton>
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
