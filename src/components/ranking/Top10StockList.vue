<template>
  <div class="bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
    <h2 class="text-xl font-semibold mb-4">
      {{ isRealtime ? '오늘의 인기 종목 Top10' : '지난주 인기 종목 Top10' }}
    </h2>

    <!-- 무한 스크롤 (JS로 제어) -->
    <div
      ref="ticker"
      class="flex overflow-hidden whitespace-nowrap gap-6"
      :class="{ 'justify-center': stocks.length < 3 }"
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

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
const animationFrameId = ref(null)
const speed = 0.5 // px per frame

// ✅ 종목 수 3개 이상일 때만 복제
const duplicatedStocks = computed(() => {
  return props.stocks.length >= 3 ? [...props.stocks, ...props.stocks] : props.stocks
})

// ✅ 스크롤 애니메이션 함수
function step() {
  if (!ticker.value) return

  const el = ticker.value
  el.scrollLeft += speed

  if (el.scrollLeft >= el.scrollWidth / 2) {
    el.scrollLeft = 0
  }

  animationFrameId.value = requestAnimationFrame(step)
}

// ✅ 마우스 오버/리브 시 스크롤 제어
function pauseScroll() {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
}
function resumeScroll() {
  if (props.stocks.length >= 3) {
    animationFrameId.value = requestAnimationFrame(step)
  }
}

// ✅ 마운트 시 조건부로 스크롤 시작
onMounted(() => {
  if (props.stocks.length >= 3) {
    animationFrameId.value = requestAnimationFrame(step)
  }
})

onBeforeUnmount(() => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
})
</script>

<style scoped></style>
