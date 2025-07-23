<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden">
    <!-- 상단 네비게이션 -->
    <header class="bg-white px-4 pt-3 pb-3 sticky top-0 z-50">
      <div class="flex items-center justify-between">
        <!-- 뒤로가기 버튼 -->
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

        <!-- 빈 공간 (중앙 여백) -->
        <div></div>

        <!-- 오른쪽 버튼들 -->
        <div class="flex items-center gap-2">
          <!-- 관심종목 하트 버튼 -->
          <button
            @click="toggleFavorite"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            :class="isFavorite ? 'text-red-500' : 'text-[#b5bdc7]'"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>

          <!-- 더보기 메뉴 버튼 -->
          <button @click="toggleMenu" class="p-2 hover:bg-gray-100 rounded-lg text-[#b5bdc7]">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 종목 정보 상단 섹션 -->
    <div class="bg-white px-8 py-4">
      <!-- 종목명 -->
      <h1 class="text-xl text-gray-900 font-semibold">
        {{ stockInfo.name }}
      </h1>

      <!-- 현재가 -->
      <div class="text-3xl font-bold text-black mb-2">
        {{ formatPrice(stockInfo.currentPrice) }}원
      </div>

      <!-- 변동 정보 -->
      <div class="text-xs">
        <span class="text-gray-600">어제보다</span>
        <span :class="priceChangeClass">{{ realTimeChangeText }}</span>
      </div>
    </div>

    <!-- 차트 제목 -->
    <div class="bg-white px-8 py-3">
      <h2 class="text-xl font-semibold">차트</h2>
    </div>

    <!-- 차트 영역 -->
    <div class="bg-white px-8 flex-1 flex flex-col">
      <div class="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <span class="text-gray-500">차트가 여기에 표시됩니다</span>
      </div>

      <!-- 차트 타입 선택 버튼들 -->
      <div class="flex justify-between mb-4">
        <!-- 분봉 선택 버튼 -->
        <button
          @click="showMinutesModal = true"
          class="flex items-center px-3 py-2 rounded-lg transition-colors"
          :class="
            selectedTimeFrame.includes('min')
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          <span class="text-sm font-medium">{{ getSelectedMinuteLabel() }}</span>
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

        <!-- 일봉 버튼 -->
        <button
          @click="selectedTimeFrame = 'day'"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            selectedTimeFrame === 'day'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          일
        </button>

        <!-- 주봉 버튼 -->
        <button
          @click="selectedTimeFrame = 'week'"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            selectedTimeFrame === 'week'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          주
        </button>

        <!-- 월봉 버튼 -->
        <button
          @click="selectedTimeFrame = 'month'"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            selectedTimeFrame === 'month'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          월
        </button>

        <!-- 년봉 버튼 -->
        <button
          @click="selectedTimeFrame = 'year'"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            selectedTimeFrame === 'year'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          년
        </button>
      </div>
    </div>

    <!-- 거래 버튼 영역 -->
    <div class="bg-white px-8 py-4">
      <!-- 보유 종목인 경우: 판매/구매 버튼 -->
      <div v-if="hasStock" class="flex gap-3">
        <button
          @click="navigateToTradingPage('sell')"
          class="flex-1 py-3 rounded-lg font-bold text-white transition-colors bg-blue-500 hover:bg-blue-600"
        >
          판매하기
        </button>
        <button
          @click="navigateToTradingPage('buy')"
          class="flex-1 py-3 rounded-lg font-bold text-white transition-colors bg-red-500 hover:bg-red-600"
        >
          구매하기
        </button>
      </div>

      <!-- 미보유 종목인 경우: 구매 버튼만 -->
      <div v-else>
        <button
          @click="navigateToTradingPage('buy')"
          class="w-full py-3 rounded-lg font-bold text-white transition-colors bg-red-500 hover:bg-red-600"
        >
          구매하기
        </button>
      </div>
    </div>

    <!-- 분봉 선택 모달 -->
    <div
      v-if="showMinutesModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
      @click="showMinutesModal = false"
    >
      <div class="bg-white w-full rounded-t-2xl p-4" @click.stop>
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <h3 class="text-lg font-semibold mb-4">분봉 선택</h3>
        <div class="space-y-2">
          <button
            v-for="minute in minuteOptions"
            :key="minute.value"
            @click="selectMinute(minute.value)"
            class="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
            :class="selectedTimeFrame === minute.value ? 'bg-gray-100' : ''"
          >
            <span class="text-gray-900">{{ minute.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 더보기 메뉴 모달 -->
    <div
      v-if="showMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
      @click="showMenu = false"
    >
      <div class="bg-white w-full rounded-t-2xl p-4" @click.stop>
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div class="space-y-4">
          <button class="w-full text-left p-3 hover:bg-gray-100 rounded-lg">
            <span class="text-gray-900">차트 설정</span>
          </button>
          <button class="w-full text-left p-3 hover:bg-gray-100 rounded-lg">
            <span class="text-gray-900">알림 설정</span>
          </button>
          <button class="w-full text-left p-3 hover:bg-gray-100 rounded-lg">
            <span class="text-gray-900">공유하기</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ChartPage',
  setup() {
    const router = useRouter()

    // 반응형 데이터
    const isFavorite = ref(false)
    const showMenu = ref(false)
    const showMinutesModal = ref(false)
    const selectedTimeFrame = ref('1min')

    const stockInfo = reactive({
      name: '삼성전자',
      currentPrice: 71200,
      changeAmount: 1200,
      changeRate: 1.71,
      stockCode: '005930', // 종목 코드 추가
    })

    // 사용자 보유 정보 (실제로는 API에서 가져올 데이터)
    const userHoldings = reactive({
      '005930': {
        // 삼성전자 보유
        quantity: 1,
        averagePrice: 0, // 평균 매입가
      },
      // 다른 종목들...
    })

    // 현재 종목 보유 여부
    const hasStock = computed(() => {
      return userHoldings[stockInfo.stockCode] && userHoldings[stockInfo.stockCode].quantity > 0
    })

    // 분봉 옵션들
    const minuteOptions = ref([
      { value: '1min', label: '1분' },
      { value: '3min', label: '3분' },
      { value: '5min', label: '5분' },
      { value: '10min', label: '10분' },
      { value: '15min', label: '15분' },
      { value: '30min', label: '30분' },
      { value: '60min', label: '60분' },
    ])

    // 전체 시간대 옵션들 (기존 호환성 유지)
    const timeFrames = ref([
      { value: '1min', label: '1분' },
      { value: '3min', label: '3분' },
      { value: '5min', label: '5분' },
      { value: '10min', label: '10분' },
      { value: '15min', label: '15분' },
      { value: '30min', label: '30분' },
      { value: '60min', label: '60분' },
      { value: 'day', label: '일봉' },
      { value: 'week', label: '주봉' },
      { value: 'month', label: '월봉' },
      { value: 'year', label: '년봉' },
    ])

    // 컴퓨티드 속성들
    const priceChangeClass = computed(() => {
      if (stockInfo.changeAmount > 0) {
        return 'text-red-500'
      } else if (stockInfo.changeAmount < 0) {
        return 'text-blue-500'
      } else {
        return 'text-gray-500'
      }
    })

    const realTimeChangeRateText = computed(() => {
      const sign = stockInfo.changeAmount > 0 ? '+' : ''
      return `${sign}${formatPrice(stockInfo.changeAmount)}원 (${sign}${stockInfo.changeRate}%)`
    })

    const realTimeChangeText = computed(() => {
      const sign = stockInfo.changeAmount > 0 ? '+' : ''
      return `${sign}${formatPrice(stockInfo.changeAmount)}원 (${sign}${stockInfo.changeRate}%)`
    })

    // 메서드들
    const goBack = () => {
      router.push('/')
    }

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
      // 여기에 관심종목 추가/제거 API 호출 로직 추가
      console.log('관심종목 상태:', isFavorite.value ? '추가됨' : '제거됨')
    }

    const toggleMenu = () => {
      showMenu.value = !showMenu.value
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ko-KR').format(price)
    }

    const getSelectedTimeFrameLabel = () => {
      const timeFrame = timeFrames.value.find((tf) => tf.value === selectedTimeFrame.value)
      return timeFrame ? timeFrame.label : ''
    }

    const getSelectedMinuteLabel = () => {
      const minute = minuteOptions.value.find((m) => m.value === selectedTimeFrame.value)
      return minute ? minute.label : '1분'
    }

    const selectMinute = (value) => {
      selectedTimeFrame.value = value
      showMinutesModal.value = false
    }

    const navigateToTradingPage = (type) => {
      // TradingPage로 이동하면서 거래 타입(buy/sell)과 종목 정보 전달
      router.push({
        path: '/trading',
        query: {
          stockCode: stockInfo.stockCode,
          stockName: stockInfo.name,
          tab: type,
        },
      })
    }

    onMounted(() => {
      // 컴포넌트 마운트 시 실행할 로직
      console.log('ChartPage 마운트됨')
    })

    return {
      // 반응형 데이터
      isFavorite,
      showMenu,
      showMinutesModal,
      selectedTimeFrame,
      stockInfo,
      timeFrames,
      minuteOptions,
      userHoldings,

      // 컴퓨티드
      priceChangeClass,
      realTimeChangeRateText,
      realTimeChangeText,
      hasStock,

      // 메서드
      goBack,
      toggleFavorite,
      toggleMenu,
      formatPrice,
      getSelectedTimeFrameLabel,
      getSelectedMinuteLabel,
      selectMinute,
      navigateToTradingPage,
    }
  },
}
</script>

<style scoped>
/* 필요한 경우 추가적인 스타일링 */
</style>
