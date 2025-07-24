<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-purple-700 mb-1">📈 종목 추천</h2>
      <p class="text-sm text-gray-500">버튼을 누르면 챗봇이 추천을 시작합니다.</p>
    </div>

    <div class="flex flex-col gap-4 mb-4">
      <button
        class="bg-purple-100 text-purple-800 font-semibold py-3 rounded-xl"
        @click="send('나의 투자 성향에 맞는 종목을 추천해줘')"
      >
        💡 성향 기반 추천
      </button>
      <button
        class="bg-blue-100 text-blue-800 font-semibold py-3 rounded-xl"
        @click="send('2차전지 관련된 키워드 기반 종목을 추천해줘')"
      >
        🔍 키워드 기반 추천
      </button>
    </div>

    <div class="bg-white p-4 rounded-xl border shadow-sm">
      <ChatBox ref="chatRef" />
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
