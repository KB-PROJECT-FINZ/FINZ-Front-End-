<template>
  <div
    class="min-h-screen max-w-[430px] mx-auto border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)]"
  >
    <TopNavigation />

    <main class="relative pb-[60px]">
      <SearchBar />
      <TradingVolumeRanking />
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
  try {
    await updateMarketData()
  } catch (error) {
    console.error('❌ 초기 데이터 로드 실패:', error.message)
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
