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
    const userStore = useUserStore()

    onMounted(async () => {
      try {
        const res = await axios.get('/api/auth/me')
        userStore.setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data)) // Optional
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
