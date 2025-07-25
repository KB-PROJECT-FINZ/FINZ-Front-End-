<template>
  <div
    class="min-h-screen max-w-[430px] mx-auto border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)]"
  >
    <TopNavigation />

    <main class="relative pb-[60px]">
      <SearchBar />
      <TradingVolumeRanking />

      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm"
      >
        <div class="bg-white p-8 rounded-xl text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-[16px] text-gray-500 m-0 font-medium">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    </main>
  </div>
  <FooterNavigation />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TopNavigation from '@/components/mockTrading/TopNavigation.vue'
import SearchBar from '@/components/mockTrading/SearchBar.vue'
import TradingVolumeRanking from '@/components/mockTrading/TradingVolumeRanking.vue'
import { getMarketIndices, checkApiHealth } from '@/services/mockTradingApi'
import FooterNavigation from '@/components/FooterNavigation.vue'

const isLoading = ref(false)
let marketUpdateInterval = null

const updateMarketData = async () => {
  try {
    const apiHealthy = await checkApiHealth()
    if (!apiHealthy) {
      console.warn('⚠️ API 서버 연결 불안정')
      return
    }
    const response = await getMarketIndices()
    if (response.success) {
      console.log('✅ 시장 데이터 업데이트 성공')
    } else {
      console.warn('⚠️ 시장 데이터 업데이트 실패:', response.message)
    }
  } catch (error) {
    console.error('❌ 시장 데이터 업데이트 오류:', error.message)
  }
}

onMounted(async () => {
  console.log('🚀 FINZ 모의투자 홈페이지 초기화')
  isLoading.value = true
  try {
    await updateMarketData()
  } catch (error) {
    console.error('❌ 초기 데이터 로드 실패:', error.message)
  } finally {
    isLoading.value = false
  }
  marketUpdateInterval = setInterval(updateMarketData, 60000)
})

onUnmounted(() => {
  if (marketUpdateInterval) {
    clearInterval(marketUpdateInterval)
    marketUpdateInterval = null
  }
})
</script>

<style>
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
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
