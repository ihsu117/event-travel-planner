import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
import { checkAuth } from './assets/scripts/checkAuth'

const app =createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore()
userStore.loadUser()
checkAuth()

const gmapsAPI = document.createElement('script')
gmapsAPI.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_gmaps_api_key}&libraries=places`
gmapsAPI.async = true
gmapsAPI.defer = true
gmapsAPI.onload = () => {
    app.mount('#app')
}
document.head.appendChild(gmapsAPI)
