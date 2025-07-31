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
      // ✅ API 응답 키에 맞게 수정
      this.userId = user.userId
      this.username = user.username
      this.name = user.name
      this.riskType = user.riskType
    },
    clearUser() {
      this.userId = null
      this.username = ''
      this.name = ''
      this.riskType = ''
    },
  },
})
