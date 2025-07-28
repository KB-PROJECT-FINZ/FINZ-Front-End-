<template>
  <div class="min-h-[100vh] pb-20 bg-gray-50">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">거래 내역</span>
      <button class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100" @click="refreshData">
        &#8635;
      </button>
    </header>

    <!-- 필터 및 기간 선택 -->
    <section class="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-base font-semibold text-gray-900">거래 내역 조회</h3>
        <span class="text-sm text-gray-500">총 {{ filteredTransactions.length }}건</span>
      </div>

      <!-- 기간 선택 -->
      <div class="flex gap-2 mb-3 overflow-x-auto pb-2">
        <button
          v-for="period in periodOptions"
          :key="period.key"
          @click="changePeriod(period.key)"
          class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
          :class="currentPeriod === period.key
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ period.label }}
        </button>
      </div>

      <!-- 거래 타입 필터 -->
      <div class="flex gap-2">
        <button
          v-for="type in typeOptions"
          :key="type.key"
          @click="changeType(type.key)"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          :class="currentType === type.key
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ type.label }}
        </button>
      </div>
    </section>

    <!-- 거래 통계 -->
    <section class="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
      <h3 class="text-base font-semibold text-gray-900 mb-3">이번 달 거래 요약</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">총 매수금액</span>
          <div class="font-bold text-red-600 mt-1">₩{{ totalBuyAmount.toLocaleString() }}</div>
        </div>
        <div>
          <span class="text-gray-500">총 매도금액</span>
          <div class="font-bold text-blue-600 mt-1">₩{{ totalSellAmount.toLocaleString() }}</div>
        </div>
        <div>
          <span class="text-gray-500">매수 횟수</span>
          <div class="font-bold text-gray-900 mt-1">{{ buyCount }}회</div>
        </div>
        <div>
          <span class="text-gray-500">매도 횟수</span>
          <div class="font-bold text-gray-900 mt-1">{{ sellCount }}회</div>
        </div>
      </div>
    </section>

    <!-- 거래 내역 리스트 -->
    <section class="mx-4 mt-4 space-y-3">
      <div
        v-for="transaction in paginatedTransactions"
        :key="transaction.id"
        class="bg-white rounded-xl p-4 shadow-sm"
      >
        <!-- 거래 기본 정보 -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-base font-semibold text-gray-900">{{ transaction.stockName }}</h4>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="transaction.type === 'BUY'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'"
              >
                {{ transaction.type === 'BUY' ? '매수' : '매도' }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ transaction.stockCode }}</p>
          </div>
          <div class="text-right">
            <div class="text-base font-bold text-gray-900">₩{{ transaction.totalAmount.toLocaleString() }}</div>
            <div class="text-sm text-gray-500">{{ formatDateTime(transaction.executedAt) }}</div>
          </div>
        </div>

        <!-- 거래 상세 정보 -->
        <div class="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-3">
          <div>
            <span class="text-gray-500">거래수량</span>
            <span class="ml-2 font-medium text-gray-900">{{ transaction.quantity }}주</span>
          </div>
          <div>
            <span class="text-gray-500">체결단가</span>
            <span class="ml-2 font-medium text-gray-900">₩{{ transaction.price.toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-gray-500">주문유형</span>
            <span class="ml-2 font-medium text-gray-900">
              {{ transaction.orderType === 'MARKET' ? '시장가' : '지정가' }}
            </span>
          </div>
          <div>
            <span class="text-gray-500">상태</span>
            <span
              class="ml-2 font-medium"
              :class="getStatusClass(transaction.status)"
            >
              {{ getStatusText(transaction.status) }}
            </span>
          </div>
        </div>

        <!-- 현재 평가 정보 (보유 중인 경우) -->
        <div v-if="transaction.type === 'BUY' && transaction.currentHolding" class="mt-3 pt-3 border-t border-gray-100">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">현재가</span>
              <span class="ml-2 font-medium text-gray-900">₩{{ transaction.currentHolding.currentPrice.toLocaleString() }}</span>
            </div>
            <div>
              <span class="text-gray-500">평가손익</span>
              <span
                class="ml-2 font-medium"
                :class="transaction.currentHolding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
              >
                {{ transaction.currentHolding.profitLoss >= 0 ? '+' : '' }}₩{{ Math.abs(transaction.currentHolding.profitLoss).toLocaleString() }}
                ({{ transaction.currentHolding.profitLoss >= 0 ? '+' : '' }}{{ transaction.currentHolding.profitRate }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          :class="currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
        >
          이전
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            class="w-8 h-8 rounded-lg text-sm font-medium transition-all"
            :class="currentPage === page
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          :class="currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
        >
          다음
        </button>
      </div>
    </section>

    <!-- 빈 상태 -->
    <div v-if="filteredTransactions.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-gray-500 text-center mb-4">선택한 기간의 거래 내역이 없습니다</p>
      <button
        @click="goToMockTrading"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        모의투자 시작하기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white">
      <div class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"></div>
      <p>거래 내역을 불러오는 중...</p>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'

const router = useRouter()
const loading = ref(false)
const currentPeriod = ref('1month') // 기본 기간: 1개월
const currentType = ref('all') // 기본 타입: 전체
const currentPage = ref(1)
const itemsPerPage = 10

// 필터 옵션들
const periodOptions = [
  { key: '1week', label: '1주일' },
  { key: '1month', label: '1개월' },
  { key: '3month', label: '3개월' },
  { key: '6month', label: '6개월' },
  { key: '1year', label: '1년' }
]

const typeOptions = [
  { key: 'all', label: '전체' },
  { key: 'BUY', label: '매수' },
  { key: 'SELL', label: '매도' }
]

// 거래 내역 더미 데이터 (실제로는 API에서 가져올 데이터)
const transactionsData = ref([
  {
    id: 1,
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'BUY',
    quantity: 50,
    price: 78000,
    orderType: 'MARKET',
    totalAmount: 3900000,
    executedAt: new Date('2025-01-27T14:30:00'),
    status: 'COMPLETED',
    currentHolding: {
      currentPrice: 78500,
      profitLoss: 25000,
      profitRate: 0.64
    }
  },
  {
    id: 2,
    stockCode: '000660',
    stockName: 'SK하이닉스',
    type: 'SELL',
    quantity: 20,
    price: 125000,
    orderType: 'LIMIT',
    totalAmount: 2500000,
    executedAt: new Date('2025-01-26T11:45:00'),
    status: 'COMPLETED'
  },
  {
    id: 3,
    stockCode: '035420',
    stockName: 'NAVER',
    type: 'BUY',
    quantity: 5,
    price: 190000,
    orderType: 'LIMIT',
    totalAmount: 950000,
    executedAt: new Date('2025-01-25T16:20:00'),
    status: 'COMPLETED',
    currentHolding: {
      currentPrice: 195000,
      profitLoss: 25000,
      profitRate: 2.63
    }
  },
  {
    id: 4,
    stockCode: '035720',
    stockName: '카카오',
    type: 'BUY',
    quantity: 15,
    price: 58000,
    orderType: 'MARKET',
    totalAmount: 870000,
    executedAt: new Date('2025-01-24T10:15:00'),
    status: 'COMPLETED',
    currentHolding: {
      currentPrice: 55000,
      profitLoss: -45000,
      profitRate: -5.17
    }
  },
  {
    id: 5,
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'BUY',
    quantity: 50,
    price: 75000,
    orderType: 'LIMIT',
    totalAmount: 3750000,
    executedAt: new Date('2025-01-23T09:30:00'),
    status: 'COMPLETED',
    currentHolding: {
      currentPrice: 78500,
      profitLoss: 175000,
      profitRate: 4.67
    }
  },
  {
    id: 6,
    stockCode: '000660',
    stockName: 'SK하이닉스',
    type: 'SELL',
    quantity: 30,
    price: 130000,
    orderType: 'MARKET',
    totalAmount: 3900000,
    executedAt: new Date('2025-01-22T13:45:00'),
    status: 'COMPLETED'
  },
  {
    id: 7,
    stockCode: '051910',
    stockName: 'LG화학',
    type: 'BUY',
    quantity: 10,
    price: 420000,
    orderType: 'LIMIT',
    totalAmount: 4200000,
    executedAt: new Date('2025-01-21T15:20:00'),
    status: 'CANCELLED'
  },
  {
    id: 8,
    stockCode: '035420',
    stockName: 'NAVER',
    type: 'SELL',
    quantity: 3,
    price: 185000,
    orderType: 'LIMIT',
    totalAmount: 555000,
    executedAt: new Date('2025-01-20T11:10:00'),
    status: 'COMPLETED'
  }
])

// 필터링된 거래 내역
const filteredTransactions = computed(() => {
  let filtered = [...transactionsData.value]

  // 기간 필터
  const now = new Date()
  let startDate = new Date()

  switch (currentPeriod.value) {
    case '1week':
      startDate.setDate(now.getDate() - 7)
      break
    case '1month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case '3month':
      startDate.setMonth(now.getMonth() - 3)
      break
    case '6month':
      startDate.setMonth(now.getMonth() - 6)
      break
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  filtered = filtered.filter(transaction => new Date(transaction.executedAt) >= startDate)

  // 타입 필터
  if (currentType.value !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === currentType.value)
  }

  // 최신순 정렬
  return filtered.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
})

// 페이지네이션 관련 계산된 속성들
const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const startPage = Math.max(1, currentPage.value - 2)
  const endPage = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// 통계 계산된 속성들
const totalBuyAmount = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'BUY' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.totalAmount, 0)
})

const totalSellAmount = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'SELL' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.totalAmount, 0)
})

