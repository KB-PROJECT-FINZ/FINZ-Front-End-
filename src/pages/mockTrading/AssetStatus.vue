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
      >
        &#8635;
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
      >
        충전하기
      </button>

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
              (chargeCreditInput * 10000).toLocaleString()
            }}</span>
            원이 추가됩니다.
          </div>
          <button
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:text-gray-400"
            :disabled="
              !chargeCreditInput || chargeCreditInput < 1 || chargeCreditInput > userCredit
            "
            @click="onChargeNext"
          >
            확인 &gt;
          </button>
        </div>
      </div>
    </section>

    <!-- 포트폴리오 차트 -->
    <section class="mt-5 px-5">
      <div class="flex flex-col items-center px-5 py-6">
        <canvas
          ref="portfolioChart"
          class="w-[180px] h-[180px] mb-5"
          style="max-width: 180px; max-height: 180px"
        />
        <div class="w-full">
          <div
            v-for="(holding, index) in holdingsData"
            :key="holding.stockCode"
            class="flex items-center mb-2 gap-2"
          >
            <div
              class="w-3 h-3 rounded bg-gray-200"
              :style="{ backgroundColor: chartColors[index] }"
            ></div>
            <div class="flex justify-between items-center flex-1">
              <span class="text-sm font-medium text-gray-700">{{ holding.stockName }}</span>
              <span class="text-xs font-bold text-gray-400">{{ holding.percentage }}%</span>
            </div>
          </div>
          <div class="flex items-center mb-2 gap-2">
            <div class="w-3 h-3 rounded bg-gray-200"></div>
            <div class="flex justify-between items-center flex-1">
              <span class="text-sm font-medium text-gray-700">현금</span>
              <span class="text-xs font-bold text-gray-400">{{ cashPercentage }}%</span>
            </div>
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
            profitRate > 0 ? 'text-red-600' : profitRate < 0 ? 'text-blue-600' : 'text-gray-500'
          "
        >
          {{ profitRate > 0 ? '+' : '' }}{{ profitRate }}%
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'
import axios from 'axios'

const router = useRouter()

// 상태 관리
const loading = ref(false)
const showChargeModal = ref(false)
const chargeCreditInput = ref(0)

// 사용자 데이터
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
const recentTransactions = ref([])

// 포트폴리오 차트 관련
const portfolioChart = ref(null)
const chartColors = ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#9AA0A6']

// computed 속성들
const stockValue = computed(() => {
  return holdingsData.value.reduce((total, holding) => {
    return total + (holding.currentValue || 0)
  }, 0)
})

const profitRate = computed(() => {
  return userAccount.value.profitRate || 0
})

const cashPercentage = computed(() => {
  if (userAccount.value.totalAssetValue === 0) return 100
  return Math.round((userAccount.value.currentBalance / userAccount.value.totalAssetValue) * 100)
})

// 크레딧 입력값 검증
watch(chargeCreditInput, (val) => {
  if (val > userCredit.value) chargeCreditInput.value = userCredit.value
})

// 메서드들
const goBack = () => {
  router.back()
}

const goHoldingsPage = () => {
  router.push('/mock-trading/holdings')
}

const goTransactionsPage = () => {
  router.push('/mock-trading/transactions')
}

