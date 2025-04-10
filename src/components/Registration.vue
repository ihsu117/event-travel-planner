<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField, PProfilePic, PDropDown, PEvent } from '@poseidon-components'
import { format, parseISO } from 'date-fns'
import api from '../assets/scripts/api.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import '@poseidon-styles/index.css'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Registration fields
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
const title = ref('')
const gender = ref('')
const dob = ref('')
const password = ref('')
const confPass = ref('')
const profileImage = ref(null)
const errors = ref({ email: '', password: '' })
const userInfo = ref({})

// Other reactive vars
const fileInput = ref(null)
const today = new Date().toISOString().split('T')[0]
const regDateMin = new Date(today)
regDateMin.setFullYear(regDateMin.getFullYear() - 80)
const regDateMinFormatted = regDateMin.toISOString().split('T')[0]
const titleOptions = [{ value: 'mr', label: 'Mr.' }, { value: 'mrs', label: 'Mrs.' }, { value: 'ms', label: 'Ms.' }, { value: 'miss', label: 'Miss' }, { value: 'dr', label: 'Doctor' }]
const genderOptions = [
    { value: 'm', label: 'Male' },
    { value: 'f', label: 'Female' }
]
const loading = ref(false)
const isEditUser = computed(() => route.path.includes('/edit/'))

// Update dropdown selections
const handleUpdate = ({ field, option }) => {
    if (field === 'title') {
        title.value = typeof option === 'object' ? option.value : option;
    }
    if (field === 'gender') {
        gender.value = typeof option === 'object' ? option.value : option;
    }
}

// File input for profile image
const onFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            profileImage.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const triggerFileInput = () => {
    fileInput.value.click()
}

