<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { PButton, PTextField } from '@poseidon-components'
import '@poseidon-styles/index.css'
import api from '../assets/scripts/api.js'

const email = ref('')
const password = ref('')
const errors = ref({ email: '', password: '' })
const router = useRouter()
const userStore = useUserStore()

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
      //const user = await apiResponse.json()
      //userStore.setUser(user)
      await router.push({ name: 'Home' })
    } else {
      throw new Error('Invalid email or password')
    }
    //await authService.login(email.value, password.value)
  } catch (error) {
    errors.value.password = 'Invalid email or password'
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
          <PTextField v-model="password" label="Enter Password" />
          <p><a href="#">Forgot Password?</a></p>
        </div>
      </div>
      <div class="login-button">
        <PButton @click="loginUser" design="login" label="Login">Submit</PButton>
        <p>Don't have an account? <a href="#">Sign up here!</a></p>
      </div>
    </div>
  </div>
</template>