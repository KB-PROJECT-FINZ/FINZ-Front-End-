<template>
  <div class="mock-trading-home">
    <TopNavigation />

    <main class="main-content">
      <SearchBar />

      <TradingVolumeRanking />

      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TopNavigation from '@/components/mockTrading/TopNavigation.vue'
import SearchBar from '@/components/mockTrading/SearchBar.vue'
import TradingVolumeRanking from '@/components/mockTrading/TradingVolumeRanking.vue'
import { getMarketIndices, checkApiHealth } from '@/services/mockTradingApi'

const isLoading = ref(false)
let marketUpdateInterval = null

const updateMarketData = async () => {
  try {
    console.log('MockTradingHome에서 시장 데이터 업데이트')

    const apiHealthy = await checkApiHealth()
    if (!apiHealthy) {
      console.warn('API 서버 연결 불안정')
    }

    const response = await getMarketIndices()
    if (response.success) {
      console.log('홈페이지 시장 데이터 업데이트 성공')
    } else {
      console.warn('시장 데이터 업데이트 실패:', response.message)
    }
  } catch (error) {
    console.error('시장 데이터 업데이트 오류:', error)
  }
}

onMounted(async () => {
  console.log('FINZ 모의투자 홈페이지 로드됨')

  isLoading.value = true

  try {
    await updateMarketData()
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error)
  } finally {
    isLoading.value = false
  }

  marketUpdateInterval = setInterval(updateMarketData, 60000)
})

onUnmounted(() => {
  if (marketUpdateInterval) {
    clearInterval(marketUpdateInterval)
  }
  console.log('FINZ 모의투자 홈페이지 언마운트됨')
})
</script>

<style scoped>
.mock-trading-home {
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.main-content {
  position: relative;
  padding-bottom: 60px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
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
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 40px;
  }
}
</style>
