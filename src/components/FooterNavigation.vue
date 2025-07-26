<template>
  <button
    @click="goToChatbot"
    class="fixed bottom-24 bg-gradient-to-r from-purple-200 to-indigo-200 text-white px-4 py-3 rounded-full shadow-lg z-50 hover:scale-105 transition-transform duration-300"
    style="right: max(calc((100vw - 430px) / 2 + 1rem), 1rem)"
  >
    <img
      src="https://cdn-icons-png.flaticon.com/512/10852/10852785.png"
      alt="챗봇"
      class="w-8 h-8"
    />
  </button>
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
      <!-- 아이콘 렌더링 분기 -->
      <div class="mb-1">
        <component v-if="typeof item.icon === 'object'" :is="item.icon" />
        <div v-else class="text-lg">{{ item.icon() }}</div>
      </div>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import HomeIcon from './icons/HomeIcon.vue'
import TradingIcon from './icons/TradingIcon.vue'
import StudyIcon from './icons/StudyIcon.vue'
import RankingIcon from './icons/RankingIcon.vue'
import MypageIcon from './icons/MypageIcon.vue'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'home', label: 'Home', to: '/home', icon: HomeIcon },
  { name: 'mock', label: 'Trading', to: '/mock-trading', icon: TradingIcon },
  { name: 'study', label: 'Learn', to: '/learning', icon: StudyIcon },
  { name: 'ranking', label: 'Ranking', to: '/ranking', icon: RankingIcon },
  { name: 'mypage', label: 'My Page', to: '/profile', icon: MypageIcon },
]

const goToChatbot = () => {
  router.push('/chatbot')
}

const isActive = (path) => route.path.startsWith(path)
</script>

<style>
.router-link-exact-active svg {
  fill: #9333ea; /* Tailwind 보라색 */
}
</style>
