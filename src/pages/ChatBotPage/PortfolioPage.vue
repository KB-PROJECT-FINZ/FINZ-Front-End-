<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 헤더 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-green-700 mb-1">🧠 투자 포트폴리오 피드백</h2>
      <p class="text-sm text-gray-500">
        최근 투자 기록을 기반으로 AI가 포트폴리오를 분석하고 개선 방향을 알려드려요.
      </p>
    </div>

    <!-- 챗봇 박스 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <ChatBox :fixedIntent="'PORTFOLIO_ANALYZE'" />
    </div>
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
