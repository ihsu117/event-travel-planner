<script setup>
import { PButton, PTextField } from '@poseidon-components'
import '@poseidon-styles/index.css'

</script>

<template>
  <div class="login-container">
    <img src="@poseidon-assets/img/AppLogo.png" alt="Poseidon Logo" />
    <div class="login-form">
      <div class="login-input">
        <PTextField design="p-textfield" label="Enter Username" />
        <div>
          <PTextField design="p-textfield" label="Enter Password" />
          <p>Forgot Password?</p>
        </div>
      </div>
      <div class="login-button">
        <PButton design="login" label="Login">Submit</PButton>
        <p>Don't have an account? <a href="#">Sign up here!</a></p>
      </div>
    </div>
  </div>
</template>