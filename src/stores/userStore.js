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
    dob: '',
    title: '',
    KTN: '',
    users: [],
    search_key: ''
  }),

  actions: {
    setUser(userData) {
      if (Array.isArray(userData) && userData.length > 1) {
        // Handle array of users
        this.users = userData.map(user => ({
          user_id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.org_id,
          org: user.org,
          role_id: user.role,
          profile_picture: user.profilePic,
          email: user.email,
          dob: user.dob,
          title: user.title,
          KTN: user.KTN
        }))
        console.log('Setting users data:', this.users)
      } else {
        const user = userData.user
        console.log('Setting user data:', user)
        this.user_id = user.id
        this.first_name = user.first_name
        this.last_name = user.last_name
        this.org_id = user.org_id
        this.org = user.org
        this.role_id = user.role_id
        this.profile_picture = user.profile_picture
        this.email = user.email
        this.dob = user.dob,
        this.title = user.title,
        this.KTN = user.KTN
        console.log('User state updated:', this.$state)
      }
      localStorage.setItem('user', JSON.stringify(this.$state))
    },

    setUserList(userData) {
      if (Array.isArray(userData) && userData.length > 1) {
        // Handle array of users
        this.users = userData.map(user => ({
          user_id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.org_id,
          org: user.org,
          role_id: user.role,
          profile_picture: user.profilePic,
          email: user.email,
          dob: user.dob,
          title: user.title,
          KTN: user.KTN
        }))
        console.log('Setting users data:', this.users)
      } else {
        const user = userData.user
        console.log('Setting user data:', user)
        this.user_id = user.id
        this.first_name = user.first_name
        this.last_name = user.last_name
        this.org_id = user.org_id
        this.org = user.org
        this.role_id = user.role_id
        this.profile_picture = user.profile_picture
        this.email = user.email
        this.dob = user.dob,
        this.title = user.title,
        this.KTN = user.KTN
        console.log('User state updated:', this.$state)
      }
    },

    loadUser() {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        if (Array.isArray(userData.users) && userData.length > 1) {
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
          this.dob = userData.dob
          this.title = userData.title
          this.KTN = userData.KTN
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
      this.email = '',
      this.dob = '',
      this.title = '',
      this.KTN = '',
      this.users = [],
      this.search_key = '';
      localStorage.removeItem('user')
      console.log('User state cleared')
    },

    clearUserList() {
      this.users = []
      console.log('User list cleared')
    }
  }
})