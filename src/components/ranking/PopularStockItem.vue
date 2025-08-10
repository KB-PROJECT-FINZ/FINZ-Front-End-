<template>
  <div
    class="flex items-center space-x-3 p-2 border rounded-md shadow-sm bg-white max-w-md w-full text-sm"
  >
    <img
      :src="logo || '/images/stocks/default.png'"
      alt="logo"
      class="w-8 h-8 object-contain rounded"
      loading="lazy"
    />
    <div class="flex-1 truncate">
      <div class="font-semibold truncate">{{ name }}</div>
      <!-- 성향 줄은 필요할 때만 -->
      <div v-if="trait" class="text-xs text-gray-500">{{ trait }}</div>
    </div>
    <!-- gain = 보유자 수: 색상 고정 추천 -->
    <div class="font-semibold text-gray-800">
      {{ gain }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  trait: { type: String, default: '' }, // 선택값
  gain: Number, // 보유자 수
  logo: String,
})
</script>
