<!-- ChatBotPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 max-w-[430px] mx-auto flex flex-col">
    <!-- 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
      <h1 class="text-lg font-bold text-gray-800">AI 챗봇 서비스</h1>
      <button class="text-gray-500 hover:text-gray-700" @click="goBack">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </header>

    <!-- 챗봇 컨테이너 -->
    <div
      class="flex-1 bg-white rounded-t-3xl shadow-lg border-t-2 border-gray-200 border border-black"
    >
      <div class="p-4">
        <ChatBox :fixedIntent="null" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ChatBox from '@/components/ChatBox.vue'

const router = useRouter()

function goBack() {
  router.back()
}
</script>
