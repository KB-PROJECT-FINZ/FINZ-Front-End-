<template>
  <div>
    <h2 class="text-xl font-bold mb-4">📊 종목 분석</h2>
    <ChatBox :fixedIntent="'STOCK_ANALYZE'" />
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
