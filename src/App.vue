<template>
  <div id="app">
    <div class="mobile-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

export default {
  setup() {
    const userStore = useUserStore()

    onMounted(() => {
      const savedUsername = localStorage.getItem('username')
      if (savedUsername) {
        userStore.setUser(savedUsername)
      }
    })
  },
}
</script>

<style scoped>
/* 페이드 전환 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

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
</style>
