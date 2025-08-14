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
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900"
        >체결 대기 목록</span
      >
      <button
        class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        @click="refreshData"
      >
        &#8635;
      </button>
    </header>
    <div class="w-full h-px bg-gray-200 shadow-sm mx-0" />

    <!-- 필터 및 기간 선택 -->
    <section class="bg-white mx-4 mt-2 pt-4 px-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-base font-semibold text-gray-900">대기 중인 주문</h3>
        <span class="text-sm text-gray-500">총 {{ orders.length }}건</span>
      </div>
    </section>

    <!-- 체결 대기 리스트 -->
    <section class="mx-4 mt-0 space-y-1.5">
      <!-- 스켈레톤 UI: 로딩 중일 때 보여줌 -->
      <template v-if="loading">
        <div v-for="n in 5" :key="n" class="bg-white p-3 animate-pulse">
          <div class="flex items-center justify-between mb-1">
            <div class="flex-shrink-0 w-10 text-left">
              <div class="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
              ></span>
              <div class="flex-1 min-w-0">
                <div class="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div class="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div class="h-3 bg-gray-100 rounded w-12"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- 실제 체결 대기 카드 -->
      <template v-else>
        <div v-if="orders.length === 0" class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p class="text-gray-500 text-center mb-4">체결 대기 중인 주문이 없습니다</p>
          <button
            @click="goToMockTrading"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            모의투자 시작하기
          </button>
        </div>
        <div v-else>
          <div
            v-for="order in orders"
            :key="order.orderId"
            class="bg-white p-3 rounded-lg flex items-center justify-between mb-1 cursor-pointer transition-colors hover:bg-gray-50"
            @click="goToStock(order)"
          >
            <!-- 날짜 및 시간 -->
            <div class="flex-shrink-0 w-10 text-left flex flex-col justify-center">
              <div class="text-xs font-semibold">
                {{ formatDateDot(order.createdAt) }}
              </div>
              <div class="text-[12px] text-gray-400 mt-1">{{ formatTime(order.createdAt) }}</div>
            </div>
            <!-- 종목명 및 상태 + 이미지 -->
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="order.stockCode && !imageErrors[order.stockCode]"
                  :src="`https://file.alphasquare.co.kr/media/images/stock_logo/kr/${order.stockCode}.png`"
                  :alt="`${order.stockName} 로고`"
                  class="w-full h-full object-cover rounded-full"
                  @error="handleImageError(order.stockCode)"
                />
                <span
                  v-else
                  class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                  style="border-color: #2272eb; color: #2272eb; background: #fff"
                >
                  {{ getStockInitial(order.stockName) }}
                </span>
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-base font-semibold truncate text-gray-900">
                  {{ order.stockName }}
                </div>
                <div class="text-xs mt-1 flex items-center gap-1">
                  <span :class="order.orderType === 'BUY' ? 'text-red-600 ' : 'text-blue-600'">
                    {{ order.quantity }}주
                    {{ order.orderType === 'BUY' ? '매수' : '매도' }}
                  </span>
                </div>
              </div>
            </div>
            <!-- 주문단가 및 주당 n원 -->
            <div class="flex-shrink-0 text-right flex flex-col justify-center h-full">
              <div>
                <div class="text-base font-semibold text-gray-900 mb-0.5">
                  {{ formatPrice(order.targetPrice * order.quantity) }}원
                </div>
                <div class="text-[12px] text-gray-500 mt-1">
                  주당 {{ formatPrice(order.targetPrice) }}원
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const imageErrors = ref({})
let intervalId = null

const router = useRouter()

function goBack() {
  router.back()
}

function goToMockTrading() {
  router.push({ name: 'MockTradingHome' })
}

async function fetchPendingOrders() {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('/api/stock/orders', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      if (response.status === 401) throw new Error('로그인이 필요합니다.')
      throw new Error('주문 목록을 불러오는데 실패했습니다.')
    }
    const data = await response.json()
    orders.value = Array.isArray(data) ? data : []
    console.log(orders.value.map((order) => order.stockCode))
  } catch (err) {
    error.value = err.message
    orders.value = []
    console.error('주문 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

const goToStock = async (order) => {
  try {
    await router.push(
      `/trading/?stockCode=${order.stockCode}&stockName=${encodeURIComponent(order.stockName)}&tab=waiting`,
    )
  } catch (error) {
    console.error('❌ 라우팅 오류:', error)
  }
}

function refreshData() {
  fetchPendingOrders()
}

function handleImageError(stockCode) {
  imageErrors.value[stockCode] = true
}

function getStockInitial(stockName) {
  if (!stockName) return '?'
  if (/[가-힣]/.test(stockName)) return stockName.charAt(0)
  return stockName.charAt(0).toUpperCase()
}

function formatDateDot(dateString) {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}.${day}`
}

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

onMounted(async () => {
  await fetchPendingOrders()
  intervalId = setInterval(fetchPendingOrders, 30000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
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
