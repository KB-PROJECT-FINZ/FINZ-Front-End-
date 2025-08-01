<template>
  <div
    class="w-full h-11 flex items-center overflow-hidden text-[#353d4a] bg-transparent rounded-none shadow-none p-0"
  >
    <transition name="slide" mode="out-in">
      <div :key="currentIndex" class="flex flex-col justify-center w-full min-w-0">
        <div v-if="isLoading" class="flex items-center gap-[6px]">
          <div class="mini-spinner"></div>
          <span class="loading-text text-[10px] text-[#353d4a]">로딩중...</span>
        </div>
        <div v-else class="flex flex-col items-start mb-[2px]">
          <span class="index-name text-[11px] font-semibold tracking-[0.3px] whitespace-nowrap">{{
            currentMarketIndex.name
          }}</span>
          <span class="inline-flex items-baseline min-w-[110px] max-w-[120px] justify-start">
            <span
              class="index-value text-[13px] font-extrabold whitespace-nowrap ml-0 transition-colors duration-200"
              :class="currentMarketIndex.isPositive ? 'text-[#d60000]' : 'text-[#0033cc]'"
            >
              {{ formatNumber(currentMarketIndex.value) }}
            </span>
            <span
              class="index-change text-[11px] font-bold text-center whitespace-nowrap ml-2 transition-colors duration-200 flex items-baseline"
              :class="currentMarketIndex.isPositive ? 'text-[#ff4444]' : 'text-[#4444ff]'"
            >
              {{ currentMarketIndex.isPositive ? '+' : '-'
              }}{{ Math.abs(currentMarketIndex.changePercent).toFixed(2) }}%
            </span>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getMarketIndices } from '@/services/mockTradingApi'

const currentIndex = ref(0)
const marketIndices = ref([])
const isLoading = ref(true)

let intervalId = null
let dataUpdateInterval = null

let isUnmounted = false

const currentMarketIndex = computed(() => {
  if (marketIndices.value.length === 0) {
    return {
      name: 'KOSPI',
      value: 0,
      changePercent: 0,
      isPositive: true,
    }
  }
  return marketIndices.value[currentIndex.value]
})

const formatNumber = (number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

const nextIndex = () => {
  if (isUnmounted) return
  if (marketIndices.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % marketIndices.value.length
  }
}

const fetchMarketIndices = async () => {
  try {
    const response = await getMarketIndices()
    if (isUnmounted) return
    if (response.success && response.data) {
      marketIndices.value = response.data
    } else {
      console.warn('시장 지수 API 호출 실패:', response.message)
      setFallbackData()
    }
  } catch (error) {
    if (isUnmounted) return
    console.error('시장 지수 조회 실패:', error.message)
    setFallbackData()
  } finally {
    if (!isUnmounted) isLoading.value = false
  }
}

const setFallbackData = () => {
  marketIndices.value = [
    { name: 'KOSPI', value: 5000, changePercent: 0.58, isPositive: true },
    { name: 'KOSDAQ', value: 1000, changePercent: -0.97, isPositive: false },
  ]
}

onMounted(async () => {
  isUnmounted = false
  await fetchMarketIndices()
  intervalId = setInterval(() => {
    if (!isUnmounted) nextIndex()
  }, 5000)
  dataUpdateInterval = setInterval(() => {
    if (!isUnmounted) fetchMarketIndices()
  }, 60000) // 데이터 갱신 주기 (현재 1분)
})

onUnmounted(() => {
  isUnmounted = true
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval)
    dataUpdateInterval = null
  }
})
</script>

<style>
.mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(53, 61, 74, 0.2);
  border-top: 2px solid #353d4a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
