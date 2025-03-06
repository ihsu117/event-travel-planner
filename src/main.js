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

app.mount('#app')
