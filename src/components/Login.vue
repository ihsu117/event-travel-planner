<script setup>
import { ref } from 'vue'
import { PButton, PTextField } from '@poseidon-components'
import '@poseidon-styles/index.css'

const username = ref('')
const password = ref('')
const errors = ref({ username: '', password: '' })

const validateForm = () => {
  let isValid = true
  errors.value = { username: '', password: '' }

  if (!username.value) {
    errors.value.username = 'Username is required'
    isValid = false
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const loginUser = async () => {
  if (validateForm()) {
    try {
      // Here you would typically make an API call
      console.log('Attempting login with:', {
        username: username.value,
        password: password.value
      })
      // await authService.login(username.value, password.value)
    } catch (error) {
      errors.value.password = 'Invalid username or password'
    }
  }
}
</script>

<template>
  <div class="login-container">
    <img v-model="username" src="@poseidon-assets/img/AppLogo.png" alt="Poseidon Logo" />
    <div class="login-form">
      <div class="login-input">
        <PTextField design="p-textfield" label="Enter Username" />
        <div>
          <PTextField design="p-textfield" label="Enter Password" />
          <p>Forgot Password?</p>
        </div>
      </div>
      <div class="login-button">
        <PButton @click="loginUser" design="login" label="Login">Submit</PButton>
        <p>Don't have an account? <a href="#">Sign up here!</a></p>
      </div>
    </div>
  </div>
</template>