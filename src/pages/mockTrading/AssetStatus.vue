<template>
  <div class="min-h-[100vh] pb-20 bg-none">
    <!-- 상단 헤더 -->
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10"
    >
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900"
      >나의 자산 현황</span
      >
      <button
        class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        @click="refreshData"
        :disabled="loading"
      >
        <span :class="{ 'animate-spin': loading }">&#8635;</span>
      </button>
    </header>

    <!-- 계좌번호 + 총 자산 & 충전 버튼 -->
    <section class="flex items-center justify-between gap-6 mt-5 px-8 py-4">
      <div class="flex flex-col justify-center">
        <div class="text-sm text-gray-400 font-normal mb-0">
          FINZ증권 {{ userAccount.accountNumber || '계좌번호 로딩중...' }}
        </div>
        <div class="w-full h-px bg-gray-200 my-0"></div>
        <div class="flex items-baseline gap-2">
          <div class="text-xl font-bold text-gray-900">
            ₩ {{ userAccount.totalAssetValue?.toLocaleString() || '0' }}
          </div>
        </div>
      </div>
      <button
        class="bg-blue-500 text-white rounded-lg px-5 h-11 font-semibold text-base hover:bg-blue-700 ml-3 flex items-center"
        @click="showChargeModal = true"
        :disabled="loading"
      >
        충전하기
      </button>
    </section>

    <!-- 크레딧 충전 모달 (디자인 복원) -->
    <div
      v-if="showChargeModal"
      class="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-md rounded-t-2xl p-6 pb-8 shadow-lg relative animate-slide-up"
        @click.stop
      >
        <!-- 닫기 버튼 -->
        <button
          class="absolute right-4 top-4 text-gray-400 text-2xl"
          @click="showChargeModal = false"
        >
          &times;
        </button>
        <div class="mb-4 text-center text-lg font-bold">사용할 수 있는 포인트</div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-700">내 크레딧</span>
          <span class="font-bold text-gray-700">{{ userCredit }}P</span>
        </div>
        <div class="mt-6 mb-2 text-gray-700 font-medium">전환신청 크레딧 입력</div>
        <div class="flex justify-end mb-2">
          <button
            class="border border-gray-300 text-gray-700 bg-white rounded px-2 py-1 text-xs font-normal hover:bg-gray-100 transition-colors"
            style="min-width: 60px"
            @click="chargeCreditInput = userCredit"
          >
            보유크레딧 전체
          </button>
        </div>
        <div class="relative mb-4">
          <input
            v-model.number="chargeCreditInput"
            type="number"
            min="1"
            :max="userCredit"
            class="border rounded-lg px-3 py-2 w-full text-right font-bold text-lg pr-7 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-lg font-bold pointer-events-none"
          >P</span
          >
        </div>
        <div class="my-6 text-center text-gray-700">
          내 계좌에
          <span class="font-bold text-blue-600">{{
              (chargeCreditInput * 1000).toLocaleString()
            }}</span>
          원이 추가됩니다.
        </div>
        <button
          class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:text-gray-400"
          :disabled="!chargeCreditInput || chargeCreditInput < 1 || chargeCreditInput > userCredit"
          @click="onChargeNext"
        >
          확인 &gt;
        </button>
      </div>
    </div>

    <!-- 포트폴리오 차트 -->
    <section class="mt-5 px-5">
      <div class="flex flex-col items-center px-5 py-6">
        <canvas
          ref="portfolioChart"
          class="w-[180px] h-[180px] mb-5"
          style="max-width: 180px; max-height: 180px"
        />

        <!-- 범례 -->
        <div class="w-full">
          <!-- 보유 종목들 -->
          <div
            v-for="(holding, index) in portfolioPercentages.holdings"
            :key="holding.stockCode"
            class="flex items-center mb-2 gap-2"
          >
            <div
              class="w-3 h-3 rounded"
              :style="{ backgroundColor: chartColors[index % chartColors.length] }"
            ></div>
            <div class="flex justify-between items-center flex-1">
              <span class="text-sm font-medium text-gray-700">{{ holding.stockName }}</span>
              <span class="text-xs font-bold text-gray-400">{{ holding.percentage }}%</span>
            </div>
          </div>

          <!-- 현금 -->
          <div class="flex items-center mb-2 gap-2">
            <div class="w-3 h-3 rounded bg-gray-200"></div>
            <div class="flex justify-between items-center flex-1">
              <span class="text-sm font-medium text-gray-700">현금</span>
              <span class="text-xs font-bold text-gray-400">{{ portfolioPercentages.cash }}%</span>
            </div>
          </div>

          <!-- 데이터 로딩 상태 표시 -->
          <div v-if="!dataLoaded" class="text-center text-gray-500 text-sm py-4">
            포트폴리오 정보를 불러오는 중...
          </div>
        </div>
      </div>
    </section>
    <div class="w-full h-px bg-gray-200 mx-auto" />

    <!-- 주문 가능 금액 -->
    <section class="flex flex-col items-start w-full mt-4 mb-0 px-6">
      <div class="text-base text-gray-500 font-normal">주문 가능 금액</div>
      <div class="text-lg font-bold text-gray-900 ml-1 mt-1">
        ₩ {{ userAccount.currentBalance?.toLocaleString() || '0' }}
      </div>
    </section>

    <!-- 투자 중인 금액 & 수익률 -->
    <section class="flex flex-col items-start w-full mt-0 mb-0 py-3 px-6">
      <div class="text-base text-gray-500 font-normal">투자 중인 금액</div>
      <div class="flex items-center gap-2 mt-1 ml-1">
        <div class="text-lg font-bold text-gray-900">₩ {{ stockValue.toLocaleString() }}</div>
        <span
          class="font-bold text-lg ml-2"
          :class="
            calculatedProfitRate > 0
              ? 'text-red-600'
              : calculatedProfitRate < 0
                ? 'text-blue-600'
                : 'text-gray-500'
          "
        >
          {{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%
        </span>
      </div>
    </section>
    <div class="w-full h-px bg-gray-200 mx-auto" />

    <!-- 보유 종목 바로가기 -->
    <section class="my-2 px-6">
      <button
        class="w-full text-left text-base font-semibold text-gray-700 py-4 px-1 hover:bg-gray-100"
        @click="goHoldingsPage"
      >
        보유 종목 전체 보기 &gt;
      </button>
    </section>
    <div class="w-full h-px bg-gray-200 mx-auto" />

    <!-- 최근 거래 내역 바로가기 -->
    <section class="my-2 px-6">
      <button
        class="w-full text-left text-base font-semibold text-gray-700 py-4 px-1 hover:bg-gray-100"
        @click="goTransactionsPage"
      >
        최근 거래 내역 전체 보기 &gt;
      </button>
    </section>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white"
    >
      <div
        class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"
      ></div>
      <p>자산 정보를 불러오는 중...</p>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'
import axios from 'axios'

const router = useRouter()

// ===== 상태 관리 =====
const loading = ref(false)
const showChargeModal = ref(false)
const chargeCreditInput = ref(0)
const dataLoaded = ref(false)

// ===== 사용자 데이터 =====
const userAccount = ref({
  accountId: null,
  accountNumber: '',
  currentBalance: 0,
  totalAssetValue: 0,
  totalProfitLoss: 0,
  profitRate: 0,
})

const userCredit = ref(0)
const holdingsData = ref([])

// ===== 포트폴리오 차트 관련 =====
const portfolioChart = ref(null)
const chartColors = [
  '#4285F4',
  '#34A853',
  '#FBBC04',
  '#EA4335',
  '#9AA0A6',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
]

// ===== Computed Properties =====
const stockValue = computed(() => {
  return holdingsData.value.reduce((total, holding) => {
    return total + (holding.currentValue || 0)
  }, 0)
})

const totalInvestment = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + (holding.averagePrice || 0) * (holding.quantity || 0)
  }, 0)
})

