<template>
  <div>
    <h2 class="text-xl font-bold mb-4">📈 종목 추천</h2>
    <ChatBox :fixedIntent="'RECOMMEND_PROFILE'" />
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
