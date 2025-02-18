import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    firstName: '',
    lastName: '',
    organization: '',
    role: '',
    profileImage: '',
    email: ''
  }),

  actions: {
    setUser(userData) {
      this.firstName = userData.first_name
      this.lastName = userData.last_name
      this.organization = userData.org_id
      this.role = userData.role_id
      this.profileImage = userData.profile_picture
      this.email = userData.email
    }
  }
})