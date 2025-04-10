<script setup>
import { defineProps } from 'vue'
import { useUserStore } from '../stores/userStore'
import { PProfilePic } from '@poseidon-components'
import { useRouter } from 'vue-router'

// Accept an openModal function as a prop
const props = defineProps({
    openModal: {
        type: Function,
        required: true
    },
    profileImage: {
        type: String,
        default: ''
    }
})

const userStore = useUserStore()
const router = useRouter()

const goHome = () => {
    router.push({ name: 'Home' })
}
</script>

<template>
    <div class="home-header-desktop" style="display:flex; align-items: center;">
        <div class="home-header__text-desktop">
            <p>Welcome, {{ userStore.first_name }}!</p>
            <p class="role-bubble">{{ userStore.role_id }}</p>
            
        </div>
        <!-- Home icon positioned at the flex-end -->
        <div class="home-icon" @click="goHome">
            <PProfilePic design="small" @click="props.openModal" :profileImage="userStore.profile_picture" />
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
        </div>
    </div>
</template>

<style scoped>
.home-icon {
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    /* Additional styling */
    padding: 0.5rem;
    transition: transform 0.2s ease;
}
.home-icon:hover {
    transform: scale(1.1);
}
</style>