<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const typeCode = route.query.type
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">🎯 당신의 투자 성향은?</h1>
    <p class="mt-2 text-lg">➡️ {{ typeCode }} 유형입니다.</p>
    <!-- typeCode에 따른 설명 추가 -->
  </div>
</template>
