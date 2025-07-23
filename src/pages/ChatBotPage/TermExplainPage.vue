<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 헤더 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-yellow-700 mb-1">📚 금융 용어 설명</h2>
      <p class="text-sm text-gray-500">
        모르는 금융 용어가 있다면 자유롭게 질문해보세요. 챗봇이 쉽게 설명해드려요.
      </p>
    </div>

    <!-- 챗봇 박스 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <ChatBox :fixedIntent="'FIN_TERM_EXPLAIN'" />
    </div>
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
