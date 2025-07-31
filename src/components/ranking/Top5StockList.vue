<template>
  <div class="bg-white shadow-lg rounded-2xl p-6">
    <h2 class="text-xl font-semibold mb-4">이번주 인기 종목 TOP5</h2>

    <div class="overflow-x-auto flex gap-4 py-3">
      <div
        v-for="(stock, index) in stocks"
        :key="index"
        class="min-w-[130px] bg-gray-50 rounded-xl p-4 shadow-md flex flex-col items-center"
      >
        <img
          :src="stock.image || '/images/default-stock-logo.png'"
          alt="stock-logo"
          class="w-12 h-12 mb-2 object-contain rounded-full"
        />
        <p class="text-base font-semibold text-center">{{ stock.name }}</p>
      </div>
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
