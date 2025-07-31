<template>
  <div class="min-h-[100vh] pb-20 bg-white">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
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
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">거래 내역</span>
      <button
        class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        @click="refreshData"
      >
        &#8635;
      </button>
    </header>

    <!-- 필터 및 기간 선택 -->
    <section class="bg-white mx-4 mt-4 p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-base font-semibold text-gray-900">거래 내역 조회</h3>
        <span class="text-sm text-gray-500">총 {{ filteredTransactions.length }}건</span>
      </div>

      <!-- 기간 선택: ChartPage.vue 스타일(드롭다운 모달) -->
      <div class="mb-3">
        <button
          @click="showPeriodModal = true"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-gray-100 text-gray-900"
        >
          <span>{{ getSelectedPeriodLabel() }}</span>
          <svg
            class="w-4 h-4 ml-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <!-- 기간 선택 모달 -->
        <div
          v-if="showPeriodModal"
          class="fixed inset-0 bg-transparent z-50 flex items-end"
          @click="showPeriodModal = false"
        >
          <div
            class="bg-white w-full rounded-t-2xl p-4 pb-18"
            :class="!isModalDragging ? 'transition-transform duration-200' : ''"
            :style="{ transform: `translateY(${modalDragOffset}px)` }"
            @click.stop
            @mousedown="onModalDragStart"
            @touchstart="onModalDragStart"
            @mousemove="onModalDragMove"
            @touchmove="onModalDragMove"
            @mouseup="onModalDragEnd"
            @mouseleave="onModalDragEnd"
            @touchend="onModalDragEnd"
          >
            <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"></div>
            <h3 class="text-lg font-semibold mb-4">기간 선택</h3>
            <div class="space-y-2">
              <button
                v-for="period in periodOptions"
                :key="period.key"
                @click="selectPeriod(period.key)"
                class="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
                :class="currentPeriod === period.key ? 'bg-gray-100' : ''"
              >
                <span class="text-gray-900">{{ period.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 거래 타입 필터 제거 -->
    </section>

    <!-- 거래 통계(이번 달 거래 요약) 섹션 제거 -->

    <!-- 거래 내역 리스트 -->
    <section class="mx-4 mt-4 space-y-3">
      <div v-for="transaction in visibleTransactions" :key="transaction.id" class="bg-white p-4">
        <!-- 새 카드 레이아웃: 왼쪽 날짜, 가운데 종목명, 오른쪽 체결단가 -->
        <div class="flex items-center justify-between mb-1">
          <!-- 날짜 -->
          <div class="flex-shrink-0 w-10 text-left">
            <div class="text-xs text-gray-400">{{ formatDateOnly(transaction.executedAt) }}</div>
          </div>
          <!-- 종목명 및 상태 + 이미지 -->
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="
                  getStockImageUrl(transaction.stockCode) && !imageErrors[transaction.stockCode]
                "
                :src="getStockImageUrl(transaction.stockCode)"
                :alt="`${transaction.stockName} 로고`"
                class="w-full h-full object-cover rounded-full"
                @error="handleImageError(transaction.stockCode)"
              />
              <span
                v-else
                class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                style="border-color: #2272eb; color: #2272eb; background: #fff"
              >
                {{ getStockInitial(transaction.stockName) }}
              </span>
            </span>
            <div class="flex-1 min-w-0">
              <div
                class="text-base font-semibold truncate"
                :class="transaction.status === 'CANCELLED' ? 'text-gray-400' : 'text-gray-900'"
              >
                {{ transaction.stockName }}
              </div>
              <div
                class="text-xs mt-1"
                :class="
                  transaction.status === 'CANCELLED'
                    ? 'text-gray-400'
                    : [
                        getStatusClass(transaction.status, transaction.type),
                        transaction.type === 'BUY'
                          ? 'text-red-600'
                          : transaction.type === 'SELL'
                            ? 'text-blue-600'
                            : '',
                      ]
                "
              >
                {{ getTransactionStatusText(transaction) }}
              </div>
            </div>
          </div>
          <!-- 체결단가 -->
          <div class="flex-shrink-0 text-right">
            <div v-if="transaction.status !== 'CANCELLED'" class="text-sm text-gray-900">
              주당 {{ transaction.price.toLocaleString() }}원
            </div>
            <div v-else class="text-sm text-gray-400">
              <!-- 취소건은 연한 회색으로 빈 영역 유지 -->
              &nbsp;
            </div>
          </div>
        </div>

        <!-- 수량/유형/현재가/평가손익 영역 제거 -->
      </div>

      <!-- 더보기 버튼 -->
      <button
        v-if="!showAll && filteredTransactions.length > itemsPerPage"
        class="block w-full py-3 bg-gray-100 text-gray-800 border-none border-t border-gray-200 text-[14px] font-medium cursor-pointer transition-colors hover:bg-gray-200 mt-2"
        @click="showAll = true"
      >
        더보기
      </button>
    </section>

    <!-- 빈 상태 -->
    <div
      v-if="filteredTransactions.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <div class="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
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
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white"
    >
      <div
        class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"
      ></div>
      <p>거래 내역을 불러오는 중...</p>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
// 날짜(월/일)만 포맷 (7.20 형식, 앞자리 0 제거)
function formatDateOnly(date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

// 거래 상태 텍스트 (n주 구매 완료/취소/판매 실패 등)
function getTransactionStatusText(transaction) {
  const n = transaction.quantity
  if (transaction.type === 'BUY') {
    if (transaction.status === 'COMPLETED') return `${n}주 구매 완료`
    if (transaction.status === 'CANCELLED') return `${n}주 구매 취소`
    if (transaction.status === 'PENDING') return `${n}주 구매 대기중`
    return `${n}주 구매 ${getStatusText(transaction.status)}`
  } else if (transaction.type === 'SELL') {
    if (transaction.status === 'COMPLETED') return `${n}주 판매 완료`
    if (transaction.status === 'CANCELLED') return `${n}주 판매 취소`
    if (transaction.status === 'PENDING') return `${n}주 판매 대기중`
    return `${n}주 판매 ${getStatusText(transaction.status)}`
  }
  return `${n}주 ${getStatusText(transaction.status)}`
}

// 상태별 텍스트 색상(구매/판매 실패 등 강조)
function getStatusClass(status, type) {
  if (status === 'COMPLETED') return type === 'BUY' ? 'text-green-700' : 'text-blue-700'
  if (status === 'CANCELLED') return 'text-red-600'
  if (status === 'PENDING') return 'text-yellow-600'
  return 'text-gray-600'
}
// ChartPage.vue 스타일: 드래그 다운 슬라이드 닫기 로직
const modalDragOffset = vueRef(0)
const isModalDragging = vueRef(false)
let dragStartY = null
let dragging = false

function getEventY(e) {
  if (e.touches && e.touches.length) return e.touches[0].clientY
  return e.clientY
}

function onModalDragStart(e) {
  dragging = true
  isModalDragging.value = true
  dragStartY = getEventY(e)
  document.body.style.userSelect = 'none'
}

function onModalDragMove(e) {
  if (!dragging) return
  const currentY = getEventY(e)
  const offset = currentY - dragStartY
  modalDragOffset.value = offset > 0 ? offset : 0
}

function onModalDragEnd() {
  if (!dragging) return
  dragging = false
  document.body.style.userSelect = ''
  if (modalDragOffset.value > 60) {
    showPeriodModal.value = false
    // 닫힐 때 트랜지션 적용
    isModalDragging.value = false
    modalDragOffset.value = 0
    return
  }
  // 복귀 애니메이션 적용
  isModalDragging.value = false
  // 복귀 트랜지션 후 위치 초기화
  setTimeout(() => {
    modalDragOffset.value = 0
  }, 200)
}
// ChartPage.vue 스타일 기간 선택 모달용 상태
import { ref as vueRef } from 'vue'
const showPeriodModal = vueRef(false)
// ChartPage.vue 스타일: 기간 라벨 반환
function getSelectedPeriodLabel() {
  const period = periodOptions.find((p) => p.key === currentPeriod.value)
  return period ? period.label : '기간 선택'
}

function selectPeriod(key) {
  currentPeriod.value = key
  showPeriodModal.value = false
  showAll.value = false
}
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'

const router = useRouter()
const loading = ref(false)
const currentPeriod = ref('1month') // 기본 기간: 1개월
// 거래 타입 필터 제거
const itemsPerPage = 10
const showAll = ref(false)

// 종목 이미지 에러 추적
const imageErrors = ref({})

// 종목명에서 이니셜 추출 (이미지 대체용)
const getStockInitial = (stockName) => {
  if (!stockName) return '?'
  // 한글 종목명의 경우 첫 글자 사용
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(stockName.charAt(0))) {
    return stockName.charAt(0)
  }
  // 영문의 경우 첫 두 글자 사용
  return stockName.substring(0, 2).toUpperCase()
}

// 이미지 로딩 에러 처리
const handleImageError = (stockCode) => {
  imageErrors.value[stockCode] = true
}

// 종목코드로 이미지 URL 반환 (Holdings.vue와 동일한 방식)
const stockImageMap = {
  '005930': 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005930.png',
  '000660': 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000660.png',
  '035420': 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035420.png',
  '035720': 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035720.png',
  // 필요시 추가
}
const getStockImageUrl = (stockCode) => stockImageMap[stockCode] || null

// 필터 옵션들
const periodOptions = [
  { key: '1week', label: '1주일' },
  { key: '1month', label: '1개월' },
  { key: '3month', label: '3개월' },
  { key: '6month', label: '6개월' },
  { key: '1year', label: '1년' },
]

// 거래 타입 필터 제거

// 거래 내역 더미 데이터 (2025-07-29 기준, 각 기간별 테스트가 잘 되도록 날짜 분포)
const transactionsData = ref([
  // 1주일 이내 (2025-07-23 ~ 2025-07-29)
  {
    id: 1,
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'BUY',
    quantity: 10,
    price: 80000,
    orderType: 'MARKET',
    totalAmount: 800000,
    executedAt: new Date('2025-07-20T10:00:00'),
    status: 'COMPLETED',
    currentHolding: { currentPrice: 80500, profitLoss: 5000, profitRate: 0.63 },
  },
  {
    id: 2,
    stockCode: '000660',
    stockName: 'SK하이닉스',
    type: 'SELL',
    quantity: 5,
    price: 130000,
    orderType: 'LIMIT',
    totalAmount: 650000,
    executedAt: new Date('2025-07-19T14:00:00'),
    status: 'COMPLETED',
  },
  // 구매취소 더미
  {
    id: 11,
    stockCode: '068270',
    stockName: '셀트리온',
    type: 'BUY',
    quantity: 4,
    price: 180000,
    orderType: 'LIMIT',
    totalAmount: 720000,
    executedAt: new Date('2025-07-18T13:00:00'),
    status: 'CANCELLED',
  },
  // 판매취소 더미
  {
    id: 12,
    stockCode: '207940',
    stockName: '삼성바이오로직스',
    type: 'SELL',
    quantity: 2,
    price: 700000,
    orderType: 'MARKET',
    totalAmount: 1400000,
    executedAt: new Date('2025-07-17T11:00:00'),
    status: 'CANCELLED',
  },
  // 1개월 이내 (2025-07-01 ~ 2025-07-22)
  {
    id: 3,
    stockCode: '035420',
    stockName: 'NAVER',
    type: 'BUY',
    quantity: 3,
    price: 200000,
    orderType: 'LIMIT',
    totalAmount: 600000,
    executedAt: new Date('2025-07-15T11:00:00'),
    status: 'COMPLETED',
    currentHolding: { currentPrice: 202000, profitLoss: 6000, profitRate: 1.0 },
  },
  {
    id: 4,
    stockCode: '035720',
    stockName: '카카오',
    type: 'BUY',
    quantity: 7,
    price: 60000,
    orderType: 'MARKET',
    totalAmount: 420000,
    executedAt: new Date('2025-07-05T09:30:00'),
    status: 'COMPLETED',
    currentHolding: { currentPrice: 59000, profitLoss: -7000, profitRate: -1.67 },
  },
  // 3개월 이내 (2025-05-01 ~ 2025-06-30)
  {
    id: 5,
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'SELL',
    quantity: 8,
    price: 81000,
    orderType: 'LIMIT',
    totalAmount: 648000,
    executedAt: new Date('2025-06-10T13:00:00'),
    status: 'COMPLETED',
  },
  {
    id: 6,
    stockCode: '000660',
    stockName: 'SK하이닉스',
    type: 'BUY',
    quantity: 4,
    price: 128000,
    orderType: 'MARKET',
    totalAmount: 512000,
    executedAt: new Date('2025-05-20T15:20:00'),
    status: 'COMPLETED',
    currentHolding: { currentPrice: 129000, profitLoss: 4000, profitRate: 0.78 },
  },
  // 6개월 이내 (2025-02-01 ~ 2025-04-30)
  {
    id: 7,
    stockCode: '051910',
    stockName: 'LG화학',
    type: 'BUY',
    quantity: 2,
    price: 450000,
    orderType: 'LIMIT',
    totalAmount: 900000,
    executedAt: new Date('2025-04-10T10:00:00'),
    status: 'CANCELLED',
  },
  {
    id: 8,
    stockCode: '035420',
    stockName: 'NAVER',
    type: 'SELL',
    quantity: 1,
    price: 210000,
    orderType: 'LIMIT',
    totalAmount: 210000,
    executedAt: new Date('2025-02-15T11:10:00'),
    status: 'COMPLETED',
  },
  // 1년 이내 (2024-07-30 ~ 2025-01-31)
  {
    id: 9,
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'BUY',
    quantity: 12,
    price: 77000,
    orderType: 'LIMIT',
    totalAmount: 924000,
    executedAt: new Date('2024-12-01T09:30:00'),
    status: 'COMPLETED',
    currentHolding: { currentPrice: 78000, profitLoss: 12000, profitRate: 1.3 },
  },
  {
    id: 10,
    stockCode: '000660',
    stockName: 'SK하이닉스',
    type: 'SELL',
    quantity: 6,
    price: 126000,
    orderType: 'MARKET',
    totalAmount: 756000,
    executedAt: new Date('2024-08-10T14:00:00'),
    status: 'COMPLETED',
  },
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

  filtered = filtered.filter((transaction) => new Date(transaction.executedAt) >= startDate)

  // 타입 필터
  // 타입 필터 제거

  // 최신순 정렬
  return filtered.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
})

// 더보기 방식으로 보여줄 거래내역
const visibleTransactions = computed(() => {
  return showAll.value
    ? filteredTransactions.value
    : filteredTransactions.value.slice(0, itemsPerPage)
})

const getStatusText = (status) => {
  switch (status) {
    case 'COMPLETED':
      return '체결완료'
    case 'CANCELLED':
      return '취소됨'
    case 'PENDING':
      return '대기중'
    default:
      return status
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
    await new Promise((resolve) => setTimeout(resolve, 1000))
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
