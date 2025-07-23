<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 헤더 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-purple-700 mb-1">📈 종목 추천</h2>
      <p class="text-sm text-gray-500">투자 성향 기반으로 AI가 맞춤형 종목을 추천해드릴게요.</p>
    </div>

    <!-- 챗박스 카드 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <ChatBox :fixedIntent="'RECOMMEND_PROFILE'" />
    </div>
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
