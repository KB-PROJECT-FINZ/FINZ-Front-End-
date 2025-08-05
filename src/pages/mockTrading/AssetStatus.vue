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
        :disabled="!dataLoaded"
      >
        <span :class="{ 'animate-spin': !dataLoaded }">&#8635;</span>
      </button>
    </header>

    <!-- 계좌번호 + 총 자산 & 충전 버튼 -->
    <section class="flex items-center justify-between gap-6 mt-5 px-8 py-4">
      <!-- 로딩 중일 때 스켈레톤 UI -->
      <div v-if="!dataLoaded" class="flex flex-col justify-center flex-1">
        <div class="w-48 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div class="w-full h-px bg-gray-200 my-0"></div>
        <div class="w-32 h-6 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>

      <!-- 실제 데이터 -->
      <div v-else class="flex flex-col justify-center">
        <div class="text-sm text-gray-400 font-normal mb-0">
          FINZ증권 {{ userAccount.accountNumber || '계좌번호 로딩중...' }}
        </div>
        <div class="w-full h-px bg-gray-200 my-0"></div>
        <div class="flex items-baseline gap-2">
          <div class="text-xl font-bold text-gray-900">
            {{ safeNumber(userAccount.totalAssetValue).toLocaleString() }}원
          </div>
        </div>
      </div>

      <button
        class="rounded-lg px-5 h-11 font-semibold text-base ml-3 flex items-center transition-colors"
        :class="
          !dataLoaded ? 'bg-gray-200 animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-700'
        "
        @click="showChargeModal = true"
        :disabled="!dataLoaded"
      >
        <span v-if="dataLoaded">충전하기</span>
      </button>
    </section>

    <!-- 크레딧 충전 모달-->
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
          <span class="font-bold text-gray-700">{{ safeNumber(userCredit) }}P</span>
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
            (safeNumber(chargeCreditInput) * 1000).toLocaleString()
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
        <!-- 차트 로딩 중일 때 스켈레톤 -->
        <div
          v-show="!dataLoaded"
          class="w-[320px] h-[180px] mb-5 bg-gray-200 rounded-full animate-pulse flex items-center justify-center"
          style="max-width: 320px; width: 320px; height: 180px"
        >
          <div class="bg-white rounded-full" style="width: 192px; height: 108px"></div>
        </div>

        <!-- 실제 차트 -->
        <div v-show="dataLoaded" class="flex flex-col items-center">
          <canvas
            ref="portfolioChart"
            class="w-[320px] h-[180px] mb-5"
            style="max-width: 320px; width: 320px; height: 180px"
          ></canvas>

          <!-- 차트 툴팁 -->
          <div
            v-if="chartTooltip && chartTooltip.show"
            :style="{
              position: 'fixed',
              left: chartTooltip.x + 12 + 'px',
              top: chartTooltip.y - 10 + 'px',
              background: '#fff',
              color: '#222',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '8px 14px',
              zIndex: 2000,
              pointerEvents: 'none',
              minWidth: '120px',
            }"
          >
            <div class="flex items-center gap-2 mb-1">
              <span
                class="inline-block w-3 h-3 rounded"
                :style="{ backgroundColor: chartTooltip.color }"
              ></span>
              <span class="font-semibold text-sm">{{ chartTooltip.label }}</span>
            </div>
            <div class="text-xs text-gray-700">
              {{ chartTooltip.value }}원 ({{ chartTooltip.percent }}%)
            </div>
          </div>

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
                <span class="text-xs font-bold text-gray-400"
                  >{{ portfolioPercentages.cash }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="w-full h-px bg-gray-200 mx-auto" />

    <!-- 주문 가능 금액 -->
    <section class="flex flex-col items-start w-full mt-4 mb-0 px-6">
      <div class="text-base text-gray-500 font-normal">주문 가능 금액</div>
      <div v-if="!dataLoaded" class="w-32 h-6 bg-gray-200 rounded animate-pulse ml-1 mt-1"></div>
      <div v-else class="text-lg font-bold text-gray-900 mt-1">
        {{ safeNumber(userAccount.currentBalance).toLocaleString() }}원
      </div>
    </section>

    <!-- 투자 중인 금액 & 수익률 -->
    <section class="flex flex-col items-start w-full mt-0 mb-0 py-3 px-6">
      <div class="text-base text-gray-500 font-normal">투자 중인 금액</div>
      <div v-if="!dataLoaded" class="flex items-center gap-2 mt-1 ml-1">
        <div class="w-28 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div class="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div v-else class="flex items-center gap-2 mt-1">
        <div class="text-lg font-bold text-gray-900">{{ stockValue.toLocaleString() }}원</div>
        <span
          v-if="
            calculatedProfitRate !== null &&
            calculatedProfitRate !== undefined &&
            calculatedProfitRate !== 0 &&
            totalInvestment > 0
          "
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
        <span v-else class="font-bold text-lg ml-2 text-gray-400">계산 중...</span>
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

    <!-- 충전 중일 때만 로딩 오버레이 표시 -->
    <div
      v-if="chargingLoading"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white"
    >
      <div
        class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"
      ></div>
      <p>크레딧 충전 중...</p>
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
const showChargeModal = ref(false)
const chargeCreditInput = ref(0)
const dataLoaded = ref(false)
const chargingLoading = ref(false)

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
const chartTooltip = ref({ show: false, x: 0, y: 0, label: '', value: '', percent: '', color: '' })
let chartSegments = [] // 각 영역의 각도 범위와 정보 저장
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

// Canvas 이벤트 리스너 설정 함수
const setupCanvasEvents = () => {
  if (portfolioChart.value) {
    portfolioChart.value.removeEventListener('mousemove', handleChartMouseMove)
    portfolioChart.value.removeEventListener('mouseleave', handleChartMouseLeave)

    portfolioChart.value.addEventListener('mousemove', handleChartMouseMove)
    portfolioChart.value.addEventListener('mouseleave', handleChartMouseLeave)

    console.log('Canvas 이벤트 리스너 등록 완료')

  } else {
    console.error('❌ Canvas 요소를 찾을 수 없음')
  }
}

// null 값을 안전하게 처리하는 헬퍼 함수
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue
  }
  return Number(value)
}