// Password validation
const validatePassword = () => {
    if (password.value !== confPass.value) {
        errors.value.password = 'Passwords do not match'
        return false
    }
    if (password.value.length < 6) {
        errors.value.password = 'Password must be at least 6 characters long'
        return false
    }
    errors.value.password = ''
    return true
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

// Helpers for date formatting
const parseDate = (date) => {
    if (!date) return null
    return typeof date === 'string' ? parseISO(date) : date
}

const formatDateForBackend = (date) => {
    const parsedDate = parseDate(date)
    if (!parsedDate) return ''
    return format(parsedDate, "yyyy-MM-dd")
}

const updateUser = async () => {
    const payload = {};

    // Compare new inputs with existing values in userStore
    if (firstName.value && firstName.value !== userStore.first_name) {
        payload.firstName = firstName.value;
    } else {
        payload.firstName = userStore.first_name;
    }

    if (lastName.value && lastName.value !== userStore.last_name) {
        payload.lastName = lastName.value;
    } else {
        payload.lastName = userStore.last_name;
    }

    if (phoneNumber.value && phoneNumber.value !== userStore.phoneNum) {
        payload.phoneNum = phoneNumber.value;
    } else {
        payload.phoneNum = userStore.phoneNum;
    }

    if (dob.value && dob.value !== userStore.dob) {
        payload.dob = formatDateForBackend(dob.value);
    } else {
        payload.dob = userStore.dob;
    }

    if (password.value) {
        payload.password = password.value; // Always update password if provided
    }

    if (profileImage.value && profileImage.value !== userStore.profile_picture) {
        payload.profilePic = profileImage.value;
    } else {
        payload.profilePic = userStore.profile_picture;
    }

    if (gender.value && gender.value !== userStore.gender) {
        payload.gender = gender.value;
    } else {
        payload.gender = userStore.gender;
    }

    if (title.value && title.value !== userStore.title) {
        payload.title = title.value;
    } else {
        payload.title = userStore.title;
    }

    // If no changes, log and return
    if (Object.keys(payload).length === 0) {
        console.log("No changes to update");
        return;
    }

    try {
        const apiResponse = await api.apiFetch(`/user/${userStore.user_id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (apiResponse.ok) {
            // Update local storage and userStore
            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = {
                user: {
                id: storedUser.id || userStore.user_id,
                ...storedUser,
                first_name: payload.firstName,
                last_name: payload.lastName,
                profile_picture: payload.profilePic,
                dob: payload.dob,
                gender: payload.gender,
                title: payload.title
                }
            };

            Object.assign(storedUser, updatedUser);
            console.log('User updated successfully', updatedUser);
            userStore.setUser(updatedUser);
            await router.push({ name: 'Home' });
        } else {
            throw new Error('Invalid registration information');
        }
    } catch (error) {
        errors.value.email = 'Invalid registration information';
    }
}



const handleSubmit = async () => {
    if (isEditUser) {
        await updateUser()
    } else {
        if (!validatePassword()) return
        await updateUser()
    }
}

onMounted(async () => {
    if (isEditUser.value) {
        await fetchUserData()
        firstName.value = userInfo.value.firstName
        lastName.value = userInfo.value.lastName
        phoneNumber.value = userInfo.value.phoneNum
        gender.value = userInfo.value.gender
        title.value = userInfo.value.title
        dob.value = userInfo.value.dob
        profileImage.value = userInfo.value.profilePic
    }
})
</script>

<template>
    <div class="register-container">
        <svg class="exit-icon" @click="router.push({ name: 'Home' })" xmlns="http://www.w3.org/2000/svg" width="2em"
            height="2em" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
                <path
                    d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                <path fill="#FEB96E"
                    d="m12 14.122l5.303 5.303a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 1 0 2.122 2.12z" />
            </g>
        </svg>
        <div class="register-form">
            <div class="form-pic">
                <h1>Profile Picture</h1>
                <PProfilePic design="big" :profileImage="profileImage" @click="triggerFileInput"
                    style="cursor: pointer;" />
                <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" style="display: none;" />
            </div>
            <div class="form-name">
                <h1>Name</h1>
                <div class="register-form-name">
                    <PTextField design="login-small" v-model="firstName" label="First Name" />
                    <PTextField design="login-small" v-model="lastName" label="Last Name" />
                </div>
            </div>

            <div class="form-gender-title">
                <div class="form-title">
                    <h1>Title</h1>
                    <PDropDown design="login" v-model="title" description="title" dropDownLabel="Title"
                        :options="titleOptions" @option-selected="handleUpdate" />
                </div>
                <div class="form-gender">
                    <h1>Gender</h1>
                    <PDropDown design="login" v-model="gender" description="gender" dropDownLabel="Gender"
                        :options="genderOptions" @option-selected="handleUpdate" />
                </div>
            </div>

            <div class="form-phone">
                <h1>Phone Number</h1>
                <PTextField v-model="phoneNumber" label="123-456-7890" />
            </div>

            <div class="form-dob">
                <h1>Date of Birth</h1>
                <VueDatePicker id="dob" v-model="dob" :enable-time-picker="false" :placeholder="'MM/DD/YYYY'"
                    exactMatch="true" :config="{ closeOnAutoApply: false, keepActionRow: true }"
                    :text-input="{ format: 'MM/dd/yyyy' }" :max-date="today" autocomplete="off" hide-input-icon />
            </div>

            <div class="form-password-container">
                <h1>Password</h1>
                <div :class="['error-container', { show: errors.password }]">
                    <svg v-if="errors.password" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16"
                        height="16" viewBox="0 0 16 16">
                        <path fill="#FEB96E" fill-rule="evenodd"
                            d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <p v-if="errors.password" class="input-error">{{ errors.password }}</p>
                </div>
                <div class="form-password">

                    <PTextField design="login-small" v-model="password" type="password" label="Enter Password" />
                    <PTextField design="login-small" v-model="confPass" type="password" label="Confirm Password" />
                </div>
            </div>

            <div class="form-button">
                <PButton @click="handleSubmit" design="login" label="Submit">Submit</PButton>
            </div>
        </div>
    </div>
</template>