<template>
  <div>
    <h2 class="text-xl font-bold mb-4">📚 금융 용어 설명</h2>
    <ChatBox :fixedIntent="'FIN_TERM_EXPLAIN'" />
  </div>
</template>

<script setup>
import ChatBox from '@/components/ChatBox.vue'
</script>
