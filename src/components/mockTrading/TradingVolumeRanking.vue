<template>
  <div class="trading-volume-container">
    <div class="section-header">
      <h3 class="section-title">거래대금 상위 종목</h3>
      <span class="update-time">{{ updateTime }}</span>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>데이터 로딩 중...</span>
    </div>

    <div v-else class="stock-list">
      <div
        v-for="(stock, index) in visibleStocks"
        :key="stock.code"
        class="stock-item"
        @click="selectStock(stock)"
      >
        <div class="rank-info">
          <span class="rank-number">{{ index + 1 }}</span>
          <span class="stock-badge">
            <img v-if="stock.imageUrl" :src="stock.imageUrl" alt="종목 이미지" class="stock-img" />
            <span v-else class="stock-img-placeholder"></span>
          </span>
          <div class="stock-basic-info">
            <span class="stock-name">{{ stock.name }}</span>
            <div class="stock-price-info">
              <span class="current-price">{{ formatPrice(stock.currentPrice) }}</span>
              <span
                class="price-change"
                :class="{ positive: stock.isPositive, negative: !stock.isPositive }"
              >
                <span class="change-arrow">{{ stock.isPositive ? '▲' : '▼' }}</span>
                {{ Math.abs(stock.change).toLocaleString() }}
                ({{ stock.isPositive ? '+' : '-' }}{{ Math.abs(stock.changePercent).toFixed(2) }}%)
              </span>
            </div>
          </div>
        </div>
        <div class="stock-details">
          <div class="volume-info">
            <span class="trading-volume">{{ formatTradingVolume(stock.tradingVolume) }}</span>
          </div>
        </div>
      </div>
      <button v-if="!showAll && stockRanking.length > 10" class="more-btn" @click="showAll = true">
        더보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getVolumeRanking } from '@/services/mockTradingApi'

const stockRanking = ref([])
const updateTime = ref('')
const isLoading = ref(false)
const showAll = ref(false)

let updateInterval = null

/**
 * 표시할 종목 목록 계산
 */
const visibleStocks = computed(() =>
  showAll.value ? stockRanking.value : stockRanking.value.slice(0, 10),
)

/**
 * 거래량 순위 데이터 가져오기
 */
const fetchVolumeRanking = async () => {
  isLoading.value = true

  try {
    const response = await getVolumeRanking(20)

    if (response.success && response.data) {
      stockRanking.value = response.data
      updateTime.value = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      console.log('📈 거래량 순위 업데이트 성공:', response.data.length, '건')
    } else {
      console.warn('⚠️ 거래량 순위 API 호출 실패:', response.message)
      setFallbackData()
    }
  } catch (error) {
    console.error('❌ 거래량 순위 조회 실패:', error.message)
    setFallbackData()
  } finally {
    isLoading.value = false
  }
}

/**
 * 기본 데이터 설정 (API 실패 시)
 */
const setFallbackData = () => {
  stockRanking.value = [
    {
      code: '005930',
      name: '삼성전자',
      currentPrice: 75000,
      change: 1000,
      changePercent: 1.35,
      isPositive: true,
      tradingVolume: 500000000000,
    },
    {
      code: '000660',
      name: 'SK하이닉스',
      currentPrice: 120000,
      change: -2000,
      changePercent: -1.64,
      isPositive: false,
      tradingVolume: 300000000000,
    }
  ]

  updateTime.value = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 가격 포맷팅
 */
const formatPrice = (price) => {
  return price.toLocaleString() + '원'
}

/**
 * 거래대금 포맷팅
 */
const formatTradingVolume = (volume) => {
  if (volume >= 100000000) {
    return Math.floor(volume / 100000000) + '억원'
  } else if (volume >= 10000000) {
    return Math.floor(volume / 10000000) + '천만원'
  } else {
    return Math.floor(volume / 10000) + '만원'
  }
}

/**
 * 종목 선택 처리
 */
const selectStock = (stock) => {
  console.log('📊 선택된 종목:', stock.name, `(${stock.code})`)

  // TODO: 추후 종목 상세 페이지로 라우팅 또는 모달 표시
  // router.push({ name: 'StockDetail', params: { code: stock.code } })
}

/**
 * 컴포넌트 마운트 시 초기화
 */
onMounted(() => {
  console.log('📈 거래량 순위 컴포넌트 초기화')

  fetchVolumeRanking()

  // 30초마다 데이터 업데이트
  updateInterval = setInterval(fetchVolumeRanking, 30000)
})

/**
 * 컴포넌트 언마운트 시 정리
 */
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
  console.log('📈 거래량 순위 컴포넌트 정리 완료')
})
</script>

<style scoped>
.trading-volume-container {
  background: white;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  width: 100%;
  height: calc(79vh);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: transparent;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  background: transparent;
}

.update-time {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stock-list {
  flex: 1 1 auto;
  max-height: none;
  overflow-y: auto;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: transparent;
  border: none;
}

.stock-item:hover {
  background: #f8fafc;
}

.stock-item:last-child {
  border-bottom: none;
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  color: #3b82f6;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  margin-right: 4px;
  flex-shrink: 0;
}

.stock-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 6px;
  flex-shrink: 0;
}

.stock-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.stock-img-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e5e7eb;
  display: block;
}

.stock-basic-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.stock-price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  font-family: monospace;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  font-family: monospace;
}

.price-change.positive {
  color: #dc2626;
}

.price-change.negative {
  color: #2563eb;
}

.change-arrow {
  font-size: 10px;
}

.stock-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.volume-info {
  margin-top: 2px;
}

.trading-volume {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
}

.more-btn {
  display: block;
  width: 100%;
  padding: 12px 0;
  background: #f3f4f6;
  color: #1f2937;
  border: none;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.more-btn:hover {
  background: #e5e7eb;
}

@media (max-width: 430px) {
  .trading-volume-container {
    margin: 12px;
  }

  .section-header {
    padding: 12px 16px;
  }

  .stock-item {
    padding: 10px 16px;
  }

  .stock-badge {
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }

  .rank-info {
    gap: 4px;
  }
}
</style>