const buyCount = computed(() => {
  return filteredTransactions.value.filter(t => t.type === 'BUY' && t.status === 'COMPLETED').length
})

const sellCount = computed(() => {
  return filteredTransactions.value.filter(t => t.type === 'SELL' && t.status === 'COMPLETED').length
})

// 메서드들
const goBack = () => {
  router.back()
}

const changePeriod = (period) => {
  currentPeriod.value = period
  currentPage.value = 1 // 페이지 초기화
}

const changeType = (type) => {
  currentType.value = type
  currentPage.value = 1 // 페이지 초기화
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getStatusText = (status) => {
  switch (status) {
    case 'COMPLETED': return '체결완료'
    case 'CANCELLED': return '취소됨'
    case 'PENDING': return '대기중'
    default: return status
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'COMPLETED': return 'text-green-600'
    case 'CANCELLED': return 'text-red-600'
    case 'PENDING': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

const goToMockTrading = () => {
  router.push('/mock-trading')
}

const refreshData = async () => {
  loading.value = true
  try {
    // 여기에 API 호출 로직 추가 예정
    console.log('거래 내역 데이터 새로고침')
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('거래 내역 데이터 새로고침 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('거래 내역 페이지 마운트됨')
  // 초기 데이터 로드 로직 추가 예정
})
</script>
