<template>
  <nav
    class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 flex py-2 z-50"
  >
    <button
      v-for="item in navItems"
      :key="item.name"
      class="flex-1 bg-transparent border-none py-2 px-1 flex flex-col items-center gap-1"
      :class="{
        'text-blue-500': currentRoute === item.route,
        'text-gray-500': currentRoute !== item.route,
      }"
      @click="handleNavClick(item.route)"
    >
      <span class="text-xl">{{ item.icon }}</span>
      <span
        class="text-xs"
        :class="{
          'font-semibold text-blue-500': currentRoute === item.route,
          'text-gray-500': currentRoute !== item.route,
        }"
      >
        {{ item.name }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 현재 라우트 이름을 가져옴
const currentRoute = computed(() => route.name)

// 네비게이션 아이템 정의
const navItems = [
  { name: '홈', icon: '🏠', route: 'home' },
  { name: '거래', icon: '📊', route: 'trading' },
  { name: '차트', icon: '📈', route: 'chart' },
  { name: '마이', icon: '👤', route: 'profile' },
]

// 네비게이션 클릭 핸들러
const handleNavClick = (routeName) => {
  if (routeName !== currentRoute.value) {
    router.push({ name: routeName })
  }
}
</script>
