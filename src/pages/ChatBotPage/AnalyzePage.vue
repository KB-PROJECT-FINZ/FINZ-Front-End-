<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 헤더 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-blue-700 mb-1">📊 종목 분석</h2>
      <p class="text-sm text-gray-500">
        궁금한 종목을 입력하면 AI가 핵심 요약과 수치를 분석해드려요.
      </p>
    </div>

    <!-- 챗봇 박스 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <ChatBox :fixedIntent="'STOCK_ANALYZE'" />
    </div>
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
