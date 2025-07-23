<template>
  <div class="market-ticker">
    <transition name="slide" mode="out-in">
      <div :key="currentIndex" class="ticker-content">
        <div v-if="isLoading" class="loading-content">
          <div class="mini-spinner"></div>
          <span class="loading-text">로딩중...</span>
        </div>
        <div v-else class="index-info">
          <span class="index-name">{{ currentMarketIndex.name }}</span>
          <span class="index-value-wrap">
            <span
              class="index-value"
              :class="{
                positive: currentMarketIndex.isPositive,
                negative: !currentMarketIndex.isPositive,
              }"
            >
              {{ formatNumber(currentMarketIndex.value) }}
            </span>
            <span
              class="index-change"
              :class="{
                positive: currentMarketIndex.isPositive,
                negative: !currentMarketIndex.isPositive,
              }"
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
  if (marketIndices.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % marketIndices.value.length
  }
}

// 실제 API에서 시장 지수 데이터 가져오기
const fetchMarketIndices = async () => {
  try {
    console.log('시장 지수 티커에서 API 호출')
    const response = await getMarketIndices()

    if (response.success && response.data) {
      marketIndices.value = response.data
      console.log('시장 지수 티커 데이터 업데이트:', response.data)
    } else {
      console.warn('시장 지수 API 호출 실패:', response)
      // 기본값 설정
      marketIndices.value = [
        { name: 'KOSPI', value: 0, changePercent: 0, isPositive: true },
        { name: 'KOSDAQ', value: 0, changePercent: 0, isPositive: true },
      ]
    }
  } catch (error) {
    console.error('시장 지수 조회 실패:', error)
    // 에러 시 기본값
    marketIndices.value = [
      { name: 'KOSPI', value: 0, changePercent: 0, isPositive: true },
      { name: 'KOSDAQ', value: 0, changePercent: 0, isPositive: true },
    ]
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchMarketIndices()
  // 5초마다 다음 지수로 전환
  intervalId = setInterval(nextIndex, 5000)
  // 30초마다 데이터 업데이트
  dataUpdateInterval = setInterval(fetchMarketIndices, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval)
  }
})
</script>

<style scoped>
.market-ticker {
  color: #353d4a;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.ticker-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-width: 0;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

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

.loading-text {
  font-size: 10px;
  color: #353d4a;
}

.index-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2px;
}

.index-name {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.index-value-wrap {
  display: inline-flex;
  align-items: baseline;
  min-width: 110px;
  max-width: 120px;
  justify-content: flex-start;
}

.index-value {
  font-size: 13px;
  font-weight: 800;
  font-family: monospace;
  white-space: nowrap;
  margin-left: 0;
  transition: color 0.2s;
}
.index-value.positive {
  color: #d60000;
}
.index-value.negative {
  color: #0033cc;
}

.index-change {
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  text-align: center;
  white-space: nowrap;
  margin-left: 8px;
  transition: color 0.2s;
  display: flex;
  align-items: baseline;
}
.index-change.positive {
  color: #ff4444;
}
.index-change.negative {
  color: #4444ff;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 430px) {
  .market-ticker {
    height: 40px;
    padding: 0;
  }

  .index-name,
  .index-value,
  .index-change {
    font-size: 10px;
  }

  .index-info {
    margin-bottom: 1px;
  }

  .mini-spinner {
    width: 10px;
    height: 10px;
  }

  .loading-text {
    font-size: 9px;
  }
  .index-value-wrap {
    min-width: 80px;
    max-width: 90px;
  }
}
</style>
