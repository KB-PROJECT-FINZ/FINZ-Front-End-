<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: currentRoute === item.route }"
      @click="handleNavClick(item.route)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-text">{{ item.name }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => route.name)

const navItems = [
  { name: '홈', icon: '🏠', route: 'home' },
  { name: '거래', icon: '📊', route: 'trading' },
  { name: '차트', icon: '📈', route: 'chart' },
  { name: '마이', icon: '👤', route: 'profile' },
]

const handleNavClick = (routeName) => {
  if (routeName !== currentRoute.value) {
    router.push({ name: routeName })
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  padding: 8px 0;
  z-index: 100;
}

.nav-item {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: 10px;
  color: #6c757d;
}

.nav-item.active .nav-text {
  color: #667eea;
  font-weight: 600;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

@media (max-width: 430px) {
  .bottom-nav {
    left: 0;
    transform: none;
    max-width: none;
  }
}
</style>
