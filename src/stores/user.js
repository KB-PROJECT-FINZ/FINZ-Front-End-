import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userId: '',
    username: '',
    name: '',
    riskType: '',
  }),
  actions: {
    setUser(user) {
      const id = user.userId ?? user.id // 둘 중 하나 허용
      if (!user || !id) {
        console.warn('⚠️ 유효하지 않은 사용자 정보로 setUser 호출됨:', user)
        return
      }
      this.userId = id
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
    updateProfileImage(imageUrl) {
      if (this.user) {
        this.user.profileImage = imageUrl
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },
  },
})
