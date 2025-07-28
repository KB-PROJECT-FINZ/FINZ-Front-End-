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

    <!-- 계좌번호(작고 회색, 위) + 총 자산 & 채우기 버튼을 한 섹션에 -->
    <section class="flex items-center justify-between gap-6 mt-5 mx-4 px-5 py-4">
      <div class="flex flex-col justify-center">
        <div class="text-sm text-gray-400 font-normal mb-0">FINZ증권 {{ '1234-5678-9012-34' }}</div>
        <div class="w-full h-px bg-gray-200 my-0"></div>
        <div class="flex items-baseline gap-2">
          <div class="text-xl font-bold text-gray-900">₩ {{ totalAsset.toLocaleString() }}</div>
        </div>
      </div>
      <button
        class="bg-blue-500 text-white rounded-lg px-5 h-11 font-semibold text-base hover:bg-blue-700 ml-3 flex items-center"
      >
        채우기
      </button>
    </section>

    <!-- 포트폴리오 차트 -->
    <section class="mt-5 mx-4">
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
    <div class="w-[calc(100%-48px)] h-px bg-gray-200 mx-auto" />

    <!-- 주문 가능 금액 (라벨 아래에 금액) -->
    <section class="flex flex-col items-start w-full ml-9 mt-4 mb-0">
      <div class="text-base text-gray-500 font-normal">주문 가능 금액</div>
      <div class="text-lg font-bold text-gray-900 ml-1 mt-1">
        ₩ {{ currentBalance.toLocaleString() }}
      </div>
    </section>

    <!-- 투자 중인 금액 & 수익률(%) -->
    <section class="flex flex-col items-start w-full ml-9 mt-0 mb-0 py-3">
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
    <div class="w-[calc(100%-48px)] h-px bg-gray-200 mx-auto" />

    <!-- 보유 종목 바로가기 -->
    <section class="my-2 ml-9">
      <button
        class="w-full text-left text-base font-semibold text-gray-700 py-4 px-1 hover:bg-gray-100"
        @click="goHoldingsPage"
      >
        보유 종목 전체 보기 &gt;
      </button>
    </section>
    <div class="w-[calc(100%-48px)] h-px bg-gray-200 mx-auto" />

    <!-- 최근 거래 내역 바로가기 -->
    <section class="my-2 ml-9">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import FooterNavigation from '../../components/FooterNavigation.vue'

Chart.register(...registerables)

const router = useRouter()

const loading = ref(false)
const currentBalance = ref(5000000)
const stockValue = ref(7450000)
const initialInvestment = ref(10000000)

const portfolioChart = ref(null)
const chartInstance = ref(null)

const chartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

const holdingsData = ref([
  {
    stockCode: '005930',
    stockName: '삼성전자',
    quantity: 100,
    averagePrice: 75000,
    currentPrice: 78000,
    totalValue: 7800000,
    percentage: 52.4,
    profitLoss: 300000,
    profitRate: 4.0,
  },
  {
    stockCode: '000660',
    stockName: 'SK하이닉스',
    quantity: 50,
    averagePrice: 128000,
    currentPrice: 125000,
    totalValue: 6250000,
    percentage: 41.9,
    profitLoss: -150000,
    profitRate: -2.3,
  },
  {
    stockCode: '035420',
    stockName: 'NAVER',
    quantity: 5,
    averagePrice: 190000,
    currentPrice: 195000,
    totalValue: 975000,
    percentage: 6.5,
    profitLoss: 25000,
    profitRate: 2.6,
  },
])

const totalAsset = computed(() => currentBalance.value + stockValue.value)
const profitAmount = computed(() => totalAsset.value - initialInvestment.value)
const profitRate = computed(() => {
  if (initialInvestment.value === 0) return 0
  return Number(((profitAmount.value / initialInvestment.value) * 100).toFixed(2))
})
const cashPercentage = computed(() => {
  if (totalAsset.value === 0) return 0
  return Number(((currentBalance.value / totalAsset.value) * 100).toFixed(1))
})

const createPortfolioChart = () => {
  if (!portfolioChart.value) return
  const ctx = portfolioChart.value.getContext('2d')
  const labels = [...holdingsData.value.map((h) => h.stockName), '현금']
  const data = [...holdingsData.value.map((h) => h.percentage), cashPercentage.value]
  const colors = [...chartColors.slice(0, holdingsData.value.length), '#e5e7eb']

  chartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.parsed || 0
              return `${label}: ${value.toFixed(1)}%`
            },
          },
        },
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        duration: 1000,
      },
    },
  })
}

const goBack = () => {
  router.back()
}

const goHoldingsPage = () => {
  router.push('/mock-trading/holdings')
}

const goTransactionsPage = () => {
  router.push('/mock-trading/transactions')
}
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (chartInstance.value) {
      chartInstance.value.destroy()
      await nextTick()
      createPortfolioChart()
    }
  } catch (error) {
    console.error('자산 데이터 새로고침 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  createPortfolioChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>