const onChargeNext = async () => {
  try {
    const response = await axios.post('/api/mocktrading/charge-credit', {
      creditAmount: chargeCreditInput.value, // userId 제거
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
    showChargeModal.value = false
    chargeCreditInput.value = 0
  }
}

const loadUserAccount = async () => {
  try {
    const response = await axios.get('/api/mocktrading/account') // userId 제거

    if (response.data) {
      userAccount.value = response.data
    }
  } catch (error) {
    console.error('계좌 정보 로드 실패:', error)
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
    }
  }
}

// 사용자 크레딧 로드
const loadUserCredit = async () => {
  try {
    const response = await axios.get(`/api/learning/user/credit/`)

    if (response.data) {
      userCredit.value = response.data.totalCredit || 0
    }
  } catch (error) {
    console.error('크레딧 정보 로드 실패:', error)
    userCredit.value = 0
  }
}

const loadHoldings = async () => {
  try {
    const response = await axios.get('/api/mocktrading/holdings')

    if (response.data && Array.isArray(response.data)) {
      holdingsData.value = response.data.map((holding, index) => ({
        ...holding,
        percentage:
          userAccount.value.totalAssetValue > 0
            ? Math.round((holding.currentValue / userAccount.value.totalAssetValue) * 100)
            : 0,
      }))

      updatePortfolioChart()
    }
  } catch (error) {
    console.error('보유 종목 로드 실패:', error)
    holdingsData.value = []
  }
}

const loadRecentTransactions = async () => {
  try {
    const response = await axios.get('/api/mocktrading/transactions?limit=5')

    if (response.data && Array.isArray(response.data)) {
      recentTransactions.value = response.data
    }
  } catch (error) {
    console.error('거래 내역 로드 실패:', error)
    recentTransactions.value = []
  }
}

const updatePortfolioChart = () => {
  if (!portfolioChart.value) return

  const ctx = portfolioChart.value.getContext('2d')
  const centerX = portfolioChart.value.width / 2
  const centerY = portfolioChart.value.height / 2
  const radius = Math.min(centerX, centerY) - 10

  // 캔버스 초기화
  ctx.clearRect(0, 0, portfolioChart.value.width, portfolioChart.value.height)

  if (holdingsData.value.length === 0) {
    // 보유 종목이 없을 때 전체를 현금으로 표시
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()
    return
  }

  let currentAngle = -Math.PI / 2 // 12시 방향부터 시작

  // 보유 종목들 그리기
  holdingsData.value.forEach((holding, index) => {
    if (holding.percentage > 0) {
      const sliceAngle = (holding.percentage / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = chartColors[index % chartColors.length]
      ctx.fill()

      currentAngle += sliceAngle
    }
  })

  // 현금 비율 그리기
  if (cashPercentage.value > 0) {
    const cashAngle = (cashPercentage.value / 100) * 2 * Math.PI

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + cashAngle)
    ctx.closePath()
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()
  }
}

// 대시보드 API를 사용한 통합 데이터 로드 (세션 기반)
const loadUserData = async () => {
  loading.value = true
  try {
    // ✅ URL에서 userId 제거 - 세션에서 자동으로 가져옴
    const [dashboardResponse, creditResponse] = await Promise.all([
      axios.get('/api/mocktrading/dashboard'), // userId 제거!
      axios.get('/api/user/credit'), // 크레딧도 세션 기반으로 변경 필요
    ])

    if (dashboardResponse.data) {
      const dashboard = dashboardResponse.data

      // 계좌 정보 설정
      if (dashboard.account) {
        userAccount.value = dashboard.account
      }

      // 보유 종목 정보 설정
      if (dashboard.holdings && Array.isArray(dashboard.holdings)) {
        holdingsData.value = dashboard.holdings.map((holding, index) => ({
          ...holding,
          percentage:
            dashboard.statistics?.stockPercentage > 0
              ? Math.round(
                  (holding.currentValue / (dashboard.statistics.totalStockValue || 1)) *
                    dashboard.statistics.stockPercentage,
                )
              : 0,
        }))
      }

      // 최근 거래 내역 설정
      if (dashboard.recentTransactions && Array.isArray(dashboard.recentTransactions)) {
        recentTransactions.value = dashboard.recentTransactions
      }
    }

    // 크레딧 정보 설정
    if (creditResponse.data) {
      userCredit.value = creditResponse.data.totalCredit || 0
    }

    // 차트 업데이트
    updatePortfolioChart()
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error)

    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
      return
    }

    // 에러 발생 시 개별 API 호출로 fallback
    try {
      await Promise.all([
        loadUserAccount(),
        loadUserCredit(),
        loadHoldings(),
        loadRecentTransactions(),
      ])
    } catch (fallbackError) {
      console.error('Fallback 데이터 로드도 실패:', fallbackError)
    }
  } finally {
    loading.value = false
  }
}

// 데이터 새로고침
const refreshData = async () => {
  await loadUserData()
}

// 컴포넌트 마운트 시 로그인 체크 제거 (세션 기반이므로)
onMounted(async () => {
  // Canvas 크기 설정
  if (portfolioChart.value) {
    portfolioChart.value.width = 180
    portfolioChart.value.height = 180
  }

  // 데이터 로드 (세션에서 자동으로 사용자 확인)
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
</style>
