<template>
  <div class="bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
    <h2 class="text-xl font-semibold mb-4">
      {{ isRealtime ? '오늘의 인기 종목 Top10' : '지난주 인기 종목 Top10' }}
    </h2>

    <!-- 무한 슬라이드 -->
    <div
      ref="ticker"
      class="flex whitespace-nowrap animate-scroll gap-6"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div
        v-for="(stock, index) in duplicatedStocks"
        :key="stock.id || stock.code ? (stock.id || stock.code) + '-' + index : index"
        class="min-w-[130px] bg-gray-50 rounded-xl p-4 shadow-md flex flex-col items-center"
      >
        <img
          :src="stock.image || '/images/default-stock-logo.png'"
          :alt="stock.name + ' logo'"
          class="w-12 h-12 mb-2 object-contain rounded-full"
        />
        <p class="text-base font-semibold text-center">{{ stock.name }}</p>
        <p
          class="text-sm font-medium"
          :class="{
            'text-red-500': stock.gain > 0,
            'text-blue-500': stock.gain < 0,
            'text-gray-500': stock.gain === 0,
          }"
        >
          {{ typeof stock.gainRate === 'number' ? stock.gainRate.toFixed(2) : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  stocks: {
    type: Array,
    default: () => [],
  },
  isRealtime: {
    type: Boolean,
    default: false,
  },
})

const ticker = ref(null)

// ✅ 무한 슬라이드를 위해 stocks를 2배로 복제
const duplicatedStocks = computed(() => [...props.stocks, ...props.stocks])

function pauseScroll() {
  if (ticker.value) ticker.value.style.animationPlayState = 'paused'
}

function resumeScroll() {
  if (ticker.value) ticker.value.style.animationPlayState = 'running'
}
</script>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 10s linear infinite;
  animation-play-state: running;
}
</style>
