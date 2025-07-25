import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    name: '',
  }),
  actions: {
    setUser(user) {
      this.username = user.username
      this.name = user.name
    },
  },
})
