<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 상단 안내 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-blue-700 mb-1">📊 종목 분석</h2>
      <p class="text-sm text-gray-500">분석하고 싶은 종목을 선택하거나 자유롭게 입력해보세요.</p>
    </div>

    <!-- 추천 종목 버튼 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <button
        @click="send('삼성전자 요약 분석해줘')"
        class="bg-blue-100 text-blue-800 font-semibold py-3 rounded-xl"
      >
        삼성전자
      </button>
      <button
        @click="send('에코프로 요약 분석해줘')"
        class="bg-blue-100 text-blue-800 font-semibold py-3 rounded-xl"
      >
        에코프로
      </button>
    </div>

    <!-- 자유 입력 대화창 -->
    <div class="bg-white p-4 rounded-xl border shadow-sm">
      <ChatBox ref="chatRef" :fixedIntent="'STOCK_ANALYZE'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatBox from '@/components/ChatBox.vue'

const chatRef = ref(null)

function send(prompt) {
  chatRef.value?.sendPrompt(prompt)
}
</script>
