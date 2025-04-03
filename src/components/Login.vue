<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField, PProfilePic, PDropDown } from '@poseidon-components'
import '@poseidon-styles/index.css'
import api from '../assets/scripts/api.js'

const loginPage = ref(true)
const email = ref('')
const password = ref('')
const confPass = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
const title = ref('')
const gender = ref('')
const dob = ref('')
const mfaCode = ref('')
const errors = ref({ email: '', password: '' })
const router = useRouter()
const userStore = useUserStore()
const profileImage = ref(null)
const isModalVisible = ref(false)
const fileInput = ref(null)
const today = new Date().toISOString().split('T')[0]
const regDateMin = new Date(today)
regDateMin.setFullYear(regDateMin.getFullYear() - 80)
const regDateMinFormatted = regDateMin.toISOString().split('T')[0]
const parsedDate = new Date(today); // Interpreted as '2025-03-26T00:00:00' in local time
const titleOptions = ['mr', 'mrs', 'ms', 'miss', 'dr']
const genderOptions = ['m', 'f', 'o']
const loading = ref(false)
const mfaInput = ref(null)
const passwordInput = ref(null)
const emailInput = ref(null)


const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImage.value = e.target.result // Set the image preview source
    }
    reader.readAsDataURL(file) // Read the file as a data URL
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const openModal = () => {
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  errors.value.mfaCode = ''
}

const validatePassword = () => {
  if (password.value !== confPass.value) {
    errors.value.password = 'Passwords do not match'
    return false
  }
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
    return false
  }
  errors.value.password = '' // Clear any previous errors
  return true
}

const handleSubmit = async () => {
  if (!validatePassword()) {
    return // Stop submission if validation fails
  }
  await updateUser() // Proceed with the user update
}

//Function to login the user
const loginUser = async () => {
  mfaCode.value = '' // Clear any previous MFA code
  errors.value.password = '' // Clear any previous errors
  errors.value.email = '' // Clear any previous errors
  passwordInput.value.blur()
  emailInput.value.blur()

  if (!email.value) {
    errors.value.email = 'Email is required'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  }

  if (errors.value.email || errors.value.password) {
    return // Stop submission if validation fails
  }

  console.log('Attempting login with:', {
    email: email.value,
    password: password.value
  })
  try {
    openModal()
    loading.value = true // Show loading spinner
    //API call to backend to check for user credentials
    const apiResponse = await api.apiFetch('/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      })
    })

    if (apiResponse.ok) {
      console.log('Login successful')
      loading.value = false
      nextTick(() => {
    // Focus on the MFA input field after the modal is visible
    if (mfaInput.value && mfaInput.value.focus) {
      mfaInput.value.focus()
    }
  })
    } else {
      closeModal()
      throw new Error('Invalid Email or Password')
    }

  } catch (error) {
    errors.value.email = 'Invalid Email or Password'
  }
}

const checkMFA = async () => {
  console.log('Checking MFA with: ', {
    email: email.value,
    mfaCode: mfaCode.value
  })
  errors.value.mfaCode = '' // Clear any previous errors

  if (!mfaCode.value) {
    errors.value.mfaCode = 'Code is required';
    return;
  }

  try {
    const apiResponse = await api.apiFetch('/auth/mfa', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        mfaCode: mfaCode.value
      })
    })
    if (apiResponse.ok) {
      console.log('MFA successful')
      const user = await apiResponse.json()
      userStore.setUser(user)
      console.log('firstName:', userStore.first_name)
      console.log('lastName:', userStore.last_name)
      if (!userStore.first_name && !userStore.last_name) {
        console.log('Redirecting to registration page')
        loginPage.value = false // Show the registration page
        closeModal()
      } else {
        userStore.setUser(user)
        await router.push({ name: 'Home' })
      }
    } else {
      throw new Error('Invalid MFA code')
    }
  } catch (error) {
    errors.value.mfaCode = 'Invalid MFA code'
  }
}

const updateUser = async () => {
  console.log('Updating user with:', {
    firstName: firstName.value,
    lastName: lastName.value,
    phoneNumber: phoneNumber.value,
    dob: dob.value,
    password: password.value,
    profileImage: profileImage.value
  })
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
        profilePic: profileImage.value
      })
    })
    if (apiResponse.ok) {
      console.log('Registration successful')
      const user = await apiResponse.json()
      loginPage.value = true
    } else {
      throw new Error('Invalid registration information')
    }
  } catch (error) {
    errors.value.email = 'Invalid registration information'
  }
}

