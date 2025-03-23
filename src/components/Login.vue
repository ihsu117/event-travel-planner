<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField } from '@poseidon-components'
import '@poseidon-styles/index.css'
import api from '../assets/scripts/api.js'

const email = ref('')
const password = ref('')
const mfaCode = ref('')
const errors = ref({ email: '', password: '' })
const router = useRouter()
const userStore = useUserStore()
const showMFA = ref(false)


//Function to login the user
const loginUser = async () => {
  console.log('Attempting login with:', {
    email: email.value,
    password: password.value
  })
  try {

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
      showMFA.value = true
    } else {
      throw new Error('Invalid email or password')
    }

  } catch (error) {
    errors.value.password = 'Invalid email or password'
  }
}

const checkMFA = async () => {
  console.log('Checking MFA with: ', {
    email: email.value,
    mfaCode: mfaCode.value
  })
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
      await router.push({ name: 'Home' })
    } else {
      throw new Error('Invalid MFA code')
    }
  } catch (error) {
    errors.value.mfaCode = 'Invalid MFA code'
  }
}

</script>

<template>
  <div class="login-container">
    <img src="@poseidon-assets/img/AppLogo.png" alt="Poseidon Logo" />
    <div class="login-form">
      <div class="login-input">
        <PTextField v-model="email" label="Enter Email" />
        <div class="forgot-pass">
          <PTextField v-model="password" type="password" label="Enter Password" />
          <p><a href="#">Forgot Password?</a></p>
        </div>
      </div>
      <div class="login-button">
        <PButton @click="loginUser" design="login" label="Login">Submit</PButton>
        <p>Don't have an account? <a href="#">Sign up here!</a></p>
      </div>
    </div>
  </div>

  <div v-if="showMFA==true" class="mfa-container">
    <div class="mfa-form">
      <PTextField v-model="mfaCode" label="Enter MFA Code" />
      <PButton @click="checkMFA" v-model="mfaCode" design="login" label="Submit">Submit</PButton>
    </div>
  </div>
</template>