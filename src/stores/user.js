import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: '',
    name: '',
    riskType: '',
  }),
  actions: {
    setUser(user) {
      this.userId = user.id
      this.username = user.username
      this.name = user.name
      this.riskType = user.riskType
    },
    clearUser() {
      this.userId = null
      this.username = null
      this.name = null
      this.riskType = null
    },
  },
})
