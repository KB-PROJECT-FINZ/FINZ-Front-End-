<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 상단 로고 및 안내 -->
    <div class="mb-6">
      <img src="@/assets/finz.png" alt="finz" class="w-16 mb-2" />
      <p class="text-lg font-bold">AI 투자 도우미 챗봇</p>
      <p class="text-sm text-gray-500">원하는 기능을 선택해서 시작해보세요</p>
    </div>

    <!-- 자유 대화 안내 -->
    <div class="mt-8 bg-white p-4 rounded-xl border shadow-sm">
      <ChatBox :fixedIntent="null" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ChatBox from '@/components/ChatBox.vue'

const router = useRouter()

function goTo(type) {
  const map = {
    recommend: 'ChatBotRecommendPage',
    analyze: 'ChatBotAnalyzePage',
    terms: 'ChatBotTermExplainPage',
    portfolio: 'ChatBotPortfolioPage',
  }
  router.push({ name: map[type] })
}
</script>
