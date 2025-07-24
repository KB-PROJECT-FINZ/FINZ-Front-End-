<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-green-700 mb-1">🧠 포트폴리오 피드백</h2>
      <p class="text-sm text-gray-500">최근 투자 내역을 기반으로 AI 리포트를 받아보세요.</p>
    </div>

    <!-- 자동 분석 요청 버튼 -->
    <button
      @click="send('내 최근 투자 포트폴리오를 요약 분석해줘')"
      class="w-full bg-green-100 text-green-800 font-semibold py-3 rounded-xl mb-4"
    >
      🧾 포트폴리오 분석 요청
    </button>

    <!-- 챗봇 -->
    <div class="bg-white p-4 rounded-xl border shadow-sm">
      <ChatBox ref="chatRef" :fixedIntent="'PORTFOLIO_ANALYZE'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatBox from '@/components/ChatBox.vue'

const chatRef = ref(null)
const send = (text) => {
  chatRef.value?.sendPrompt(text)
}
</script>
