<template>
  <div class="flex items-center space-x-3 p-2 rounded-md shadow-md max-w-md w-full text-sm">
    <img
      :src="logo || '/images/stocks/default.png'"
      alt="logo"
      class="w-9 h-9 object-contain rounded"
      loading="lazy"
    />
    <div class="flex-1 truncate">
      <div class="font-semibold truncate">{{ name }}</div>
    </div>
    <div class="font-semibold text-gray-800">{{ gain }}명</div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  gain: Number, // 보유자 수
  logo: String,
})
</script>
