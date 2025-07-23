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
      <div class="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
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
          @click="
            () => {
              selectedTimeFrame = 'day'
              updateChart()
            }
          "
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
          @click="
            () => {
              selectedTimeFrame = 'week'
              updateChart()
            }
          "
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
          @click="
            () => {
              selectedTimeFrame = 'month'
              updateChart()
            }
          "
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
          @click="
            () => {
              selectedTimeFrame = 'year'
              updateChart()
            }
          "
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import 'chartjs-adapter-date-fns'

// Chart.js 모든 컴포넌트 등록
Chart.register(...registerables)
Chart.register(CandlestickController, CandlestickElement)

export default {
  name: 'ChartPage',
  setup() {
    const router = useRouter()

    // Chart.js 관련 변수
    const chartCanvas = ref(null)
    const chartInstance = ref(null)

    // 차트 상태 관리
    const currentEndTime = ref(null) // 현재 차트 오른쪽 끝 시간
    // const isRealTime = ref(true) // 실시간 모드 여부
    // const autoUpdateInterval = ref(null) // 자동 갱신 인터벌

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

    // 현재 시간을 HHMMSS 형식으로 변환
    // const getCurrentTimeString = () => {
    //   const now = currentEndTime.value || new Date()
    //   const hours = now.getHours().toString().padStart(2, '0')
    //   const minutes = now.getMinutes().toString().padStart(2, '0')
    //   const seconds = now.getSeconds().toString().padStart(2, '0')
    //   return `${hours}${minutes}${seconds}`
    // }

    // 백엔드 서버에서 주식 차트 데이터 조회 (한국투자증권 API 원본 형식)
    // const fetchStockChartData = async (stockCode, timeFrame, endTime = null) => {
    //   try {
    //     const params = new URLSearchParams({
    //       stockCode: stockCode,
    //       timeFrame: timeFrame,
    //       endTime: endTime || getCurrentTimeString(), // FID_INPUT_HOUR_1에 해당
    //     })

    //     const response = await fetch(`/api/stocks/chart?${params}`, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     })

    //     if (!response.ok) {
    //       throw new Error(`백엔드 API 호출 실패: ${response.status}`)
    //     }

    //     const result = await response.json()

    //     // 한국투자증권 API 원본 응답 형식 검증
    //     if (result.rt_cd !== '0') {
    //       throw new Error(`API 오류: ${result.msg1}`)
    //     }

    //     return result
    //   } catch (error) {
    //     console.error('주식 차트 데이터 조회 실패:', error)
    //     throw error
    //   }
    // }

    // 시간대별 조회 기간 설정
    // const getDataPeriod = (timeFrame) => {
    //   const periodMap = {
    //     '1min': 100, // 분봉: 최근 100개
    //     '3min': 100,
    //     '5min': 100,
    //     '10min': 100,
    //     '15min': 100,
    //     '30min': 100,
    //     '60min': 100,
    //     day: 50, // 일봉 이상: 최근 50개
    //     week: 50,
    //     month: 50,
    //     year: 50,
    //   }
    //   return periodMap[timeFrame] || 100
    // }

    // 한국투자증권 API 원본 응답을 Chart.js 형식으로 변환
    // const convertApiDataToChartData = (kisApiResponse) => {
    //   // 한국투자증권 API 원본 응답 형식:
    //   // {
    //   //   "output1": { "prdy_vrss": "400", "stck_prpr": "66400", ... },
    //   //   "output2": [
    //   //     { "stck_bsop_date": "20250723", "stck_cntg_hour": "145800",
    //   //       "stck_oprc": "66400", "stck_hgpr": "66400", "stck_lwpr": "66300", "stck_prpr": "66400" },
    //   //     ...
    //   //   ]
    //   // }

    //   if (!kisApiResponse.output2 || !Array.isArray(kisApiResponse.output2)) {
    //     console.warn('한국투자증권 API 응답에 차트 데이터가 없습니다.')
    //     return []
    //   }

    //   // output1에서 주식 기본 정보 업데이트
    //   if (kisApiResponse.output1) {
    //     const output1 = kisApiResponse.output1
    //     stockInfo.name = output1.hts_kor_isnm || stockInfo.name
    //     stockInfo.currentPrice = parseInt(output1.stck_prpr) || stockInfo.currentPrice
    //     stockInfo.changeAmount = parseInt(output1.prdy_vrss) || 0
    //     stockInfo.changeRate = parseFloat(output1.prdy_ctrt) || 0

    //     // 부호 처리 (2: 상승, 5: 하락, 3: 보합)
    //     if (output1.prdy_vrss_sign === '5') {
    //       stockInfo.changeAmount = -Math.abs(stockInfo.changeAmount)
    //       stockInfo.changeRate = -Math.abs(stockInfo.changeRate)
    //     }
    //   }

    //   return kisApiResponse.output2
    //     .map((item) => {
    //       // 날짜/시간 파싱 (한국투자증권 형식)
    //       const dateStr = item.stck_bsop_date // YYYYMMDD
    //       const timeStr = item.stck_cntg_hour ? item.stck_cntg_hour.padStart(6, '0') : '000000' // HHMMSS

    //       const dateTime = new Date(
    //         parseInt(dateStr.substr(0, 4)), // 년
    //         parseInt(dateStr.substr(4, 2)) - 1, // 월 (0부터 시작)
    //         parseInt(dateStr.substr(6, 2)), // 일
    //         parseInt(timeStr.substr(0, 2)), // 시
    //         parseInt(timeStr.substr(2, 2)), // 분
    //         parseInt(timeStr.substr(4, 2)) // 초
    //       )

    //       return {
    //         x: dateTime.getTime(),
    //         o: parseInt(item.stck_oprc), // 시가
    //         h: parseInt(item.stck_hgpr), // 고가
    //         l: parseInt(item.stck_lwpr), // 저가
    //         c: parseInt(item.stck_prpr), // 종가 (현재가)
    //       }
    //     })
    //     .sort((a, b) => a.x - b.x) // 시간순 정렬
    // }    // 한국투자증권 API 원본 응답을 Chart.js 형식으로 변환
    const convertApiDataToChartData = (kisApiResponse) => {
      // 한국투자증권 API 원본 응답 형식:
      // {
      //   "output1": { "prdy_vrss": "400", "stck_prpr": "66400", ... },
      //   "output2": [
      //     { "stck_bsop_date": "20250723", "stck_cntg_hour": "145800",
      //       "stck_oprc": "66400", "stck_hgpr": "66400", "stck_lwpr": "66300", "stck_prpr": "66400" },
      //     ...
      //   ]
      // }

      if (!kisApiResponse.output2 || !Array.isArray(kisApiResponse.output2)) {
        console.warn('한국투자증권 API 응답에 차트 데이터가 없습니다.')
        return []
      }

      // output1에서 주식 기본 정보 업데이트
      if (kisApiResponse.output1) {
        const output1 = kisApiResponse.output1
        stockInfo.name = output1.hts_kor_isnm || stockInfo.name
        stockInfo.currentPrice = parseInt(output1.stck_prpr) || stockInfo.currentPrice
        stockInfo.changeAmount = parseInt(output1.prdy_vrss) || 0
        stockInfo.changeRate = parseFloat(output1.prdy_ctrt) || 0

        // 부호 처리 (2: 상승, 5: 하락, 3: 보합)
        if (output1.prdy_vrss_sign === '5') {
          stockInfo.changeAmount = -Math.abs(stockInfo.changeAmount)
          stockInfo.changeRate = -Math.abs(stockInfo.changeRate)
        }
      }

      return kisApiResponse.output2
        .map((item) => {
          // 날짜/시간 파싱 (한국투자증권 형식)
          const dateStr = item.stck_bsop_date // YYYYMMDD
          const timeStr = item.stck_cntg_hour ? item.stck_cntg_hour.padStart(6, '0') : '000000' // HHMMSS

          const dateTime = new Date(
            parseInt(dateStr.substr(0, 4)), // 년
            parseInt(dateStr.substr(4, 2)) - 1, // 월 (0부터 시작)
            parseInt(dateStr.substr(6, 2)), // 일
            parseInt(timeStr.substr(0, 2)), // 시
            parseInt(timeStr.substr(2, 2)), // 분
            parseInt(timeStr.substr(4, 2)), // 초
          )

          return {
            x: dateTime.getTime(),
            o: parseInt(item.stck_oprc), // 시가
            h: parseInt(item.stck_hgpr), // 고가
            l: parseInt(item.stck_lwpr), // 저가
            c: parseInt(item.stck_prpr), // 종가 (현재가)
          }
        })
        .sort((a, b) => a.x - b.x) // 시간순 정렬
    }

    // 차트 데이터를 가져오는 함수 (30개 고정)
    const generateCandlestickData = async (endTime = null) => {
      // TODO: 실제 백엔드 API 연동 시 아래 주석 해제하고 더미 데이터 부분 제거
      /*
      try {
        const kisApiResponse = await fetchStockChartData(stockInfo.stockCode, selectedTimeFrame.value, endTime)
        const chartData = convertApiDataToChartData(kisApiResponse)

        // 차트 오른쪽 끝 시간 업데이트
        if (chartData.length > 0) {
          currentEndTime.value = new Date(chartData[chartData.length - 1].x)
        }

        return chartData
      } catch (error) {
        console.error('한국투자증권 API 데이터 조회 실패, 더미 데이터 사용:', error)
        // API 실패 시 더미 데이터 사용
      }
      */

      // === 더미 데이터 생성 (30개 고정) ===
      const data = []
      const basePrice = stockInfo.currentPrice
      let currentPrice = basePrice

      // 30개 데이터 생성 (한국투자증권 API와 동일)
      const dataCount = 30

      for (let i = dataCount - 1; i >= 0; i--) {
        const date = new Date()

        if (selectedTimeFrame.value.includes('min')) {
          // 분봉: 분 단위로 역산
          const minutes = parseInt(selectedTimeFrame.value.replace('min', ''))
          date.setMinutes(date.getMinutes() - i * minutes)
        } else if (selectedTimeFrame.value === 'day') {
          date.setDate(date.getDate() - i)
        } else if (selectedTimeFrame.value === 'week') {
          date.setDate(date.getDate() - i * 7)
        } else if (selectedTimeFrame.value === 'month') {
          date.setMonth(date.getMonth() - i)
        } else if (selectedTimeFrame.value === 'year') {
          date.setFullYear(date.getFullYear() - i)
        }

        // 캔들 데이터 생성
        const open = currentPrice
        const changePercent = (Math.random() - 0.5) * 0.03 // ±1.5% 변동
        const close = open * (1 + changePercent)
        const high = Math.max(open, close) * (1 + Math.random() * 0.015)
        const low = Math.min(open, close) * (1 - Math.random() * 0.015)

        data.push({
          x: date.getTime(),
          o: Math.round(open),
          h: Math.round(high),
          l: Math.round(low),
          c: Math.round(close),
        })

        currentPrice = close
      }

      // 현재 차트 끝 시간 업데이트
      if (data.length > 0) {
        currentEndTime.value = new Date(data[data.length - 1].x)
      }

      return data
    }

    // 캔들스틱 차트 생성 함수
    const createChart = async (endTime = null) => {
      if (!chartCanvas.value) {
        console.warn('차트 캔버스가 아직 준비되지 않았습니다.')
        return
      }

      try {
        // 기존 차트 인스턴스 제거
        if (chartInstance.value) {
          chartInstance.value.destroy()
          chartInstance.value = null
        }

        const data = await generateCandlestickData(endTime)

        if (!data.length) {
          console.warn('차트 데이터가 없습니다.')
          return
        }

        const ctx = chartCanvas.value.getContext('2d')
        if (!ctx) {
          console.error('캔버스 컨텍스트를 가져올 수 없습니다.')
          return
        }

        chartInstance.value = new Chart(ctx, {
          type: 'candlestick',
          data: {
            datasets: [
              {
                label: stockInfo.name,
                data: data,
                backgroundColors: {
                  up: '#e42939', // 상승 캔들 색상 (빨간색)
                  down: '#2272eb', // 하락 캔들 색상 (파란색)
                  unchanged: '#999999', // 보합 캔들 색상
                },
                borderColors: {
                  up: '#e42939',
                  down: '#2272eb',
                  unchanged: '#999999',
                },
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              // 드래그 네비게이션 플러그인
              dragNavigation: {
                beforeInit: (chart) => {
                  let isDragging = false
                  let dragStartX = 0

                  chart.canvas.addEventListener('mousedown', (e) => {
                    isDragging = true
                    dragStartX = e.clientX
                    chart.canvas.style.cursor = 'grabbing'
                  })

                  chart.canvas.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                      const dragDistance = e.clientX - dragStartX
                      // 드래그 거리가 충분할 때만 처리 (성능 최적화)
                      if (Math.abs(dragDistance) > 50) {
                        // 왼쪽 드래그: 과거 데이터 로드
                        // if (dragDistance > 0) {
                        //   handleLoadPreviousData()
                        // }
                        // 오른쪽 드래그: 최신 데이터로 복귀
                        // else {
                        //   handleLoadLatestData()
                        // }
                        dragStartX = e.clientX
                      }
                    }
                  })

                  chart.canvas.addEventListener('mouseup', () => {
                    isDragging = false
                    chart.canvas.style.cursor = 'grab'
                  })

                  chart.canvas.addEventListener('mouseleave', () => {
                    isDragging = false
                    chart.canvas.style.cursor = 'default'
                  })
                },
              },
            },
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: selectedTimeFrame.value.includes('min')
                    ? 'minute'
                    : selectedTimeFrame.value === 'day'
                      ? 'day'
                      : selectedTimeFrame.value === 'week'
                        ? 'week'
                        : selectedTimeFrame.value === 'month'
                          ? 'month'
                          : 'year',
                  displayFormats: {
                    minute: 'HH:mm',
                    day: 'MM/dd',
                    week: 'MM/dd',
                    month: 'yy/MM',
                    year: 'yyyy',
                  },
                },
                display: true,
                grid: {
                  display: false,
                },
                ticks: {
                  maxTicksLimit: 6,
                  color: '#6B7280',
                  font: {
                    size: 10,
                  },
                },
              },
              y: {
                display: true,
                position: 'right',
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                  drawBorder: false,
                },
                ticks: {
                  color: '#6B7280',
                  font: {
                    size: 10,
                  },
                  callback: function (value) {
                    return value.toLocaleString() + '원'
                  },
                },
              },
            },
            interaction: {
              intersect: false,
              mode: 'index',
            },
            // 드래그 네비게이션 기능 추가
            onHover: (event, elements) => {
              event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'grab'
            },
          },
        })

        console.log('캔들스틱 차트가 성공적으로 생성되었습니다.')
      } catch (error) {
        console.error('차트 생성 중 오류가 발생했습니다:', error)
      }
    }

    // 이전 시간대 데이터 로드 (드래그 왼쪽)
    // const handleLoadPreviousData = async () => {
    //   if (!currentEndTime.value) return

    //   isRealTime.value = false
    //   const minutes = selectedTimeFrame.value.includes('min')
    //     ? parseInt(selectedTimeFrame.value.replace('min', ''))
    //     : 1

    //   // 30분 이전 시간 계산
    //   const prevTime = new Date(currentEndTime.value)
    //   prevTime.setMinutes(prevTime.getMinutes() - 30 * minutes)

    //   try {
    //     await updateChart(prevTime)
    //   } catch (error) {
    //     console.error('이전 데이터 로드 실패:', error)
    //   }
    // }

    // 최신 데이터로 복귀 (드래그 오른쪽)
    // const handleLoadLatestData = async () => {
    //   isRealTime.value = true
    //   currentEndTime.value = null

    //   try {
    //     await updateChart()
    //   } catch (error) {
    //     console.error('최신 데이터 로드 실패:', error)
    //   }
    // }

    // 자동 갱신 시작
    // const startAutoUpdate = () => {
    //   stopAutoUpdate() // 기존 인터벌 정리

    //   // 실시간 모드일 때만 자동 갱신
    //   autoUpdateInterval.value = setInterval(async () => {
    //     if (isRealTime.value) {
    //       try {
    //         await updateChart()
    //       } catch (error) {
    //         console.error('자동 갱신 실패:', error)
    //       }
    //     }
    //   }, 60000) // 1분마다 갱신
    // }

    // 자동 갱신 중지
    // const stopAutoUpdate = () => {
    //   if (autoUpdateInterval.value) {
    //     clearInterval(autoUpdateInterval.value)
    //     autoUpdateInterval.value = null
    //   }
    // }

    // 시간대 변경 감지
    const updateChart = async (endTime = null) => {
      try {
        await createChart(endTime)
      } catch (error) {
        console.error('차트 업데이트 중 오류가 발생했습니다:', error)
      }
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
      updateChart() // 차트 업데이트
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

      // DOM이 완전히 렌더링된 후 차트 생성
      nextTick(() => {
        // 추가 지연을 통해 캔버스가 완전히 준비되도록 함
        setTimeout(() => {
          createChart()
          // startAutoUpdate() // 자동 갱신 시작
        }, 100)
      })
    })

    // 컴포넌트 언마운트 시 정리
    onUnmounted(() => {
      // stopAutoUpdate()
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

      // 차트 관련
      chartCanvas,

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
      updateChart,
    }
  },
}
</script>

<style scoped>
/* 필요한 경우 추가적인 스타일링 */
</style>
