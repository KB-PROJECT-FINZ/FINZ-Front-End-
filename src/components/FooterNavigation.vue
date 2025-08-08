<template>
  <button
    @click="goToChatbot"
    class="fixed bottom-20 text-white px-2 py-2 rounded-full shadow-lg z-50 hover:scale-105 transition-transform duration-300"
    style="
      background-color: #fcf6e9;
      /* border: 1px solid #616978; */
      right: max(calc((100vw - 430px) / 2 + 1rem), 1rem);
    "
  >
    <img src="@/assets/finz-robot.png" alt="챗봇" class="w-12 h-12" />
  </button>
  <nav
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 flex justify-around py-2 z-50"
  >
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="flex flex-col items-center text-xs w-full"
      :class="isActive(item.to) ? 'font-bold' : 'font-bold'"
      :style="isActive(item.to) ? 'color: #f8a70c' : 'color: black'"
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
  { name: 'home', label: '홈', to: '/home', icon: HomeIcon },
  { name: 'mock', label: '거래', to: '/mock-trading', icon: TradingIcon },
  { name: 'study', label: '학습', to: '/learning', icon: StudyIcon },
  { name: 'ranking', label: '랭킹', to: '/ranking', icon: RankingIcon },
  { name: 'mypage', label: '마이페이지', to: '/profile', icon: MypageIcon },
]

const goToChatbot = () => {
  // 챗봇 패널 열기 이벤트 발생
  window.dispatchEvent(new CustomEvent('openChatBot'))
}

const isActive = (path) => route.path.startsWith(path)
</script>

<style>
/* 활성화된 링크의 내부 색상 */
</style>