// ===== Computed Properties =====
const stockValue = computed(() => {
  return holdingsData.value.reduce((total, holding) => {
    return total + safeNumber(holding.currentValue, 0)
  }, 0)
})

const totalInvestment = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + safeNumber(holding.averagePrice, 0) * safeNumber(holding.quantity, 0)
  }, 0)
})

const totalProfitLoss = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + safeNumber(holding.profitLoss, 0)
  }, 0)
})

const calculatedProfitRate = computed(() => {
  if (totalInvestment.value === 0) return 0
  return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
})

const portfolioPercentages = computed(() => {
  if (!dataLoaded.value) {
    return {
      holdings: [],
      cash: 100,
    }
  }

  // 유효한 보유 종목들만 필터링
  const validHoldings = holdingsData.value.filter(
    (holding) => safeNumber(holding.currentValue, 0) > 0,
  )

  // 총 자산 계산: 현금 + 유효한 보유 종목의 총 가치
  const totalStockValue = validHoldings.reduce(
    (sum, holding) => sum + safeNumber(holding.currentValue, 0),
    0,
  )
  const totalAsset = safeNumber(userAccount.value.currentBalance, 0) + totalStockValue

  if (totalAsset === 0) {
    return {
      holdings: [],
      cash: 100,
    }
  }

  const holdingPercentages = validHoldings.map((holding) => {
    const exactPercentage = (safeNumber(holding.currentValue, 0) / totalAsset) * 100
    return {
      ...holding,
      exactPercentage,
      percentage: Math.round(exactPercentage),
    }
  })

  // 0% 종목들을 제거
  const nonZeroHoldings = holdingPercentages.filter((holding) => holding.percentage > 0)

  const stockTotalExact = nonZeroHoldings.reduce((sum, h) => sum + h.exactPercentage, 0)
  let cashDisplayPercentage = Math.round(100 - stockTotalExact)

  const totalDisplayPercentage =
    nonZeroHoldings.reduce((sum, h) => sum + h.percentage, 0) + cashDisplayPercentage

  if (totalDisplayPercentage !== 100) {
    const difference = 100 - totalDisplayPercentage

    if (nonZeroHoldings.length > 0) {
      const largestHolding = nonZeroHoldings.reduce((max, current) =>
        current.exactPercentage > max.exactPercentage ? current : max,
      )
      largestHolding.percentage += difference
    } else {
      cashDisplayPercentage += difference
    }
  }

  return {
    holdings: nonZeroHoldings, // 0%가 아닌 종목들만 반환
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

// 크레딧 충전 (개별 로딩 상태)
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
    chargingLoading.value = true
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
    chargingLoading.value = false
    showChargeModal.value = false
    chargeCreditInput.value = 0
  }
}

const handleChartMouseMove = (e) => {
  if (!portfolioChart.value) {
    console.log('❌ Canvas 요소 없음')
    return
  }

  if (chartSegments.length === 0) {
    console.log('❌ 차트 세그먼트 없음')
    return
  }

  const rect = portfolioChart.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = portfolioChart.value.width / 2
  const centerY = portfolioChart.value.height / 2
  const dx = x - centerX
  const dy = y - centerY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const radius = Math.min(centerX, centerY) - 10
  const holeRadius = radius * 0.6

  // 도넛 구멍이나 바깥 영역이면 툴팁 숨기기
  if (distance < holeRadius || distance > radius) {
    chartTooltip.value.show = false
    return
  }

  // 각도 계산 및 정규화
  let angle = Math.atan2(dy, dx)
  angle = angle + Math.PI / 2
  if (angle < 0) {
    angle += 2 * Math.PI
  }
  if (angle >= 2 * Math.PI) {
    angle -= 2 * Math.PI
  }

  // 각 영역 확인
  for (let i = 0; i < chartSegments.length; i++) {
    const seg = chartSegments[i]
    let segStart = seg.start
    let segEnd = seg.end

    // 세그먼트가 0도를 지나는 경우 처리
    if (segEnd < segStart) {
      if (angle >= segStart || angle < segEnd) {
        chartTooltip.value = {
          show: true,
          x: x + rect.left,
          y: y + rect.top,
          label: seg.label,
          value: seg.value.toLocaleString(),
          percent: seg.percent,
          color: seg.color,
        }
        return
      }
    } else {
      // 일반적인 경우
      if (angle >= segStart && angle < segEnd) {
        chartTooltip.value = {
          show: true,
          x: x + rect.left,
          y: y + rect.top,
          label: seg.label,
          value: seg.value.toLocaleString(),
          percent: seg.percent,
          color: seg.color,
        }
        return
      }
    }
  }

  console.log('❌ 매치되는 세그먼트 없음')
  chartTooltip.value.show = false
}

const handleChartMouseLeave = () => {
  chartTooltip.value.show = false
}

// 차트 업데이트 함수
const updatePortfolioChart = () => {
  if (!portfolioChart.value) {
    console.log('❌ 차트 캔버스가 없음')
    return
  }

  // Canvas 크기 설정
  portfolioChart.value.width = 320
  portfolioChart.value.height = 180

  const ctx = portfolioChart.value.getContext('2d')
  const centerX = portfolioChart.value.width / 2
  const centerY = portfolioChart.value.height / 2
  const radius = Math.min(centerX, centerY) - 10
  const holeRadius = radius * 0.6

  // 캔버스 초기화
  ctx.clearRect(0, 0, portfolioChart.value.width, portfolioChart.value.height)

  const { holdings, cash } = portfolioPercentages.value
  chartSegments = []

  if (holdings.length === 0 && cash === 100) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 도넛 구멍 그리기
    ctx.beginPath()
    ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()

    // 현금 100% 영역 정보 저장
    chartSegments.push({
      start: 0,
      end: 2 * Math.PI,
      label: '현금',
      value: safeNumber(userAccount.value.currentBalance, 0),
      percent: 100,
      color: '#E5E7EB',
    })

    // 이벤트 리스너 설정
    setupCanvasEvents()
    return
  }

  let currentAngle = -Math.PI / 2

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

      // 각 영역 정보 저장 (정규화된 각도로 저장)
      let normalizedStart = currentAngle + Math.PI / 2
      let normalizedEnd = currentAngle + sliceAngle + Math.PI / 2

      // 0 ~ 2π 범위로 정규화
      if (normalizedStart < 0) normalizedStart += 2 * Math.PI
      if (normalizedEnd < 0) normalizedEnd += 2 * Math.PI
      if (normalizedStart >= 2 * Math.PI) normalizedStart -= 2 * Math.PI
      if (normalizedEnd >= 2 * Math.PI) normalizedEnd -= 2 * Math.PI

      chartSegments.push({
        start: normalizedStart,
        end: normalizedEnd,
        label: holding.stockName,
        value: safeNumber(holding.currentValue, 0),
        percent: holding.percentage,
        color: chartColors[index % chartColors.length],
      })

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

    // 현금 영역 정보 저장
    let normalizedStart = currentAngle + Math.PI / 2
    let normalizedEnd = currentAngle + cashAngle + Math.PI / 2

    // 0 ~ 2π 범위로 정규화
    if (normalizedStart < 0) normalizedStart += 2 * Math.PI
    if (normalizedEnd < 0) normalizedEnd += 2 * Math.PI
    if (normalizedStart >= 2 * Math.PI) normalizedStart -= 2 * Math.PI
    if (normalizedEnd >= 2 * Math.PI) normalizedEnd -= 2 * Math.PI

    chartSegments.push({
      start: normalizedStart,
      end: normalizedEnd,
      label: '현금',
      value: safeNumber(userAccount.value.currentBalance, 0),
      percent: cash,
      color: '#E5E7EB',
    })
  }

  // 도넛 구멍 그리기
  ctx.beginPath()
  ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()

  // 차트 그리기 완료 후 이벤트 리스너 설정
  setupCanvasEvents()
}

