<script>
export { default as PlannerInvite } from './PlannerInvite.vue'
</script>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PButton, PTextField, PFinanceBlock, PEvent } from '@poseidon-components'
import { useEventStore } from '../stores/eventStore.js'
import { useUserStore } from '../stores/userStore.js'
import api from '../assets/scripts/api.js'

const props = defineProps({
    modalOrgId: {
        type: Number,
        default: null
    },
    orgName: {
        type: String,
        default: 'org'
    }
})

const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()
const userStore = useUserStore()
const selectedUsers = ref([])
const newUsers = ref([])
const selectedFinman = ref(eventStore.currentEvent.financeMan?.id || '')
const emailInput = ref('')
const inviteEmail = ref('')
const isModalVisible = ref(false)
const fileInput = ref(null)
const invitedUsers = ref([])
const csvUploadError = ref('')

const orgId = computed(() => route.params.orgId || props.modalOrgId)
const role_id = ref('Attendee')
const isOrgListPage = computed(() => route.path.includes(`/org/list/${orgId.value}`))
const isAdmin = computed(() => userStore.role_id === 'Org Admin' || userStore.role_id === 'Site Admin')
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

// ------------------------------------------

const addNewAttendee = async (email) => {
    if (email.trim() === '') {
        console.error('Email cannot be empty')
        return;
    } else {
        try {
            const schema = {
                eventId: eventStore.currentEvent.id,
                attendee: { email: email }
            }

            console.log('Creating user:', schema)

            const response = await api.apiFetch('/events/invite/new', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema),

            })

            if (response.ok) {
                const result = await response.json()
                emailInput.value = ''
                console.log('User created successfully:', result)
            } else {
                console.error('FAILED to create user:', await response.json())
            }

        } catch (error) {
            console.error('Error creating user:', error)
        }
    }
}

const addFinanceManager = async () => {

    if (selectedFinman.value !== '') {
        try {
            const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        financeMan: { id: selectedFinman.value },
                    }),
                })
            if (response.ok) {
                const result = await response.json()
                console.log('Invites sent successfully:', result)
            } else {
                console.error('Failed to send invites:', await response.json())
            }
        } catch (error) {
            console.error('Error sending invites:', error)
        }
        console.log('Selected users:', selectedUsers.value)
    }
}

const addAttendee = async () => {
    try {
        console.log('Selected users:', selectedUsers.value)
        const response = await api.apiFetch('/events/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventStore.currentEvent.id,
                attendees: selectedUsers.value
            }),
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            console.log('Invites sent successfully:', result)

        } else {
            console.error('Failed to send invites:', await response.json())
        }
    } catch (error) {
        console.error('Error sending invites:', error)
    }
}


const submitChange = async () => {
    if (selectedFinman.value == '') {
        console.error('No finance manager selected')
    } else {
        await addFinanceManager()
        if (selectedUsers.value.length > 0) {
            await addAttendee()
            if (newUsers.value.length > 0) {
                for (const user of newUsers.value) {
                    const email = user.id
                    await addNewAttendee(email)
                }
                newUsers.value = []
                console.log('New users:', newUsers.value)
            } else {
                console.error('No new users to invite')
            }
        } else {
            console.error('No users selected')
            if (newUsers.value.length > 0) {
                for (const user of newUsers.value) {
                    const email = user.id
                    await addNewAttendee(email)
                }
                newUsers.value = []
                console.log('New users:', newUsers.value)
            } else {
                console.error('No new users to invite')
            }
        }
    }
    getInvitedUsers()
    loadOrgUsers()
}

// User Loading --------------------------------
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