</script>

<template>
  <template v-if="loginPage">
    <div class="login-container">
      <img src="@poseidon-assets/img/AppLogo.png" alt="Poseidon Logo" />
      <div class="login-form">
        <div class="login-input">

          <div class="email-container">
            <div :class="['error-container', { show: errors.email }]">
              <svg v-if="errors.email" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                viewBox="0 0 16 16">
                <path fill="#FEB96E" fill-rule="evenodd"
                  d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                  clip-rule="evenodd" />
              </svg>
              <p v-if="errors.email" class="input-error">{{ errors.email }}</p>
            </div>
            <PTextField v-model="email" ref="emailInput" label="Enter Email" @keyup.enter="loginUser" />
          </div>

          <div class="password-container">
            <div :class="['error-container', { show: errors.password }]">
              <svg v-if="errors.password" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                viewBox="0 0 16 16">
                <path fill="#FEB96E" fill-rule="evenodd"
                  d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                  clip-rule="evenodd" />
              </svg>
              <p v-if="errors.password" class="input-error">{{ errors.password }}</p>
            </div>
            <div class="forgot-pass">
              <PTextField v-model="password" ref="passwordInput" type="password" label="Enter Password" @keyup.enter="loginUser" />
              <p><a href="#">Forgot Password?</a></p>
            </div>
          </div>
        </div>
        <div class="login-button">
          <PButton @click="loginUser" design="login" label="Login">Submit</PButton>
        </div>
      </div>
    </div>
  </template>

  <template v-if="isModalVisible">
    <div class="modal-overlay" id="mfa" @click="closeModal"></div>
    <div class="modal" id="mfa" :class="{ expanded: !loading }">
      <!-- Content that fades in and out -->
      <div :class="['fade-in', { show: !loading }]">
        <div class="mfa-form" v-show="!loading">
          <h4>A 6 digit code was sent to <b>{{ email }}</b></h4>
          <div :class="['error-container', { show: errors.mfaCode }]">
            <svg v-if="errors.mfaCode" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 16 16">
              <path fill="#FEB96E" fill-rule="evenodd"
                d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                clip-rule="evenodd" />
            </svg>
            <h5 v-if="errors.mfaCode" class="input-error">{{ errors.mfaCode }}</h5>
          </div>
          <PTextField v-model="mfaCode" ref="mfaInput" label="Enter MFA Code" inputmode="numeric" type="tel" @keyup.enter="checkMFA"/>
          <div class="mfa-button">
            <PButton @click="checkMFA" design="login" label="Submit" >Submit</PButton>
          </div>
        </div>
      </div>

      <!-- Loading spinner shown during the transition -->
      <div class="loading-spinner" v-show="loading">
        <span class="loader"></span>
      </div>
    </div>
  </template>

  <template v-else-if="!loginPage">
    <div class="login-container">
      <div class="register-form">
        <div>
          <h1>Name</h1>
          <div id="name">
            <PTextField design="login-small" v-model="firstName" label="First Name" />
            <PTextField design="login-small" v-model="lastName" label="Last Name" />
          </div>
        </div>

        <!-- <div id="genderAndTitle">
          <div>
            <h1>Title</h1>
            <PDropDown design="login" v-model="title" dropDownLabel="Title" :options="titleOptions" />
          </div>

          <div>
            <h1>Gender</h1>
            <PDropDown design="login" v-model="gender" dropDownLabel="Gender" :options="genderOptions" />
          </div>
        </div> -->

        <div>
          <h1>Phone Number</h1>
          <PTextField v-model="phoneNumber" label="123-456-7890" />
        </div>
        <!-- <div>
          <h1>Known Traveler Number</h1>
          <PTextField v-model="phoneNumber" label="123-456-7890" />
        </div> -->
        <div>
          <h1>Date of Birth</h1>
          <PTextField v-model="dob" type="date" label="MM/DD/YYYY" min="1920-01-02" :max="today" />
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
          <PProfilePic design='big' :profileImage="profileImage" @click="triggerFileInput" style="cursor: pointer;">
          </PProfilePic>
          <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" style="display: none;" />
          <!-- <PTextField v-model="profileImage" label="Image Link" /> -->
        </div>

        <div id="button">
          <PButton @click="handleSubmit" design="login" label="Create Account">Submit</PButton>
        </div>
      </div>
    </div>
  </template>

</template>