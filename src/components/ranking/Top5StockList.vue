<template>
  <div class="overflow-x-auto flex gap-3 py-2">
    <div
      v-for="(stock, index) in stocks"
      :key="index"
      class="min-w-[120px] bg-white rounded-lg p-3 shadow flex flex-col items-center"
    >
      <img
        :src="stock.imageUrl || '/images/default-stock-logo.png'"
        alt="stock-logo"
        class="w-10 h-10 mb-1 object-contain"
      />
      <p class="text-sm font-bold">{{ stock.stockName }}</p>
      <p class="text-gray-500 text-xs">거래수: {{ stock.transactionCount }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    stocks: Array, // PopularStockDto[]
  },
}
</script>
