import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user_id: null,
    first_name: '',
    last_name: '',
    org_id: '',
    org: {},
    role_id: '',
    profile_picture: '',
    email: '',
    users: []
  }),

  actions: {
    setUser(userData) {
      if (Array.isArray(userData)) {
        // Handle array of users
        this.users = userData.map(user => ({
          user_id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.org_id,
          org: user.org,
          role_id: user.role_id,
          profile_picture: user.profilePic,
          email: user.email
        }))
        console.log('Setting users data:', this.users)
      } else {
        const user = userData.user
        console.log('Setting user data:', user)
        this.user_id = user.id
        this.first_name = user.firstName
        this.last_name = user.lastName
        this.org_id = user.org_id
        this.org = user.org
        this.role_id = user.role_id
        this.profile_picture = user.profile_picture
        this.email = user.email
        console.log('User state updated:', this.$state)
      }
      localStorage.setItem('user', JSON.stringify(this.$state))
    },

    loadUser() {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        if (Array.isArray(userData.users)) {
          // Handle array of users
          this.users = userData.users;
          console.log('Loaded multiple users from local storage:', this.users)
        } else {
          this.user_id = userData.user_id
          this.first_name = userData.first_name
          this.last_name = userData.last_name
          this.org_id = userData.org_id
          this.org = userData.org
          this.role_id = userData.role_id
          this.profile_picture = userData.profile_picture
          this.email = userData.email
          console.log('User state loaded from local storage:', this.$state)
        }
      }
    },

    clearUser() {
      this.user_id = null
      this.first_name = ''
      this.last_name = ''
      this.org_id = ''
      this.org = ''
      this.role_id = ''
      this.profile_picture = ''
      this.email = ''
      this.users = [];
      localStorage.removeItem('user')
      console.log('User state cleared')
    }
  }
})