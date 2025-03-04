import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user_id: null,
    first_name: '',
    last_name: '',
    org_id: '',
    role_id: '',
    profile_picture: '',
    email: ''
  }),

  actions: {
    setUser(userData) {
      this.user_id = userData.id
      this.first_name = userData.first_name
      this.last_name = userData.last_name
      this.org_id = userData.org_id
      this.role_id = userData.role_id
      this.profile_picture = userData.profile_picture
      this.email = userData.email
    }
  }
})