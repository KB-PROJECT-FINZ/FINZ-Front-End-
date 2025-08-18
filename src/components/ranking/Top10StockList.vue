<template>
  <section>
    <h2 class="text-xl font-semibold mb-4">
      {{ isRealtime ? '오늘의 인기 종목 Top10' : '지난주 인기 종목 Top10' }}
    </h2>

    <!-- 가로 무한 스크롤 -->
    <div
      ref="ticker"
      class="flex overflow-x-hidden whitespace-nowrap gap-6"
      :class="{ 'justify-center': stocks.length < 3 }"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div
        v-for="(stock, index) in duplicatedStocks"
        :key="(stock.id ?? stock.code ?? stock.name ?? 'item') + '-' + index"
        class="relative min-w-[130px] bg-gray-50 rounded-xl p-4 pt-8 shadow-md flex flex-col items-center overflow-visible"
      >
        <!-- 👑 왕관: 원본 배열의 1등(인덱스 0) + 복제 구간 첫 카드에도 표시 -->
        <img
          v-if="showCrown(index)"
          :src="crownIcon"
          alt="crown"
          class="absolute -top-2 left-[70%] -translate-x-1/2 w-20 h-20 z-10 pointer-events-none"
        />

        <!-- 로고 -->
        <img
          :src="stock.image || '/images/default-stock-logo.png'"
          :alt="(stock.name || 'stock') + ' logo'"
          class="w-12 h-12 mb-2 object-contain rounded-full"
          @error="onError"
        />

        <!-- 종목명 -->
        <p class="text-base font-semibold text-center truncate max-w-[120px]">
          {{ stock.name }}
        </p>

        <!-- 수치: 0.00(±0.005 미만)은 숨김, %기호 제거 -->
        <p
          v-if="shouldShowGain(stock)"
          class="text-sm font-medium"
          :class="{
            'text-red-500': displayGain(stock) > 0,
            'text-blue-500': displayGain(stock) < 0,
          }"
        >
          {{ formatNumber(displayGain(stock)) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

// ✅ Vite에서 URL로 강제 임포트 (캐시/경로 이슈 방지)
import crownIcon from '@/assets/crown.svg?url'

const props = defineProps({
  stocks: { type: Array, default: () => [] }, // [{ name, gain/gainRate, image, ... }]
  isRealtime: { type: Boolean, default: false },
})

const ticker = ref(null)
const animationFrameId = ref(null)
const speed = 0.5 // px/frame

// 3개 이상이면 복제하여 무한 스크롤
const duplicatedStocks = computed(() =>
  props.stocks.length >= 3 ? [...props.stocks, ...props.stocks] : props.stocks,
)

// 왕관 표시: 원본 배열의 첫 카드(1등)
function showCrown(index) {
  const len = props.stocks.length
  return len > 0 && index % len === 0
}

// gain 표준화: gainRate ?? gain
function displayGain(s) {
  const v = s?.gainRate ?? s?.gain
  return typeof v === 'number' ? v : 0
}

// 0.00 숨김(절댓값 0.005 미만이면 렌더 X)
function shouldShowGain(s) {
  return Math.abs(displayGain(s)) >= 0.005
}

function formatNumber(v) {
  return Number(v).toFixed(2) // % 기호 없음
}

function onError(e) {
  if (e.target.src.includes('@/assets/finz.png')) return
  e.target.src = '@/assets/finz.png'
}

// 스크롤 애니메이션
function step() {
  if (!ticker.value) return
  const el = ticker.value
  el.scrollLeft += speed
  if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
  animationFrameId.value = requestAnimationFrame(step)
}
function pauseScroll() {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
}
function resumeScroll() {
  if (props.stocks.length >= 3) animationFrameId.value = requestAnimationFrame(step)
}
onMounted(() => {
  if (props.stocks.length >= 3) animationFrameId.value = requestAnimationFrame(step)
})
onBeforeUnmount(() => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
})
</script>
