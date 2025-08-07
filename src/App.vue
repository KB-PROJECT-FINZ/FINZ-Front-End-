<template>
  <div id="app">
    <div class="mobile-container">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

export default {
  setup() {
    onMounted(async () => {
      const userStore = useUserStore()

      if (userStore.userId) return

      try {
        const res = await axios.get('/api/auth/me')

        const user = res.data
        if (!user || (!user.id && !user.userId)) return

        userStore.setUser({
          userId: user.id ?? user.userId,
          username: user.username,
          name: user.name,
          riskType: user.riskType,
        })
      } catch (err) {
        console.warn('로그인된 사용자 정보 없음 또는 세션 만료됨')
      }
    })
  },
}
</script>

<style scoped>
/* 기존 스타일 유지 */
#app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.mobile-container {
  max-width: 430px;
  width: 100vw;
  height: 100dvh;
  overflow: auto;
  position: relative;
  background-color: white;
}
/* @font-face {
  font-family: 'Paperlogy4Regular';
  src: url('./fonts/Paperlogy-5Medium.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.mobile-container {
  font-family: 'Paperlogy4Regular';
} */
</style>
