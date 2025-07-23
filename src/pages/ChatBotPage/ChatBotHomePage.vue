<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 상단 안내 -->
    <div class="mb-6">
      <img src="@/assets/finz.png" alt="finz" class="w-16 mb-2" />
      <p class="text-lg font-bold">
        나에게 꼭 맞는 <span class="text-purple-600">AI 투자 챗봇</span>
      </p>
      <p class="text-sm text-gray-500">궁금한 걸 클릭해서 바로 시작해보세요</p>
    </div>

    <!-- intent 버튼 카드 -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        @click="goTo('recommend')"
        class="flex items-center justify-center rounded-xl p-5 border font-semibold text-center cursor-pointer transition hover:scale-[1.03] hover:shadow bg-purple-50 border-purple-200 text-purple-700"
      >
        <p class="text-sm font-semibold">📈 종목 추천</p>
      </div>
      <div
        @click="goTo('analyze')"
        class="flex items-center justify-center rounded-xl p-5 border font-semibold text-center cursor-pointer transition hover:scale-[1.03] hover:shadow bg-blue-50 border-blue-200 text-blue-700"
      >
        <p class="text-sm font-semibold">📊 종목 분석</p>
      </div>
      <div
        @click="goTo('terms')"
        class="flex items-center justify-center rounded-xl p-5 border font-semibold text-center cursor-pointer transition hover:scale-[1.03] hover:shadow bg-yellow-50 border-yellow-200 text-yellow-700"
      >
        <p class="text-sm font-semibold">💡 용어 설명</p>
      </div>
      <div
        @click="goTo('portfolio')"
        class="flex items-center justify-center rounded-xl p-5 border font-semibold text-center cursor-pointer transition hover:scale-[1.03] hover:shadow bg-green-50 border-green-200 text-green-700"
      >
        <p class="text-sm font-semibold">🧠 투자 피드백</p>
      </div>
    </div>

    <!-- 자유 대화 챗봇 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <p class="text-sm text-gray-500 mb-2">자유 대화도 가능해요</p>
      <ChatBox :fixedIntent="'MESSAGE'" />
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