const totalProfitLoss = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + (holding.profitLoss || 0)
  }, 0)
})

const calculatedProfitRate = computed(() => {
  if (totalInvestment.value === 0) return 0
  return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
})

const portfolioPercentages = computed(() => {
  if (!dataLoaded.value || userAccount.value.totalAssetValue === 0) {
    return {
      holdings: [],
      cash: 100,
    }
  }

  const totalAsset = userAccount.value.totalAssetValue

  const holdingPercentages = holdingsData.value.map((holding) => {
    const exactPercentage = (holding.currentValue / totalAsset) * 100
    return {
      ...holding,
      exactPercentage,
      percentage: Math.round(exactPercentage),
    }
  })

  const stockTotalExact = holdingPercentages.reduce((sum, h) => sum + h.exactPercentage, 0)
  let cashDisplayPercentage = Math.round(100 - stockTotalExact)

  const totalDisplayPercentage =
    holdingPercentages.reduce((sum, h) => sum + h.percentage, 0) + cashDisplayPercentage

  if (totalDisplayPercentage !== 100) {
    const difference = 100 - totalDisplayPercentage

    if (holdingPercentages.length > 0) {
      const largestHolding = holdingPercentages.reduce((max, current) =>
        current.exactPercentage > max.exactPercentage ? current : max,
      )
      largestHolding.percentage += difference
    } else {
      cashDisplayPercentage += difference
    }
  }

  return {
    holdings: holdingPercentages,
    cash: cashDisplayPercentage,
  }
})

