<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- 헤더 -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          체결대기목록
        </h2>
        <span class="text-sm text-gray-500"> {{ orders.length }}개 주문 </span>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="p-6">
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="p-6">
      <div class="text-center py-8">
        <p class="text-red-500 mb-2">{{ error }}</p>
        <button
          @click="fetchOrders"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>

    <!-- 주문 목록 -->
    <div v-else class="p-6">
      <!-- 빈 상태 -->
      <div v-if="orders.length === 0" class="text-center py-8">
        <svg
          class="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
        <p class="text-gray-500 mb-2">체결 대기 중인 주문이 없습니다</p>
        <p class="text-sm text-gray-400">새로운 주문을 등록해보세요</p>
      </div>

      <!-- 주문 리스트 -->
      <div v-else class="space-y-3">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <!-- 종목 이미지/이니셜 -->
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
                  class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold"
                >
                  {{ getStockInitial(order.stockName) }}
                </span>
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">
                    {{ order.stockName }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ order.stockCode }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span
                    :class="
                      order.orderType === 'BUY'
                        ? 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700'
                        : 'px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700'
                    "
                  >
                    {{ order.orderType === 'BUY' ? '매수' : '매도' }}
                  </span>
                  <span>{{ order.quantity }}주</span>
                  <span>{{ formatPrice(order.targetPrice) }}원</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ formatPrice(order.targetPrice * order.quantity) }}원
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
            <button
              @click="cancelOrder(order.orderId)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="주문 취소"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="3,6 5,6 21,6" />
                <path
                  d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <div
      v-if="orders.length > 0"
      class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg"
    >
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">
          총 주문금액:
          <span class="font-medium text-gray-900"> {{ formatPrice(totalOrderAmount) }}원 </span>
        </span>
        <button
          @click="fetchOrders"
          class="text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendingOrders',
  data() {
    return {
      orders: [],
      loading: true,
      error: null,
      intervalId: null,
      imageErrors: {},
    }
  },
  computed: {
    totalOrderAmount() {
      return this.orders.reduce((sum, order) => sum + order.targetPrice * order.quantity, 0)
    },
  },
  async mounted() {
    await this.fetchOrders()
    // 30초마다 주문 상태 업데이트
    this.intervalId = setInterval(this.fetchOrders, 30000)
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true
        const response = await fetch('http://localhost:8080/api/stock/orders', {
          method: 'GET',
          credentials: 'include', // 세션 쿠키 포함
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          throw new Error('주문 목록을 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        this.orders = data
        this.error = null
      } catch (err) {
        this.error = err.message
        console.error('주문 목록 조회 실패:', err)
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId) {
      try {
        // 백엔드 API는 배열을 요구하므로 단일 ID도 배열로 전달
        const response = await fetch(`http://localhost:8080/api/stock/orders`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([orderId]), // 배열로 전달
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          const errorText = await response.text()
          throw new Error(errorText || '주문 취소에 실패했습니다.')
        }

        this.orders = this.orders.filter((order) => order.orderId !== orderId)
      } catch (err) {
        console.error('주문 취소 실패:', err)
        this.error = err.message
      }
    },

    formatDate(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) {
        // 1분 미만
        return '방금 전'
      } else if (diff < 3600000) {
        // 1시간 미만
        return `${Math.floor(diff / 60000)}분 전`
      } else if (diff < 86400000) {
        // 24시간 미만
        return `${Math.floor(diff / 3600000)}시간 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
    },

    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },

    // 이미지 로딩 에러 처리
    handleImageError(stockCode) {
      this.imageErrors[stockCode] = true
    },

    // 종목명에서 이니셜 추출 (이미지 대체용)
    getStockInitial(stockName) {
      if (!stockName) return '?'
      // 한글 종목명의 경우 첫 글자 사용
      if (/[가-힣]/.test(stockName)) {
        return stockName.charAt(0)
      }
      // 영문의 경우 첫 글자 대문자 사용
      return stockName.charAt(0).toUpperCase()
    },
  },
}
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
