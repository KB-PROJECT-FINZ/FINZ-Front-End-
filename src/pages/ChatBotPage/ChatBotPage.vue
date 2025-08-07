<!-- ChatBotPage.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 max-w-[430px] mx-auto flex flex-col">
    <!-- 헤더 -->
    <header class="flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-white/20">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-sm font-bold">🤖</span>
        </div>
        <h1 class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          AI 투자 어시스턴트
        </h1>
      </div>
      <button 
        class="p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md" 
        @click="goBack"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- 챗봇 컨테이너 -->
    <div class="flex-1 bg-white/70 backdrop-blur-sm rounded-t-3xl shadow-xl border border-white/30">
      <div class="p-6">
        <ChatBox :fixedIntent="null" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/counter.js'
import ChatBox from '@/components/ChatBox.vue'

const router = useRouter()

function goBack() {
  // 챗봇 대화 내용 초기화
  const chatStore = useChatStore()
  chatStore.clearMessages()
  
  // 이전 페이지로 이동
  router.back()
}
</script>
