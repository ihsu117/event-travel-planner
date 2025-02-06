import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import EventPage from '../components/EventPage.vue'
import FlightSearch from '../components/FlightSearch.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    props: true
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/event',
    name: 'Event',
    component: EventPage,
  },
  {
        path: '/flight',
        name: 'Flight',
        component: FlightSearch,
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router