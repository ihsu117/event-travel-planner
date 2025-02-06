<script setup>
import {
    PButton,
    PDropDown,
    PTextField,
    PEvent,
    PProfilePic,
    PFinanceBlock
} from '@poseidon-components'
import '@poseidon-styles/index.css'

const props = defineProps({
    name: {
        type: String,
        default: 'name'
    },
    organization: {
        type: String,
        default: 'organization'
    },
    role: {
        type: String,
        default: 'role'
    },
    profileImage: {
        type: String,
        default: 'Poseidon-Design-System/PoseidonDesignSys/lib/assets/img/defaultPP.png'
    },
})
</script>
<template>
    <div class="phone-container">
    <div class="home">
    <div class="home-header">
        <p>{{ name }} - {{ organization }} - {{ role }}</p>
        <PProfilePic design="small" profileImage='{{profileImage}}' />
    </div>
        <h1>Upcoming Events</h1>
        <div class="p-event__container">
            <PEvent organization="Poseidon" event="Gate Review 1" :startDate="new Date(2025, 2, 11)"
                :endDate="new Date(2025, 2, 12)"
                bgImage="https://media.licdn.com/dms/image/v2/C5612AQGdAK3zSKJB5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1595251630672?e=2147483647&v=beta&t=9n9Ggoe-68JFjOG9OSHgGdAJBxTHCjOpJLhuCwzRCrU"
                design="block" />
                
                <PEvent organization="Poseidon" event="Gate Review 1" :startDate="new Date(2025, 2, 11)"
                :endDate="new Date(2025, 2, 12)"
                bgImage="https://media.licdn.com/dms/image/v2/C5612AQGdAK3zSKJB5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1595251630672?e=2147483647&v=beta&t=9n9Ggoe-68JFjOG9OSHgGdAJBxTHCjOpJLhuCwzRCrU"
                design="block" />
        </div>
    </div>
</div>

</template>