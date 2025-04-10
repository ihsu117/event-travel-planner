<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField, PProfilePic } from '@poseidon-components'
import '@poseidon-styles/index.css'
import api from '../assets/scripts/api.js'

const email = ref('')
const password = ref('')
const mfaCode = ref('')
const errors = ref({ email: '', password: '', mfaCode: '', recoverEmail: '' })
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Input element refs
const mfaInput = ref(null)
const passwordInput = ref(null)
const emailInput = ref(null)
const recoverEmailInput = ref(null)

const loading = ref(false)
const isModalVisible = ref(false)
const modalType = ref('')
const forgotPasswordSuccess = ref(false)
const recoverEmail = ref('')

// Function to login the user
const loginUser = async () => {
  // Clear previous MFA and errors
  mfaCode.value = ''
  errors.value.email = ''
  errors.value.password = ''
  passwordInput.value.blur()
  emailInput.value.blur()

  if (!email.value) {
    errors.value.email = 'Email is required'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  }

  if (errors.value.email || errors.value.password) {
    return
  }

  console.log('Attempting login with:', {
    email: email.value,
    password: password.value
  })

  try {
    openModal("mfaCode")
    loading.value = true
    const apiResponse = await api.apiFetch('/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    if (apiResponse.ok) {
      console.log('Login successful')
      loading.value = false
      nextTick(() => {
        if (mfaInput.value && mfaInput.value.focus) {
          mfaInput.value.focus()
        }
      })
    } else {
      loading.value = false
      closeModal()
      throw new Error('Invalid Email or Password')
    }
  } catch (error) {
    errors.value.email = 'Invalid Email or Password'
    loading.value = false
  }
}

// Function to check the MFA code
const checkMFA = async () => {
  console.log('Checking MFA with:', {
    email: email.value,
    mfaCode: mfaCode.value
  })
  errors.value.mfaCode = ''

  if (!mfaCode.value) {
    errors.value.mfaCode = 'Code is required'
    return
  }

  try {
    const apiResponse = await api.apiFetch('/auth/mfa', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        mfaCode: mfaCode.value
      })
    })
    if (apiResponse.ok) {
      console.log('MFA successful')
      const user = await apiResponse.json()
      userStore.setUser(user)
      if( userStore.first_name == null || userStore.last_name == null) {

        router.push({ name: 'Registration' })
      } else {
        await router.push({ name: 'Home' })
      }
    } else {
      throw new Error('Invalid MFA code')
    }
  } catch (error) {
    errors.value.mfaCode = 'Invalid MFA code'
  }
}

// Forgot password functionality
const forgotPassword = async () => {
  errors.value.recoverEmail = ''
  forgotPasswordSuccess.value = false

  if (!recoverEmail.value) {
    errors.value.recoverEmail = 'Email is required'
    return
  }
  loading.value = true
  console.log('Sending forgot password request for:', {
    email: recoverEmail.value
  })
  try {
    const apiResponse = await api.apiFetch('/auth/forgotPassword', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recoverEmail.value })
    })
    if (apiResponse.ok) {
      console.log('Forgot password request sent successfully')
      forgotPasswordSuccess.value = true
      loading.value = false
    } else {
      loading.value = false
      throw new Error('Invalid Email')
    }
  } catch (error) {
    errors.value.recoverEmail = 'Invalid Email'
  }
}

// Modal visibility handlers
const openModal = (type) => {
  isModalVisible.value = true
  modalType.value = type
}

const closeModal = () => {
  if (loading.value) return
  isModalVisible.value = false
  modalType.value = ''
  errors.value.mfaCode = ''
  errors.value.recoverEmail = ''
  forgotPasswordSuccess.value = false
}

</script>

<template>
  <!-- Login Form -->
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
            <p><a @click.prevent="openModal('forgotPassword')">Forgot Password?</a></p>
          </div>
        </div>
      </div>
      <div class="login-button">
        <PButton @click="loginUser" design="login" label="Login">Submit</PButton>
      </div>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <template v-if="isModalVisible && modalType === 'forgotPassword'">
    <div class="modal-overlay" id="forgot-pass" @click="closeModal"></div>
    <div class="modal" id="forgot-pass" :class="{ expandSuccess: forgotPasswordSuccess, 'shrinked': loading }">
      <div :class="['fade-in', { show: !loading }]">
        <div class="forgot-form" v-show="!loading && !forgotPasswordSuccess">
          <h4>Forgot Password</h4>
          <p class="forgot-text">Please enter your email address to reset your password.</p>
          <div :class="['error-container', { show: errors.recoverEmail }]">
            <svg v-if="errors.recoverEmail" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 16 16">
              <path fill="#FEB96E" fill-rule="evenodd"
                d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0z"
                clip-rule="evenodd" />
            </svg>
            <h5 v-if="errors.recoverEmail" class="input-error">{{ errors.recoverEmail }}</h5>
          </div>
          <PTextField v-model="recoverEmail" ref="recoverEmailInput" label="Enter Email" @keyup.enter="forgotPassword" />
          <div class="forgot-button">
            <PButton @click="forgotPassword" design="login" label="Submit">Submit</PButton>
          </div>
        </div>
        <div class="success-message" v-show="forgotPasswordSuccess">
          <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" width="3.5rem" height="3.5rem" viewBox="0 0 16 16">
            <path fill="#28a745" fill-rule="evenodd"
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.707-9.707a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
              clip-rule="evenodd" />
          </svg>
          <h4>Email Sent</h4>
          <p>Please check your inbox for further instructions.</p>
        </div>
      </div>
      <div class="loading-spinner" v-show="loading">
        <span class="loader"></span>
      </div>
    </div>
  </template>

  <!-- MFA Modal -->
  <template v-if="isModalVisible && modalType === 'mfaCode'">
    <div class="modal-overlay" id="mfa" @click="closeModal"></div>
    <div class="modal" id="mfa" :class="{ expanded: !loading }">
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
          <PTextField v-model="mfaCode" ref="mfaInput" label="Enter MFA Code" inputmode="numeric" type="tel" @keyup.enter="checkMFA" />
          <div class="mfa-button">
            <PButton @click="checkMFA" design="login" label="Submit">Submit</PButton>
          </div>
        </div>
      </div>
      <div class="loading-spinner" v-show="loading">
        <span class="loader"></span>
      </div>
    </div>
  </template>
</template>