const getInvitedUsers = async () => {
    try {
        const response = await api.apiFetch(`/events/${eventStore.currentEvent.id}/attendees`, {
            method: 'GET',
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            console.log('Invited users:', result)
            invitedUsers.value = result
        } else {
            console.error('Failed to load invited users:', await response.json())
        }
    } catch (error) {
        console.error('Error loading invited users:', error)
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

const remainingUsers = computed(() => {
    const invited = invitedUsers.value || []
    return userStore.users.filter(user => {
        return user.role_id === 'Attendee' && !invited.some(invitedUser => invitedUser.id === user.user_id)
    })
})
//----------------------------------------


// User Selection Logic -------------------
const selectUser = (userID) => {
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

const makeNewUserEntry = (emailInput) => {
    if (emailInput.trim() === '') {
        console.error('Email cannot be empty')
        return;
    } else {
        const user = { id: emailInput, email: emailInput }
        if (newUsers.value.some(newUser => newUser.id === emailInput)) {
            newUsers.value = newUsers.value.filter(newUser => newUser.id !== emailInput)
            console.log('New user unselected:', user)
        } else {
            newUsers.value.push(user)
            console.log('New user selected:', user)
        }
        console.log('New users:', newUsers.value)
    }
    closeModal()
}

const selectNewUser = (email) => {
    const user = { id: email }
    if (newUsers.value.some(newUser => newUser.id === email)) {
        newUsers.value = newUsers.value.filter(newUser => newUser.id !== email)
        console.log('New user unselected:', user)
    } else {
        newUsers.value.push(user)
        console.log('New user selected:', user)
    }
    console.log('New users:', newUsers.value)
}

const isNewUserSelected = (userID) => {
    return newUsers.value.some(newUser => newUser.id === userID)
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
//----------------------------------------

//CSV---------------------------------------------------------
const csvErrorMessage = async (message) => {
    csvUploadError.value = message
    // document.querySelector('.csvUploadError').style.display = 'block'
    console.log(csvUploadError.value);
    document.querySelector('.csvUploadError').innerHTML = message;
    setTimeout(() => {
        csvUploadError.value = ''
        document.querySelector('.csvUploadError').innerHTML = ''
    }, 5000);
}

const addByCSV = () => {
    // Access the file input via its ref.
    const file = fileInput.value?.files[0];

    if (!file) {
        console.error("No file selected");
        csvErrorMessage("No file selected");
        return;
    }

    // Basic check to ensure the file is a CSV.
    if (!file.name.toLowerCase().endsWith(".csv")) {
        console.error("Selected file is not a .csv file");
        csvErrorMessage("Selected file is not a .csv file");
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
                csvErrorMessage("API Error:" + JSON.stringify(errorData));
                return;
            }

            const data = await response.json();
            console.log("Success:", data);
        } catch (error) {
            console.error("Network or Fetch Error:", error);
            csvErrorMessage("Network or Fetch Error:" + JSON.stringify(error));
        }
    };

    reader.onerror = () => {
        console.error("FileReader Error:", reader.error);
        csvErrorMessage("FileReader Error:" + JSON.stringify(reader.error));
    };
};

// Misc -----------------------------------
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

const getDisplayName = (user) => {
    const name = [user.first_name, user.last_name].filter(part => part).join(" ");
    return name || user.email;
}

onMounted(() => {
    window.addEventListener('resize', updateScreenSize);
    if (!isAdmin.value) {
        getInvitedUsers()
        loadOrgUsers()
    } else {
        adminGetUsers()
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
});

const isMobile = ref(window.innerWidth <= 768);

const updateScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
};

const handleCSVButtonClick = () => {
    // If no file is selected, open the file picker.
    if (!fileInput.value || !fileInput.value.files.length) {
        fileInput.value.click();
    } else {
        // If a file is already selected, process it.
        addByCSV();
    }
};

</script>


<template>

    <template v-if="isAdmin">
        <div class="modal-header">
            <h2>Users of {{ props.orgName }}</h2>
            <div class="user-list-buttons">
                <h3 class="csvUploadError">{{csvUploadError.value}}</h3>
                <PButton design="planner" @click="openModal" label="Add User"></PButton>
                <input type="file" ref="fileInput" name="file" accept=".csv" style="display: none" required />
                <!-- The button triggers the form submission -->
                <PButton label="Add User by .CSV" type="submit" design="planner" @click="handleCSVButtonClick" />
            </div>

        </div>
        <div class="planner-event">
            <PEvent v-if="isMobile" design="small-header" eventName="Invitations"
                @back-click="() => handleBack('Home')" />

            <div class="event-invite">
                <div class="user-list-container">
                    <h2>Org Admins</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Org Admin')"
                            :key="user.user_id" :name="getDisplayName(user)" :email="user.email"
                            :profileImage="user.profile_picture" />
                    </div>
                </div>

                <hr class="divider" />

                <div class="user-list-container">
                    <h2>Event Planners</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Event Planner')"
                            :key="user.user_id" :name="getDisplayName(user)" :email="user.email"
                            :profileImage="user.profile_picture" />
                    </div>
                </div>

                <hr class="divider" />

                <div class="user-list-container">
                    <h2>Finance Manager</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Finance Manager')"
                            :key="user.user_id" :name="getDisplayName(user)" :email="user.email"
                            :profileImage="user.profile_picture" />
                    </div>
                </div>

                <hr class="divider" />

                <div class="user-list-container">
                    <h2>Attendee</h2>
                    <div class="p-event__container">
                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Attendee')"
                            :key="user.user_id" :name="getDisplayName(user)" :email="user.email"
                            :profileImage="user.profile_picture" />
                    </div>
                </div>

            </div>
        </div>
    </template>

    <template v-else>
        <div class="modal-header">
            <h2>Attendee</h2>
            <div class="submit-invite-button">
                    <PButton label="Send Invites" @click="submitChange" design="gradient"></PButton>
                </div>
        </div>
        <div class="planner-event">
            <PEvent v-if="isMobile" design="small-header" eventName="Invitations"
                @back-click="() => handleBack('Home')" />

            <div class="event-invite-plan">
                <div class="user-list-container">
                    <h2>Org Admins</h2>
                    <div class="p-event__container">

                        <PFinanceBlock design="invite"
                            v-for="user in userStore.users.filter(user => user.role_id === 'Finance Manager')"
                            :key="user.user_id" :name="user.first_name + ' ' + user.last_name" :email="user.email"
                            :profileImage="user.profile_picture"
                            :class="{ selected: isFinanceManagerSelected(user.user_id) }"
                            @click="selectFinanceManager(user.user_id)" required />
                    </div>
                </div>
                <hr class="divider" />

                <div class="user-list-container">

                    <h2>Attendees</h2>
                    <div class="p-event__container">
                        <PButton design="planner" @click="openModal" label="Add User"></PButton>
                        <PFinanceBlock design="invite" v-for="user in remainingUsers" :key="user.user_id"
                            :name="(user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) : user.email"
                            :email="user.email" :profileImage="user.profile_picture"
                            :class="{ selected: isUserSelected(user.user_id) }" @click="selectUser(user.user_id)" />

                        <PFinanceBlock design="new-user" v-for="user in newUsers" :key="user.email" :email="user.email"
                            :profileImage="user.profile_picture" :class="{ selected: isNewUserSelected(user.email) }"
                            @click="selectNewUser(user.email)" />
                    </div>
                </div>

                <hr class="divider" />

                <div class="user-list-container">
                    <h2>Invited Attendees</h2>
                    <div class="p-event__container">

                        <PFinanceBlock design="invite" v-for="user in invitedUsers" :key="user.id"
                            :name="(user.firstName && user.lastName) ? (user.firstName + ' ' + user.lastName) : user.email"
                            :email="user.email" :profileImage="user.profilePic" />
                    </div>
                </div>
                
            </div>
        </div>

    </template>

    <template v-if="isModalVisible">
        <div class="add-user-modal">
            <div class="modal-overlay" @click="closeModal"></div>
            <div class="modal">
                <h2>Add User</h2>
                <div v-if="userStore.role_id == 'Site Admin' || userStore.role_id == 'Org Admin'"
                    class="role-selection">
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
                <div class="modal-invite-button">
                    <PTextField v-model="emailInput" label="Enter Attendee Email" />
                    <PButton v-if="userStore.role_id == 'Site Admin' || userStore.role_id == 'Org Admin'"
                        @click="adminAddUser" design="gradient" label="Send Invite"></PButton>
                    <PButton v-if="userStore.role_id == 'Event Planner'" @click="makeNewUserEntry(emailInput)"
                        design="gradient" label="Add User"></PButton>
                </div>
            </div>
        </div>

    </template>

</template>