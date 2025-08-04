<template>
  <div class="min-h-[100vh] pb-20 bg-gray-50">
    <!-- 상단 헤더 + 보유 종목 요약 통합 배경 -->
    <div class="bg-white">
      <header
        class="flex items-center justify-between px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10 bg-white"
      >
        <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">보유 종목</span>
        <button
          class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
          @click="refreshData"
          :disabled="loading"
        >
          <span :class="{ 'animate-spin': loading }">&#8635;</span>
        </button>
      </header>
      <!-- 보유 종목 요약 -->
      <section class="pt-4 px-0">
        <div class="flex justify-between items-center px-6 pt-2">
          <h3 class="text-lg font-semibold text-gray-900">내 투자</h3>
        </div>
        <div class="flex flex-col gap-3 p-5">
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">원금</span>
            <span class="text-base text-gray-900">{{ totalInvestment.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">평가금액</span>
            <span class="text-base text-gray-900">{{ totalCurrentValue.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">총 수익</span>
            <span
              class="text-base"
              :class="totalProfitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ totalProfitLoss >= 0 ? '+' : ''
              }}{{ Math.abs(totalProfitLoss).toLocaleString() }}원
            </span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">수익률</span>
            <span
              class="text-base"
              :class="totalProfitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ totalProfitRate >= 0 ? '+' : '' }}{{ totalProfitRate }}%
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- 정렬 옵션 -->
    <section class="mx-4 mt-4 mb-4">
      <div class="flex items-center text-xs text-gray-500 font-medium">
        <button
          type="button"
          class="flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[70px] h-6 ml-0"
          :class="[
            showDetail
              ? 'bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-300'
              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200',
          ]"
          style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
          @click="showDetail = !showDetail"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 min-w-[16px] mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          자세히 보기
        </button>
        <div class="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 flex-nowrap ml-auto">
          <button
            v-for="sort in sortOptions"
            :key="sort.key"
            @click="changeSortOption(sort.key)"
            class="px-1.5 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[44px] h-6 flex items-center justify-center"
            :class="
              currentSort === sort.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            "
          >
            {{ sort.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 보유 종목 리스트 -->
    <section class="bg-white rounded-xl px-4">
      <div
        v-for="holding in sortedHoldings"
        :key="holding.stockCode"
        class="p-4 cursor-pointer transition-colors"
        @click="goToStockDetail(holding.stockCode, holding.stockName)"
      >
        <template v-if="showDetail">
          <!-- 상세 카드: 종목명 옆에 이미지 -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="holding.imageUrl && !imageErrors[holding.stockCode]"
                  :src="holding.imageUrl"
                  :alt="`${holding.stockName} 로고`"
                  class="w-full h-full object-cover rounded-full"
                  @error="handleImageError(holding.stockCode)"
                />
                <span
                  v-else
                  class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                  style="border-color: #2272eb; color: #2272eb; background: #fff"
                >
                  {{ getStockInitial(holding.stockName) }}
                </span>
              </span>
              <div>
                <h4 class="text-base font-semibold text-gray-900">{{ holding.stockName }}</h4>
                <p class="text-sm text-gray-500">{{ holding.stockCode }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="flex flex-col gap-0 text-right">
                <div class="text-base font-bold text-gray-900 leading-tight">
                  {{ holding.currentPrice.toLocaleString() }}원
                </div>
                <span
                  class="text-sm leading-tight"
                  :class="holding.profitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
                  style="margin-top: 2px"
                >
                  {{ holding.profitRate >= 0 ? '+' : '' }}{{ holding.profitRate }}%
                </span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">보유수량</span>
              <span class="ml-2 font-medium text-gray-900">{{ holding.quantity }}주</span>
            </div>
            <div>
              <span class="text-gray-500">평균단가</span>
              <span class="ml-2 font-medium text-gray-900"
              >{{ holding.averagePrice.toLocaleString() }}원</span
              >
            </div>
            <div>
              <span class="text-gray-500">평가금액</span>
              <span class="ml-2 font-medium text-gray-900"
              >{{ holding.totalValue.toLocaleString() }}원</span
              >
            </div>
            <div>
              <span class="text-gray-500">평가손익</span>
              <span
                class="ml-2 font-medium"
                :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
              >
                {{ holding.profitLoss >= 0 ? '+' : ''
                }}{{ Math.abs(holding.profitLoss).toLocaleString() }}원
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- 간단 카드: 종목명 옆에 이미지, 보유수량(아래), 오른쪽에 현재가/평가손익(수익률%) -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="holding.imageUrl && !imageErrors[holding.stockCode]"
                  :src="holding.imageUrl"
                  :alt="`${holding.stockName} 로고`"
                  class="w-full h-full object-cover rounded-full"
                  @error="handleImageError(holding.stockCode)"
                />
                <span
                  v-else
                  class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                  style="border-color: #2272eb; color: #2272eb; background: #fff"
                >
                  {{ getStockInitial(holding.stockName) }}
                </span>
              </span>
              <div class="flex flex-col min-w-0">
                <div class="text-base font-semibold text-gray-900 truncate">
                  {{ holding.stockName }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ holding.quantity }}주</div>
              </div>
            </div>
            <div class="flex flex-col items-end justify-center min-w-[110px]">
              <span class="text-base text-gray-900 font-semibold mb-0.5">
                {{ holding.currentPrice.toLocaleString() }}원
              </span>
              <span
                :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
                class="text-xs"
              >{{ holding.profitRate >= 0 ? '+' : '-'
                }}{{ Math.abs(holding.profitLoss).toLocaleString() }}원 ({{
                  holding.profitRate >= 0 ? '+' : ''
                }}{{ holding.profitRate }}%)
              </span>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- 빈 상태 -->
    <div v-if="holdingsData.length === 0 && !loading" class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-center mb-4">보유 중인 종목이 없습니다</p>
      <button
        @click="goToMockTrading"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        모의투자 시작하기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white"
    >
      <div
        class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"
      ></div>
      <p>보유 종목을 불러오는 중...</p>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import FooterNavigation from '../../components/FooterNavigation.vue'

const showDetail = ref(false)

const router = useRouter()
const loading = ref(false)
const currentSort = ref('name') // 기본 정렬: 종목명

// 정렬 옵션
const sortOptions = [
  { key: 'name', label: '종목명' },
  { key: 'profitRate', label: '수익률' },
  { key: 'profitLoss', label: '평가손익' },
]

// 보유 종목 데이터
const holdingsData = ref([])

// 배치로 여러 종목의 실시간 가격을 한번에 조회하는 함수
const fetchMultipleStockPrices = async (stockCodes) => {
  try {
    const codesString = stockCodes.join(',');
    const response = await axios.get(`/api/stock/prices/${codesString}`);

    if (response.data && response.data.success) {
      console.log(`배치 가격 조회 완료: ${response.data.successCount}/${response.data.requestedCount} 성공`);

      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('⚠️ 일부 종목 조회 실패:', response.data.errors);
      }

      return response.data.data;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ 배치 주식 가격 조회 실패:', error);
    return null;
  }
}

// 보유 종목 실시간 가격 업데이트 함수
const updateHoldingsWithRealTimePrice = async (holdings) => {
  if (holdings.length === 0) return holdings;

  // 모든 종목코드 추출
  const stockCodes = holdings.map(holding => holding.stockCode);

  // 배치로 모든 종목의 가격을 한번에 조회
  const pricesData = await fetchMultipleStockPrices(stockCodes);

  if (!pricesData) {
    console.warn('⚠️ 배치 가격 조회 실패, 기존 데이터 유지');
    return holdings;
  }

  const updatedHoldings = holdings.map(holding => {
    const priceInfo = pricesData[holding.stockCode];

    if (priceInfo && priceInfo.output) {
      const output = priceInfo.output;
      const currentPrice = parseInt(output.stck_prpr);

      // 현재 시세로 현재 가치 및 손익 재계산
      const totalValue = holding.quantity * currentPrice;
      const totalInvestment = holding.quantity * holding.averagePrice;
      const profitLoss = totalValue - totalInvestment;
      const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

      return {
        ...holding,
        currentPrice: currentPrice,
        totalValue: totalValue,
        profitLoss: profitLoss,
        profitRate: Number(profitRate.toFixed(2)),
        priceChange: parseInt(output.prdy_vrss),
        changeRate: parseFloat(output.prdy_ctrt),
        changeSign: output.prdy_vrss_sign,
      };
    } else {
      // 해당 종목의 가격 조회 실패 시 기존 데이터 유지
      console.warn(`⚠️ ${holding.stockCode} 가격 조회 실패, 기존 데이터 유지`);
      return holding;
    }
  });

  return updatedHoldings;
}

// 수정된 데이터 불러오기 함수
async function fetchHoldings() {
  loading.value = true
  try {

    const response = await axios.get('/api/mocktrading/holdings')

    if (response.data && Array.isArray(response.data)) {
      console.log('보유 종목 데이터 로드 완료')

      // 기본 보유 종목 데이터 정리
      const basicHoldings = response.data.map((h) => ({
        stockCode: h.stockCode,
        stockName: h.stockName,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice: h.currentPrice || 0,
        totalValue: h.currentValue || 0,
        profitLoss: h.profitLoss || 0,
        profitRate: h.profitRate || 0,
        imageUrl: h.imageUrl,
      }))

      // 배치로 실시간 가격 업데이트
      holdingsData.value = await updateHoldingsWithRealTimePrice(basicHoldings)
      console.log('배치 실시간 가격 업데이트 완료')
    } else {
      holdingsData.value = []
      console.log('📝 보유 종목 없음')
    }
  } catch (error) {
    console.error('❌ 보유 종목 데이터 불러오기 실패:', error)
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
      return
    }
    holdingsData.value = []
    alert('보유 종목 데이터를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 계산된 속성들
const totalInvestment = computed(() => {
  return holdingsData.value.reduce(
    (sum, holding) => sum + holding.averagePrice * holding.quantity,
    0,
  )
})

const totalCurrentValue = computed(() => {
  return holdingsData.value.reduce((sum, holding) => sum + holding.totalValue, 0)
})

const totalProfitLoss = computed(() => {
  return holdingsData.value.reduce((sum, holding) => sum + holding.profitLoss, 0)
})

const totalProfitRate = computed(() => {
  if (totalInvestment.value === 0) return 0
  return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
})

// 정렬된 보유 종목
const sortedHoldings = computed(() => {
  const sorted = [...holdingsData.value]

  switch (currentSort.value) {
    case 'name':
      return sorted.sort((a, b) => a.stockName.localeCompare(b.stockName))
    case 'profitRate':
      return sorted.sort((a, b) => b.profitRate - a.profitRate)
    case 'profitLoss':
      return sorted.sort((a, b) => b.profitLoss - a.profitLoss)
    default:
      return sorted
  }
})

// 메서드들
const goBack = () => {
  router.back()
}

const changeSortOption = (sortKey) => {
  currentSort.value = sortKey
}

const goToStockDetail = (stockCode, stockName) => {
  router.push(`/mock-trading/${stockCode}/chart?stockName=${encodeURIComponent(stockName)}`)
}

const goToMockTrading = () => {
  router.push('/mock-trading')
}

const refreshData = async () => {
  console.log('🔄 보유 종목 데이터 새로고침')
  await fetchHoldings()
}

// 종목 이미지 에러 추적
const imageErrors = ref({})

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

// 이미지 로딩 에러 처리
const handleImageError = (stockCode) => {
  imageErrors.value[stockCode] = true
}

onMounted(() => {
  fetchHoldings()
  console.log('보유 종목 페이지 마운트됨')
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
