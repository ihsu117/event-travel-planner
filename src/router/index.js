import { createRouter, createWebHistory } from 'vue-router'
import { checkAuth } from '../assets/scripts/checkAuth.js'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import EventPage from '../components/EventPage.vue'
import FlightSearch from '../components/FlightSearch.vue'
import FlightItinerary from '../components/FlightItinerary.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/event',
    name: 'Event',
    component: EventPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/flight',
    name: 'Flight',
    component: FlightSearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/flight/itinerary',
    name: 'FlightItinerary',
    component: FlightItinerary,
    meta: { requiresAuth: true }
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {

  const isAuthenticated = checkAuth()
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Home' })
  }
  else {
    next()
  }
})

export default router