// dataLoaded가 true가 될 때 Canvas 이벤트 설정
watch(dataLoaded, (newValue) => {
  if (newValue) {
    nextTick(() => {
      setupCanvasEvents()
    })
  }
})

// 배치로 여러 종목의 실시간 가격을 한번에 조회하는 함수
const fetchMultipleStockPrices = async (stockCodes) => {
  try {
    const codesString = stockCodes.join(',')
    const response = await axios.get(`/api/stock/prices/${codesString}`)

    if (response.data && response.data.success) {
      console.log(`배치 가격 조회 완료`)

      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('⚠️ 일부 종목 조회 실패:', response.data.errors)
      }

      return response.data.data
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('❌ 배치 주식 가격 조회 실패:', error)
    return null
  }
}

// 보유 종목 실시간 가격 업데이트 함수
const updateHoldingsWithRealTimePrice = async (holdings) => {
  if (holdings.length === 0) return holdings

  // 모든 종목코드 추출
  const stockCodes = holdings.map((holding) => holding.stockCode)

  // 배치로 모든 종목의 가격을 한번에 조회
  const pricesData = await fetchMultipleStockPrices(stockCodes)

  if (!pricesData) {
    console.warn('⚠️ 배치 가격 조회 실패, 기존 데이터 유지')
    return holdings
  }

  const updatedHoldings = holdings.map((holding) => {
    const priceInfo = pricesData[holding.stockCode]

    if (priceInfo && priceInfo.output) {
      const output = priceInfo.output
      const currentPrice = parseInt(output.stck_prpr)

      // 현재 시세로 현재 가치 및 손익 재계산
      const totalValue = holding.quantity * currentPrice
      const totalInvestment = holding.quantity * holding.averagePrice
      const profitLoss = totalValue - totalInvestment
      const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

      return {
        ...holding,
        currentPrice: currentPrice,
        currentValue: totalValue,
        profitLoss: profitLoss,
        profitRate: Number(profitRate.toFixed(2)),
        priceChange: parseInt(output.prdy_vrss),
        changeRate: parseFloat(output.prdy_ctrt),
        changeSign: output.prdy_vrss_sign,
      }
    } else {
      // 해당 종목의 가격 조회 실패 시 기존 데이터 유지
      console.warn(`⚠️ ${holding.stockCode} 가격 조회 실패, 기존 데이터 유지`)
      return holding
    }
  })

  return updatedHoldings
}

