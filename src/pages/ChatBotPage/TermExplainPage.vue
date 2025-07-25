<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-yellow-700 mb-1">📚 금융 용어 설명</h2>
      <p class="text-sm text-gray-500">모르는 용어를 선택하거나 자유롭게 질문해보세요.</p>
    </div>

    <!-- 예시 용어 버튼 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <button
        @click="send('PER이 뭐야?')"
        class="bg-yellow-100 text-yellow-800 font-semibold py-3 rounded-xl"
      >
        PER
      </button>
      <button
        @click="send('ETF가 뭐야?')"
        class="bg-yellow-100 text-yellow-800 font-semibold py-3 rounded-xl"
      >
        ETF
      </button>
    </div>

    <!-- 챗봇 -->
    <div class="bg-white p-4 rounded-xl border shadow-sm">
      <ChatBox ref="chatRef" :fixedIntent="'FIN_TERM_EXPLAIN'" />
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
