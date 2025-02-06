<script setup>
import { ref } from 'vue'
import { PButton, PTextField } from '@poseidon-components'
import '@poseidon-styles/index.css'

const username = ref('')
const password = ref('')
const errors = ref({ username: '', password: '' })


const validateForm = () => {
  let isValid = true
}
 
const loginUser = async () => {
  console.log('Attempting login with:', {
        username: username.value,
        password: password.value
      })
    try {
      // Here you would typically make an API call
      
      await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: username.value,
          password: password.value
        })
      }).then(response => {
        if (response.ok) {
          console.log('Login successful')
        } else {
          throw new Error('Invalid username or password')
        }
      })
      //await authService.login(username.value, password.value)
    } catch (error) {
      errors.value.password = 'Invalid username or password'
    }
  }

</script>

<template>
  <div class="login-container">
    <img src="@poseidon-assets/img/AppLogo.png" alt="Poseidon Logo" />
    <div class="login-form">
      <div class="login-input">
        <PTextField v-model="username" design="p-textfield" label="Enter Username" />
        <div>
          <PTextField v-model="password" design="p-textfield" label="Enter Password" />
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