<!-- src/pages/ChatBotPage.vue -->
<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
    <!-- 🎨 로고 + 배경 파형 -->
    <div class="relative w-full max-w-xs h-60 mb-2">
      <!-- 배경 wave -->
      <img :src="waveImage" alt="wave" class="absolute inset-0 w-full h-60 object-contain z-0" />
      <!-- 로고 -->
      <img src="@/assets/fina.png" alt="finz" class="relative z-10 w-32 mx-auto mt-24" />
    </div>

    <!-- 텍스트 설명 -->
    <div class="text-center text-gray-600 text-sm leading-tight mb-8">
      GPT 기반 맞춤형 금융 챗봇<br />
      <span class="text-xs text-gray-500">궁금한 걸 언제든지 물어보세요</span>
    </div>

    <!-- 챗봇 박스 -->
    <div class="w-full max-w-md">
      <ChatBox />
    </div>
  </div>
</template>

<script setup>
import waveImage from '@/assets/wave.png'
import ChatBox from '@/components/ChatBox.vue'
</script>
