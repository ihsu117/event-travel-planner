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
        <svg class="home-icon" xmlns="http://www.w3.org/2000/svg" width="4em" height="4em" @click="goHome" viewBox="0 0 24 24">
            <path fill="#fff"
                d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1" />
        </svg>
        <div class="header-pic">
            <PProfilePic design="small" @click="props.openModal" :profileImage="userStore.profile_picture" />
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
    margin: 0.5rem;

    transition: transform 0.2s ease;
}

.home-icon:hover {
    transform: scale(1.1);
}

.header-pic {
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    /* Additional styling */
    margin: 0.5rem;
    margin-right: 2rem;
    transition: transform 0.2s ease;
    
}

.header-pic:hover {
    transform: scale(1.1);
}
</style>