// ===== Watchers =====
watch(chargeCreditInput, (val) => {
  if (val > userCredit.value) chargeCreditInput.value = userCredit.value
})

watch(
  [dataLoaded, portfolioPercentages],
  ([loaded]) => {
    if (loaded) {
      nextTick(() => {
        updatePortfolioChart()
      })
    }
  },
  { immediate: true, deep: true },
)

// ===== 메서드들 =====
const goBack = () => {
  router.back()
}

const goHoldingsPage = () => {
  router.push('/mock-trading/holdings')
}

const goTransactionsPage = () => {
  router.push('/mock-trading/transactions')
}

// 크레딧 충전
const onChargeNext = async () => {
  if (!chargeCreditInput.value || chargeCreditInput.value < 1) {
    alert('충전할 금액을 입력해주세요.')
    return
  }

  if (chargeCreditInput.value > userCredit.value) {
    alert('보유 크레딧을 초과할 수 없습니다.')
    return
  }

  try {
    loading.value = true
    const response = await axios.post('/api/mocktrading/charge-credit', {
      creditAmount: chargeCreditInput.value,
    })

    if (response.data.success) {
      alert(`${chargeCreditInput.value}P 충전이 완료되었습니다!`)
      await loadUserData() // 데이터 새로고침
    } else {
      alert('충전에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('크레딧 충전 오류:', error)
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
    } else {
      alert('충전 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
    showChargeModal.value = false
    chargeCreditInput.value = 0
  }
}

// 🆕 배치로 여러 종목의 실시간 가격을 한번에 조회하는 함수
const fetchMultipleStockPrices = async (stockCodes) => {
  try {
    const codesString = stockCodes.join(',');
    const response = await axios.get(`/api/stock/prices/${codesString}`);

    if (response.data && response.data.success) {
      console.log(`배치 가격 조회 완료: ${response.data.successCount}/${response.data.requestedCount} 성공`);

      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('⚠️ 일부 종목 조회 실패:', response.data.errors);
      }

      return response.data.data; // 종목코드를 키로 하는 가격 데이터 객체
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ 배치 주식 가격 조회 실패:', error);
    return null;
  }
}

// 🔄 수정된 보유 종목 실시간 가격 업데이트 함수 (배치 API 사용)
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
      const currentValue = holding.quantity * currentPrice;
      const totalInvestment = holding.quantity * holding.averagePrice;
      const profitLoss = currentValue - totalInvestment;
      const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

      return {
        ...holding,
        currentPrice: currentPrice,
        currentValue: currentValue,
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

// 차트 업데이트 함수
const updatePortfolioChart = () => {
  if (!portfolioChart.value) {
    console.log('❌ 차트 캔버스가 없음')
    return
  }

  const ctx = portfolioChart.value.getContext('2d')
  const centerX = portfolioChart.value.width / 2
  const centerY = portfolioChart.value.height / 2
  const radius = Math.min(centerX, centerY) - 10

  // 캔버스 초기화
  ctx.clearRect(0, 0, portfolioChart.value.width, portfolioChart.value.height)

  const { holdings, cash } = portfolioPercentages.value

  if (holdings.length === 0 && cash === 100) {
    // 보유 종목이 없을 때 전체를 현금으로 표시
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
    return
  }

  let currentAngle = -Math.PI / 2 // 12시 방향부터 시작

  // 보유 종목들 그리기
  holdings.forEach((holding, index) => {
    if (holding.percentage > 0) {
      const sliceAngle = (holding.percentage / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = chartColors[index % chartColors.length]
      ctx.fill()

      // 경계선 추가
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      currentAngle += sliceAngle
    }
  })

  // 현금 비율 그리기
  if (cash > 0) {
    const cashAngle = (cash / 100) * 2 * Math.PI

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + cashAngle)
    ctx.closePath()
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()

    // 경계선 추가
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

// 🔄 수정된 데이터 로딩 함수
const loadUserData = async () => {
  loading.value = true
  dataLoaded.value = false

  try {
    // ===== 1단계: 계좌 정보 먼저 로드 =====
    const accountResponse = await axios.get('/api/mocktrading/account')

    if (accountResponse.data) {
      userAccount.value = {
        accountId: accountResponse.data.accountId,
        accountNumber: accountResponse.data.accountNumber || '',
        currentBalance: accountResponse.data.currentBalance || 0,
        totalAssetValue: accountResponse.data.totalAssetValue || 0,
        totalProfitLoss: accountResponse.data.totalProfitLoss || 0,
        profitRate: accountResponse.data.profitRate || 0,
      }
      console.log('계좌 정보 로드 완료')
    } else {
      throw new Error('계좌 정보를 불러올 수 없습니다.')
    }

    // ===== 2단계: 보유 종목 정보 로드 =====
    const holdingsResponse = await axios.get('/api/mocktrading/holdings')

    if (holdingsResponse.data && Array.isArray(holdingsResponse.data)) {
      console.log('보유 종목 데이터 로드 완료')

      // 기본 보유 종목 데이터 정리
      const basicHoldings = holdingsResponse.data.map((holding) => ({
        stockCode: holding.stockCode,
        stockName: holding.stockName,
        quantity: holding.quantity || 0,
        averagePrice: holding.averagePrice || 0,
        currentPrice: holding.currentPrice || 0,
        currentValue: holding.currentValue || 0,
        profitLoss: holding.profitLoss || 0,
        profitRate: holding.profitRate || 0,
      }))

      // 🆕 실시간 가격으로 업데이트
      holdingsData.value = await updateHoldingsWithRealTimePrice(basicHoldings)
      console.log('실시간 가격 업데이트 완료')
    } else {
      holdingsData.value = []
      console.log('📝 보유 종목 없음')
    }

    // ===== 3단계: 크레딧 로드 =====
    const creditResponse = await axios.get('/api/mocktrading/user/credit')

    if (creditResponse.data) {
      userCredit.value = creditResponse.data.totalCredit || 0
      console.log('크레딧 정보 로드 완료')
    }

    // ===== 4단계: 총 자산 가치 재계산 (실시간 가격 반영) =====
    const currentStockValue = holdingsData.value.reduce((total, holding) => {
      return total + (holding.currentValue || 0)
    }, 0)

    userAccount.value.totalAssetValue = userAccount.value.currentBalance + currentStockValue
    console.log('총 자산 가치 재계산 완료')

    // ===== 5단계: 모든 데이터 로드 완료 후 상태 업데이트 =====
    dataLoaded.value = true
    await nextTick()
    updatePortfolioChart()


  } catch (error) {
    console.error('❌ 사용자 데이터 로드 실패:', error)
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
      return
    }
    alert('데이터를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 데이터 새로고침
const refreshData = async () => {
  console.log('🔄 수동 새로고침 시작')
  await loadUserData()
}

// ===== 라이프사이클 =====
onMounted(async () => {
  // Canvas 크기 설정
  await nextTick()
  if (portfolioChart.value) {
    portfolioChart.value.width = 180
    portfolioChart.value.height = 180
  }
  await loadUserData()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

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
