<template>
  <nav
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 flex justify-around py-2 z-50"
  >
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="flex flex-col items-center text-xs w-full"
      :class="isActive(item.to) ? 'text-purple-600 font-bold' : 'text-gray-400'"
    >
      <div class="text-lg">{{ item.icon }}</div>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'home', label: '홈', to: '/home', icon: '🏠' },
  { name: 'mock', label: '모의투자', to: '/mock-trading', icon: '📊' },
  { name: 'study', label: '개념학습', to: '/study', icon: '📚' },
  { name: 'ranking', label: '랭킹', to: '/ranking', icon: '🏆' },
  { name: 'mypage', label: '마이', to: '/mypage', icon: '👤' },
]

const isActive = (path) => route.path.startsWith(path)
</script>
