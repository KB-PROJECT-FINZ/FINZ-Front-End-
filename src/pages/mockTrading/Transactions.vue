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
                v-if="getStockImageUrl(transaction) && !imageErrors[transaction.stockCode]"
                :src="getStockImageUrl(transaction)"
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
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() {
  router.back()
}
import FooterNavigation from '../../components/FooterNavigation.vue'
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
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const currentPeriod = ref('1month') // 기본 기간: 1개월
const itemsPerPage = 10
const showAll = ref(false)
const imageErrors = ref({})

// 거래 데이터의 imageUrl 필드 우선 사용
const getStockImageUrl = (transaction) => {
  if (transaction.imageUrl) return transaction.imageUrl
  return null
}

const getStockInitial = (stockName) => {
  if (!stockName) return '?'
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(stockName.charAt(0))) {
    return stockName.charAt(0)
  }
  return stockName.substring(0, 1).toUpperCase()
}
const handleImageError = (stockCode) => {
  imageErrors.value[stockCode] = true
}
const periodOptions = [
  { key: '1week', label: '1주일' },
  { key: '1month', label: '1개월' },
  { key: '3month', label: '3개월' },
  { key: '6month', label: '6개월' },
  { key: '1year', label: '1년' },
]

// 실제 거래 내역 데이터
const transactionsData = ref([])

// 사용자 ID 가져오기 (세션 기반)
async function getUserId() {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    return res.data.userId
  } catch (e) {
    // 세션 실패 시 로컬스토리지 fallback
    return Number(localStorage.getItem('userId') || 1)
  }
}

// 거래 내역 불러오기
async function fetchTransactions() {
  loading.value = true
  try {
    // 엔드포인트 변경: /api/mocktrading/transactions
    const response = await axios.get('/api/mocktrading/transactions')
    console.log('🔍 거래내역 API response:', response)
    // 날짜 변환 및 id 보정
    transactionsData.value = (response.data || []).map((t, idx) => {
      // 날짜: executedAt > orderCreatedAt > 현재시간
      let execDate = t.executedAt || t.orderCreatedAt
      // 가격: price > orderPrice > totalAmount/quantity > 0
      let price = t.price
      if (!price || price === 0) {
        if (t.orderPrice && t.orderPrice > 0) price = t.orderPrice
        else if (t.totalAmount && t.quantity) price = Math.floor(t.totalAmount / t.quantity)
        else price = 0
      }
      return {
        id: t.transactionId || idx + 1,
        stockCode: t.stockCode,
        stockName: t.stockName,
        type: t.transactionType, // BUY/SELL
        quantity: t.quantity,
        price,
        orderType: t.orderType,
        totalAmount: t.totalAmount,
        executedAt: execDate ? new Date(execDate) : new Date(),
        status: t.status || 'COMPLETED', // 백엔드 status 없으면 기본값
        imageUrl: t.imageUrl,
      }
    })
    console.log('📊 받은 거래 데이터:', transactionsData.value)
  } catch (e) {
    console.error('❌ 거래 내역 로딩 실패:', e)
    transactionsData.value = []
  } finally {
    loading.value = false
  }
}

const filteredTransactions = computed(() => {
  let filtered = [...transactionsData.value]
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
  return filtered.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
})

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
  await fetchTransactions()
}

onMounted(() => {
  fetchTransactions()
  console.log('거래 내역 페이지 마운트됨')
})
</script>
