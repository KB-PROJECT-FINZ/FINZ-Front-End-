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
      <div class="text-xs text-gray-500">{{ trait }}</div>
    </div>
    <div :class="['font-semibold', gain >= 0 ? 'text-green-600' : 'text-red-600']">
      {{ gain }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  trait: String,
  gain: Number,
  logo: String,
})
</script>