// 데이터 로딩 함수
const loadUserData = async () => {
  dataLoaded.value = false // 로딩 시작

  try {
    // ===== 1단계: 계좌 정보 먼저 로드 =====
    const accountResponse = await axios.get('/api/mocktrading/account')

    if (accountResponse.data) {
      userAccount.value = {
        accountId: accountResponse.data.accountId,
        accountNumber: accountResponse.data.accountNumber || '',
        currentBalance: safeNumber(accountResponse.data.currentBalance, 0),
        totalAssetValue: safeNumber(accountResponse.data.totalAssetValue, 0),
        totalProfitLoss: safeNumber(accountResponse.data.totalProfitLoss, 0),
        profitRate: safeNumber(accountResponse.data.profitRate, 0),
      }
    } else {
      throw new Error('계좌 정보를 불러올 수 없습니다.')
    }

    // ===== 2단계: 보유 종목 정보 로드 =====
    const holdingsResponse = await axios.get('/api/mocktrading/holdings')

    if (holdingsResponse.data && Array.isArray(holdingsResponse.data)) {
      // 기본 보유 종목 데이터 정리 - null 값 안전 처리
      const basicHoldings = holdingsResponse.data.map((holding) => ({
        stockCode: holding.stockCode,
        stockName: holding.stockName,
        quantity: safeNumber(holding.quantity, 0),
        averagePrice: safeNumber(holding.averagePrice, 0),
        currentPrice: safeNumber(holding.currentPrice, 0),
        currentValue: safeNumber(holding.currentValue, 0),
        profitLoss: safeNumber(holding.profitLoss, 0),
        profitRate: safeNumber(holding.profitRate, 0),
      }))

      // 배치로 실시간 가격 업데이트
      holdingsData.value = await updateHoldingsWithRealTimePrice(basicHoldings)
      console.log('배치 실시간 가격 업데이트 완료')
    } else {
      holdingsData.value = []
      console.log('📝 보유 종목 없음')
    }

    // ===== 3단계: 크레딧 로드 (백그라운드로 실행) =====
    const creditResponse = await axios.get('/api/mocktrading/user/credit')

    // 크레딧 정보 설정
    if (creditResponse.data) {
      userCredit.value = safeNumber(creditResponse.data.totalCredit, 0)
    }

    // ===== 4단계: 모든 데이터 로드 완료 후 상태 업데이트 =====
    dataLoaded.value = true
    // nextTick을 사용하여 DOM 업데이트 후 차트 그리기
    await nextTick()
    updatePortfolioChart()

    userAccount.value.totalAssetValue = userAccount.value.currentBalance + stockValue.value
  } catch (error) {
    console.error('❌ 사용자 데이터 로드 실패:', error)
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
      router.push('/login-form')
      return
    }
    dataLoaded.value = true // 에러가 나도 로딩은 완료로 처리
  }
}

// 데이터 새로고침
const refreshData = async () => {
  await loadUserData()
}

onMounted(async () => {
  await loadUserData()
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (portfolioChart.value) {
    portfolioChart.value.removeEventListener('mousemove', handleChartMouseMove)
    portfolioChart.value.removeEventListener('mouseleave', handleChartMouseLeave)
  }
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
