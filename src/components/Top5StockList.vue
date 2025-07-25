<template>
  <div class="overflow-x-auto flex gap-3 py-2">
    <div
      v-for="(stock, index) in stocks"
      :key="index"
      class="min-w-[120px] bg-white rounded-lg p-3 shadow flex flex-col items-center"
    >
      <img
        :src="stock.image || '/images/default-stock-logo.png'"
        alt="stock-logo"
        class="w-10 h-10 mb-1 object-contain"
      />
      <p class="text-sm font-bold">{{ stock.name }}</p>
      <p :class="stock.gain > 0 ? 'text-red-500' : 'text-blue-500'">
        {{ stock.gain > 0 ? '+' : '' }}{{ stock.gain }}%
      </p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stocks: Array, // Top5StockDto[]
  },
}
</script>
