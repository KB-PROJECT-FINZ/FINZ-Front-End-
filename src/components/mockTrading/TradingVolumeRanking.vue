<template>
  <div class="bg-white w-full h-[79vh] flex flex-col overflow-hidden">
    <!-- 헤더와 탭 -->
    <div class="px-5 py-4 border-b border-gray-100 bg-transparent">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-[18px] font-semibold text-gray-800 m-0 bg-transparent">거래 순위</h3>
        <span class="text-[12px] text-gray-500">{{ updateTime }}</span>
      </div>

      <!-- 탭 메뉴 -->
      <div class="flex bg-gray-100 rounded-lg p-1 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.code"
          class="flex-1 px-3 py-2 text-[12px] font-medium rounded-md transition-all duration-200"
          :class="[
            activeTab === tab.code
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="changeTab(tab.code)"
        >
          {{ tab.name }}
        </button>
      </div>
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
              class="w-full h-full rounded-full flex items-center justify-center text-[11px] font-bold border-2 text-center flex-shrink-0"
              style="border-color: #2272eb; color: #2272eb; background: #fff"
            >
              {{ getStockInitial(stock.name) }}
            </span>
          </span>
          <div class="flex flex-col">
            <span class="text-[15px] font-medium text-gray-800">{{ stock.name }}</span>
            <div class="flex items-center gap-2">
              <span class="text-[14px] text-gray-800">{{ formatPrice(stock.currentPrice) }}</span>
              <span
                class="flex items-center gap-1 text-[12px] font-medium"
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
          <span class="text-[12px] font-medium px-2 py-0.5 rounded" :class="getValueDisplayClass()">
            {{ formatDisplayValue(stock) }}
          </span>
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
const imageErrors = ref({})
const activeTab = ref('3') // 기본값: 거래대금순

let updateInterval = null

// 탭 정의 - 거래대금/거래량
const tabs = [
  { code: '3', name: '거래대금', description: '거래금액순' },
  { code: '0', name: '거래량', description: '평균거래량' },
]

const visibleStocks = computed(() =>
  showAll.value ? stockRanking.value : stockRanking.value.slice(0, 10),
)

const changeTab = async (tabCode) => {
  if (activeTab.value === tabCode) return

  activeTab.value = tabCode
  showAll.value = false
  await fetchVolumeRanking()
}

const getValueDisplayClass = () => {
  switch (activeTab.value) {
    case '3':
      return 'text-green-600 bg-green-50'
    case '0':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const formatDisplayValue = (stock) => {
  switch (activeTab.value) {
    case '3':
      return formatTradingVolume(stock.tradingVolume)
    case '0':
      return formatVolume(stock.volume || stock.tradingVolume)
    default:
      return formatTradingVolume(stock.tradingVolume)
  }
}

const fetchVolumeRanking = async () => {
  isLoading.value = true
  try {
    const response = await getVolumeRanking(20, activeTab.value)
    if (response.success && response.data) {
      stockRanking.value = response.data
      updateTime.value = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } else {
      console.warn('⚠️ 거래 순위 API 호출 실패:', response.message)
      setFallbackData()
    }
  } catch (error) {
    console.error('❌ 거래 순위 조회 실패:', error.message)
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
      volume: 15000000,
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
      volume: 8500000,
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
      volume: 6200000,
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
      volume: 4800000,
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
      volume: 12000000,
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
      volume: 3200000,
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
  if (volume >= 1000000000000) {
    return (volume / 1000000000000).toFixed(1) + '조원'
  } else if (volume >= 100000000) {
    return Math.floor(volume / 100000000) + '억원'
  } else if (volume >= 10000000) {
    return Math.floor(volume / 10000000) + '천만원'
  } else {
    return Math.floor(volume / 10000) + '만원'
  }
}

const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return Math.floor(volume / 1000000) + '백만주'
  } else if (volume >= 10000) {
    return Math.floor(volume / 10000) + '만주'
  } else {
    return Math.floor(volume / 1000) + '천주'
  }
}

const selectStock = async (stock) => {
  try {
    await router.push({
      name: 'ChartPage',
      params: {
        stockCode: stock.code,
      },
      query: {
        stockName: stock.name,
      },
    })
  } catch (error) {
    console.error('❌ 라우팅 오류:', error)
  }
}

const handleImageError = (stockCode) => {
  console.warn(`🚫 이미지 로딩 실패: ${stockCode}`)
  imageErrors.value[stockCode] = true
}

// 종목명에서 이니셜 추출 (이미지 대체용)
const getStockInitial = (stockName) => {
  if (!stockName) return '?'

  // 한글 종목명의 경우 첫 글자 사용
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(stockName.charAt(0))) {
    return stockName.charAt(0)
  }

  // 영문의 경우도 첫 글자 사용
  return stockName.substring(0, 1).toUpperCase()
}

onMounted(async () => {
  await fetchVolumeRanking()
  // 60초마다 자동 업데이트
  updateInterval = setInterval(fetchVolumeRanking, 60000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
})
</script>

<style scoped>
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
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
