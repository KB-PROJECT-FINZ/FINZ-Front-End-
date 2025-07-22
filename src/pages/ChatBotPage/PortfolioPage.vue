<template>
  <div>
    <h2 class="text-xl font-bold mb-4">🧠 투자 포트폴리오 피드백</h2>
    <ChatBox :fixedIntent="'PORTFOLIO_ANALYZE'" />
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
