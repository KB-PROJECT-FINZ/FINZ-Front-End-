<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-xl font-bold mb-4">맞춤형 AI 투자 챗봇</h1>
    <p class="text-sm text-gray-600 mb-6">원하는 기능을 선택하면 챗봇이 맞춤형 대화를 시작해요.</p>

    <!-- intent별 버튼 -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <button @click="goTo('recommend')" class="btn-intent">종목 추천</button>
      <button @click="goTo('analyze')" class="btn-intent">종목 분석</button>
      <button @click="goTo('terms')" class="btn-intent">용어 설명</button>
      <button @click="goTo('portfolio')" class="btn-intent">투자 피드백</button>
    </div>

    <!-- 기본 대화(ChatBot) -->
    <ChatBox :fixedIntent="'MESSAGE'" />
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

<style scoped>
.btn-intent {
  padding: 12px 16px;
  background-color: #ebf8ff;
  color: #1c3d5a;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-intent:hover {
  background-color: #bee3f8;
}
</style>
