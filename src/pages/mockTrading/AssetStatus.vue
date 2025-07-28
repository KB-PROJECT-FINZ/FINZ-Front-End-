<template>
  <div class="asset-status-page">
    <!-- 상단 헤더 -->
    <header class="asset-header">
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
      <span class="header-title moved-title">나의 자산 현황</span>
      <button class="refresh-btn" @click="refreshData">&#8635;</button>
    </header>

    <!-- 계좌번호(작고 회색, 위) + 총 자산 & 채우기 버튼을 한 섹션에 -->
    <section class="account-total-section">
      <div class="account-total-info">
        <div class="account-label-small">FINZ증권 {{ '1234-5678-9012-34' }}</div>
        <div class="account-underline"></div>
        <div class="total-asset-row">
          <div class="total-asset-amount">₩ {{ totalAsset.toLocaleString() }}</div>
        </div>
      </div>
      <button class="fill-btn">채우기</button>
    </section>

    <!-- 포트폴리오 차트 -->
    <section class="portfolio-chart-section">
      <div class="chart-container">
        <canvas ref="portfolioChart" class="portfolio-canvas"></canvas>
        <div class="chart-legend">
          <div
            v-for="(holding, index) in holdingsData"
            :key="holding.stockCode"
            class="legend-item"
          >
            <div class="legend-color" :style="{ backgroundColor: chartColors[index] }"></div>
            <div class="legend-info">
              <span class="legend-name">{{ holding.stockName }}</span>
              <span class="legend-percentage">{{ holding.percentage }}%</span>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #e5e7eb"></div>
            <div class="legend-info">
              <span class="legend-name">현금</span>
              <span class="legend-percentage">{{ cashPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="section-divider"></div>

    <!-- 주문 가능 금액 (라벨 아래에 금액) -->
    <section class="orderable-section">
      <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%">
        <div class="orderable-label">주문 가능 금액</div>
        <div class="orderable-amount" style="margin-left: 4px">
          ₩ {{ currentBalance.toLocaleString() }}
        </div>
      </div>
    </section>

    <!-- 투자 중인 금액 & 수익률(%) -->
    <section class="investing-section">
      <div class="investing-item investing-item-col">
        <div class="investing-label">투자 중인 금액</div>
        <div
          style="display: flex; align-items: center; gap: 10px; margin-top: 4px; margin-left: 4px"
        >
          <div class="investing-amount">₩ {{ stockValue.toLocaleString() }}</div>
          <span
            class="investing-rate"
            :class="{ 'rate-positive': profitRate > 0, 'rate-negative': profitRate < 0 }"
            style="font-size: 1.1rem; font-weight: 700"
          >
            {{ profitRate > 0 ? '+' : '' }}{{ profitRate }}%
          </span>
        </div>
      </div>
    </section>
    <div class="section-divider"></div>

    <!-- 보유 종목 바로가기 -->
    <section class="link-section" style="margin-left: 35px">
      <button class="link-btn left-align-btn" @click="goHoldingsPage">
        보유 종목 전체 보기 &gt;
      </button>
    </section>
    <div class="section-divider"></div>

    <!-- 최근 거래 내역 바로가기 -->
    <section class="link-section" style="margin-left: 35px">
      <button class="link-btn left-align-btn" @click="goTransactionsPage">
        최근 거래 내역 전체 보기 &gt;
      </button>
    </section>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
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
  router.push('/mockTrading/holdings')
}
const goTransactionsPage = () => {
  router.push('/mockTrading/transactions')
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

<style scoped>
/* 섹션 구분선 */
.section-divider {
  width: calc(100% - 48px);
  height: 1px;
  background: #e5e7eb;
  margin: 0 auto 0 auto;
}
.asset-status-page {
  background: none;
  min-height: 100vh;
  padding-bottom: 80px;
}
.asset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 18px 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}
.chartpage-back-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  font-size: 1rem;
  color: #222;
  cursor: pointer;
  padding: 8px 12px 8px 4px;
  border-radius: 8px;
  transition: background 0.2s;
}
.chartpage-back-btn:hover {
  background: #f0f0f0;
}
.chartpage-back-btn svg {
  margin-right: 2px;
  vertical-align: middle;
}
.chartpage-back-btn span {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
}
.header-title.moved-title {
  margin-left: 12px;
  flex: 1;
  text-align: left;
}
.header-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}
.refresh-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}
.refresh-btn:hover {
  background: #f0f0f0;
}

/* 계좌번호(작고 회색, 위) + 총 자산 & 채우기 버튼을 한 섹션에 */
.account-total-section {
  margin: 18px 16px 0 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: none;
  border-radius: 0;
  box-shadow: none;
  border: none;
}
.account-total-info {
  display: flex;
  flex-direction: column;
  gap: 0px; /* 계좌번호와 총 자산 사이 간격을 더 줄임 */
  justify-content: center;
  height: 100%;
}
.account-label-small {
  font-size: 0.88rem;
  color: #9ca3af;
  margin-bottom: 0px;
  font-weight: 400;
}
.account-underline {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 0 0; /* 밑줄이 글씨에 딱 붙게 */
}
.total-asset-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.total-asset-label {
  font-size: 1rem;
  color: #6b7280;
}
.total-asset-label {
  font-size: 1rem;
  color: #6b7280;
}
.total-asset-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
}
.fill-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 12px;
  height: 44px; /* 버튼 높이 고정 */
  display: flex;
  align-items: center;
}
.fill-btn:hover {
  background: #2563eb;
}

/* 포트폴리오 차트 */
.portfolio-chart-section {
  margin: 18px 16px 0 16px;
}
.chart-container {
  background: none;
  border-radius: 0;
  padding: 24px 20px;
  box-shadow: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.portfolio-canvas {
  width: 180px !important;
  height: 180px !important;
  margin-bottom: 18px;
}
.chart-legend {
  width: 100%;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
.legend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}
.legend-name {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}
.legend-percentage {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

/* 주문 가능 금액 */
.orderable-section {
  margin: 0px 16px;
  padding: 20px 20px 5px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border-radius: 0;
  box-shadow: none;
  border: none;
}
.orderable-label {
  font-size: 1rem;
  color: #6b7280;
}
.orderable-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #222;
}

/* 투자 중인 금액 & 수익률 */
.investing-section {
  margin: 0px 16px;
  padding: 20px 20px;
  display: flex;
  gap: 0;
  justify-content: flex-start;
  align-items: center;
  background: none;
  border-radius: 0;
  box-shadow: none;
  border: none;
}
.investing-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.investing-item-col {
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}
.investing-label {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0;
}
.investing-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
}
.investing-rate {
  font-size: 1.1rem;
  font-weight: 700;
}
.rate-positive {
  color: #dc2626;
}
.rate-negative {
  color: #2563eb;
}

/* 바로가기 버튼 */
.link-section {
  margin: 10px 16px 10px 16px;
}
.link-btn {
  width: 100%;
  background: none;
  border: none;
  border-radius: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 0;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.link-btn:hover {
  background: #f3f4f6;
  border: none;
}
.left-align-btn {
  text-align: left !important;
  justify-content: flex-start;
  display: flex;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
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
