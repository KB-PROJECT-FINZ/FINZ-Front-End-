<template>
  <div class="bg-white w-full h-[79vh] flex flex-col overflow-hidden">
    <div
      class="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-transparent"
    >
      <h3 class="text-[18px] font-semibold text-gray-800 m-0 bg-transparent">거래대금 상위 종목</h3>
      <span class="text-[12px] text-gray-500 font-mono">{{ updateTime }}</span>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center gap-4 py-10 text-gray-500"
    >
      <div class="loading-spinner"></div>
      <span>데이터 로딩 중...</span>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-for="(stock, index) in visibleStocks"
        :key="stock.code"
        class="flex justify-between items-center px-5 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 bg-transparent"
        @click="selectStock(stock)"
      >
        <div class="flex items-center gap-1 flex-1">
          <span
            class="flex items-center justify-center w-7 h-7 text-blue-500 rounded-full text-[14px] font-bold mr-1"
          >{{ index + 1 }}</span
          >
          <span
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-2"
          >
            <img
              v-if="stock.imageUrl && !imageErrors[stock.code]"
              :src="stock.imageUrl"
              :alt="`${stock.name} 로고`"
              class="w-full h-full object-cover rounded-full"
              @error="handleImageError(stock.code)"
            />
            <span
              v-else
              class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold"
            >
              {{ getStockInitial(stock.name) }}
            </span>
          </span>
          <div class="flex flex-col gap-1">
            <span class="text-[14px] font-medium text-gray-800">{{ stock.name }}</span>
            <div class="flex items-center gap-2">
              <span class="text-[14px] font-semibold text-gray-800 font-mono">{{
                  formatPrice(stock.currentPrice)
                }}</span>
              <span
                class="flex items-center gap-1 text-[12px] font-medium font-mono"
                :class="stock.isPositive ? 'text-red-600' : 'text-blue-600'"
              >
                <span class="text-[10px]">{{ stock.isPositive ? '▲' : '▼' }}</span>
                {{ Math.abs(stock.change).toLocaleString() }}
                ({{ stock.isPositive ? '+' : '-' }}{{ Math.abs(stock.changePercent).toFixed(2) }}%)
              </span>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[12px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">{{
              formatTradingVolume(stock.tradingVolume)
            }}</span>
        </div>
      </div>
      <button
        v-if="!showAll && stockRanking.length > 10"
        class="block w-full py-3 bg-gray-100 text-gray-800 border-none border-t border-gray-200 text-[14px] font-medium cursor-pointer transition-colors hover:bg-gray-200"
        @click="showAll = true"
      >
        더보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVolumeRanking } from '@/services/mockTradingApi'

const router = useRouter()
const stockRanking = ref([])
const updateTime = ref('')
const isLoading = ref(false)
const showAll = ref(false)
const imageErrors = ref({}) // 이미지 로딩 에러 추적

let updateInterval = null

const visibleStocks = computed(() =>
  showAll.value ? stockRanking.value : stockRanking.value.slice(0, 10),
)

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

      // 이미지 URL 디버깅 로그
      response.data.forEach((stock, index) => {
        if (index < 5) { // 상위 5개만 로깅
          console.log(`🖼️ ${stock.name} (${stock.code}): ${stock.imageUrl || '이미지 없음'}`)
        }
      })
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
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005930.png',
    },
    {
      code: '000660',
      name: 'SK하이닉스',
      currentPrice: 120000,
      change: -2000,
      changePercent: -1.64,
      isPositive: false,
      tradingVolume: 300000000000,
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000660.png',
    },
    {
      code: '035420',
      name: 'NAVER',
      currentPrice: 185000,
      change: 3500,
      changePercent: 1.93,
      isPositive: true,
      tradingVolume: 250000000000,
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035420.png',
    },
    {
      code: '005380',
      name: '현대차',
      currentPrice: 195000,
      change: -1500,
      changePercent: -0.76,
      isPositive: false,
      tradingVolume: 200000000000,
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005380.png',
    },
    {
      code: '035720',
      name: '카카오',
      currentPrice: 47000,
      change: 800,
      changePercent: 1.73,
      isPositive: true,
      tradingVolume: 180000000000,
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035720.png',
    },
    {
      code: '051910',
      name: 'LG화학',
      currentPrice: 420000,
      change: -5000,
      changePercent: -1.18,
      isPositive: false,
      tradingVolume: 150000000000,
      imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/051910.png',
    },
  ]
  updateTime.value = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatPrice = (price) => {
  return price.toLocaleString() + '원'
}

const formatTradingVolume = (volume) => {
  if (volume >= 100000000) {
    return Math.floor(volume / 100000000) + '억원'
  } else if (volume >= 10000000) {
    return Math.floor(volume / 10000000) + '천만원'
  } else {
    return Math.floor(volume / 10000) + '만원'
  }
}

const selectStock = async (stock) => {
  console.log('📊 거래량 순위에서 종목 선택:', stock.name, `(${stock.code})`)

  try {
    // 종목 차트 페이지로 라우팅
    await router.push({
      name: 'ChartPage',
      params: {
        stockCode: stock.code
      },
      query: {
        stockName: stock.name,
        source: 'volume-ranking' // 어디서 온 건지 추적용
      }
    })

    console.log('🔀 종목 차트 페이지로 이동:', `/mock-trading/${stock.code}/chart`)
  } catch (error) {
    console.error('❌ 라우팅 오류:', error)
  }
}

// 이미지 로딩 에러 처리
const handleImageError = (stockCode) => {
  console.warn(`🚫 이미지 로딩 실패: ${stockCode}`)
  imageErrors.value[stockCode] = true
}

// 종목명에서 이니셜 추출 (이미지 대체용)
const getStockInitial = (stockName) => {
  if (!stockName) return '?'

  // 한글 종목명의 경우 첫 글자 사용
  if (/[가-힣]/.test(stockName)) {
    return stockName.charAt(0)
  }

  // 영문의 경우 첫 글자 대문자 사용
  return stockName.charAt(0).toUpperCase()
}

onMounted(() => {
  fetchVolumeRanking()
  updateInterval = setInterval(fetchVolumeRanking, 30000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
})
</script>

<style>
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
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
