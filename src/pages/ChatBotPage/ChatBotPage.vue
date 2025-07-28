<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 상단 로고 및 안내 -->
    <div class="mb-6">
      <img src="@/assets/finz.png" alt="finz" class="w-16 mb-2" />
      <p class="text-lg font-bold">AI 투자 도우미 챗봇</p>
      <p class="text-sm text-gray-500">원하는 기능을 선택해서 시작해보세요</p>
    </div>
    <!-- 기능 버튼 영역 -->
    <div class="grid grid-cols-2 gap-4">
      <div
        class="bg-white rounded-xl border border-purple-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('recommend')"
      >
        <p class="text-sm font-semibold text-purple-700 mb-1">:상승세인_차트: 종목 추천</p>
        <p class="text-xs text-gray-500">내 성향이나 키워드로 종목 추천받기</p>
      </div>
      <div
        class="bg-white rounded-xl border border-blue-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('analyze')"
      >
        <p class="text-sm font-semibold text-blue-700 mb-1">:막대_차트: 종목 분석</p>
        <p class="text-xs text-gray-500">종목 이름 입력하면 핵심 분석 제공</p>
      </div>
      <div
        class="bg-white rounded-xl border border-yellow-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('terms')"
      >
        <p class="text-sm font-semibold text-yellow-700 mb-1">:책: 금융 용어</p>
        <p class="text-xs text-gray-500">PER, ETF 등 낯선 용어 설명</p>
      </div>
      <div
        class="bg-white rounded-xl border border-green-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('portfolio')"
      >
        <p class="text-sm font-semibold text-green-700 mb-1">:뇌: 투자 리포트</p>
        <p class="text-xs text-gray-500">포트폴리오 기반 AI 피드백 보기</p>
      </div>
    </div>
    <!-- 자유 대화 안내 -->
    <div class="mt-8 bg-white p-4 rounded-xl border shadow-sm">
      <p class="text-sm text-gray-500 mb-2">아무거나 물어봐도 괜찮아요</p>
      <ChatBox />
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
