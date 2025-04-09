<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField, PProfilePic, PDropDown } from '@poseidon-components'
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

// Other reactive vars
const fileInput = ref(null)
const today = new Date().toISOString().split('T')[0]
const regDateMin = new Date(today)
regDateMin.setFullYear(regDateMin.getFullYear() - 80)
const regDateMinFormatted = regDateMin.toISOString().split('T')[0]
const titleOptions = ['mr', 'mrs', 'ms', 'miss', 'dr']
const genderOptions = ['m', 'f', 'o']
const loading = ref(false)

// Update dropdown selections
const handleUpdate = ({ field, option }) => {
  if (field === 'title') title.value = option
  if (field === 'gender') gender.value = option
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

// Helpers for date formatting
const parseDate = (date) => {
  if (!date) return null
  return typeof date === 'string' ? parseISO(date) : date
}

const formatDateForBackend = (date) => {
  const parsedDate = parseDate(date)
  if (!parsedDate) return ''
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss")
}

// Update user info via the API (for registration/updating data)
const updateUser = async () => {
  try {
    const apiResponse = await api.apiFetch(`/user/${userStore.user_id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName.value,
        lastName: lastName.value,
        phoneNum: phoneNumber.value,
        dob: dob.value,
        password: password.value,
        profilePic: profileImage.value,
        gender: gender.value,
        title: title.value
      })
    })
    if (apiResponse.ok) {
      const user = await apiResponse.json()
      console.log('Registration successful', user)
      await router.push({ name: 'Home' })
    } else {
      throw new Error('Invalid registration information')
    }
  } catch (error) {
    errors.value.email = 'Invalid registration information'
  }
}

const handleSubmit = async () => {
  if (!validatePassword()) return
  dob.value = formatDateForBackend(dob.value)
  await updateUser()
}

onMounted(() => {
  
  firstName.value = userStore.first_name || ''
  lastName.value = userStore.last_name || ''
  phoneNumber.value = userStore.phone || ''
  title.value = userStore.title || ''
  gender.value = userStore.gender || ''
  dob.value = userStore.dob ? new Date(userStore.dob).toISOString().split('T')[0] : ''
  profileImage.value = userStore.profile_picture || null
})
</script>

<template>
  <div class="login-container">
    <div class="register-form">
      <div>
        <h1>Name</h1>
        <div id="name">
          <PTextField design="login-small" v-model="firstName" label="First Name" />
          <PTextField design="login-small" v-model="lastName" label="Last Name" />
        </div>
      </div>

      <div id="genderAndTitle">
        <div>
          <h1>Title</h1>
          <PDropDown design="login" v-model="title" description="title" dropDownLabel="Title" :options="titleOptions" @option-selected="handleUpdate" />
        </div>
        <div>
          <h1>Gender</h1>
          <PDropDown design="login" v-model="gender" description="gender" dropDownLabel="Gender" :options="genderOptions" @option-selected="handleUpdate" />
        </div>
      </div>

      <div>
        <h1>Phone Number</h1>
        <PTextField v-model="phoneNumber" label="123-456-7890" />
      </div>

      <div>
        <h1>Date of Birth</h1>
        <VueDatePicker id="dob" v-model="dob" :enable-time-picker="false" :placeholder="'MM/DD/YYYY'" exactMatch="true" :config="{ closeOnAutoApply: false, keepActionRow: true }" :text-input="{ format: 'MM/dd/yyyy' }" :max-date="today" autocomplete="off" hide-input-icon />
      </div>

      <div>
        <h1>Password</h1>
        <div id="password">
          <PTextField v-model="password" type="password" label="Enter Password" />
          <PTextField v-model="confPass" type="password" label="Confirm Password" />
          <p v-if="errors.password" class="error">{{ errors.password }}</p>
        </div>
      </div>

      <div id="pic">
        <h1>Profile Picture</h1>
        <PProfilePic design="big" :profileImage="profileImage" @click="triggerFileInput" style="cursor: pointer;" />
        <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" style="display: none;" />
      </div>

      <div id="button">
        <PButton @click="handleSubmit" design="login" label="Submit">Submit</PButton>
      </div>
    </div>
  </div>
</template>