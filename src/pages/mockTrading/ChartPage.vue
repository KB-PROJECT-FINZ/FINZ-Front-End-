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
        <span class="text-gray-600">어제보다 </span>
        <span :class="priceChangeClass">{{ realTimeChangeText }}</span>
      </div>
    </div>

    <!-- 차트 제목 -->
    <div class="bg-white px-8 py-3 flex justify-between items-center">
      <h2 class="text-xl font-semibold">차트</h2>
      <!-- 자동 새로고침 상태 표시 -->
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-sm text-gray-600">자동 새로고침</span>
      </div>
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

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import 'chartjs-adapter-date-fns'

// Chart.js 모든 컴포넌트 등록
Chart.register(...registerables)
Chart.register(CandlestickController, CandlestickElement)

// Chart.js 관련 변수
const chartCanvas = ref(null)
const chartInstance = ref(null)

// 차트 상태 관리
const currentEndTime = ref(null) // 현재 차트 오른쪽 끝 시간
const autoRefreshInterval = ref(null) // 자동 새로고침 인터벌
// const apiStatus = ref('loading') // API 상태: 'loading', 'success', 'error'
// const apiStatusText = ref('API 연결 중...') // API 상태 텍스트
// const lastApiCall = ref(null) // 마지막 API 호출 시간

// 반응형 데이터
const isFavorite = ref(false)
const showMenu = ref(false)
const showMinutesModal = ref(false)
const selectedTimeFrame = ref('1min')

const router = useRouter()
const route = useRoute()

const stockInfo = reactive({
  name: '', // 종목명
  currentPrice: 0,
  changeAmount: 0,
  changeRate: 0,
  stockCode: '', // 종목코드
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

// 컴퓨티드 속성들
// prdy_vrss_sign: 1(+)이면 빨간색, 2(-)이면 파란색, 그 외 회색
const priceChangeClass = computed(() => {
  if (String(stockInfo.changeSign) === '1' || String(stockInfo.changeSign) === '2') {
    return 'text-red-500'
  } else if (String(stockInfo.changeSign) === '5') {
    return 'text-blue-500'
  } else {
    return 'text-gray-500'
  }
})

// '어제보다 n원 (n.nn%)' 텍스트 생성
const realTimeChangeText = computed(() => {
  // prdy_vrss_sign: 1,2(+) / 5(-)
  let sign = ''
  if (String(stockInfo.changeSign) === '1' || String(stockInfo.changeSign) === '2') {
    sign = '+'
  } else if (String(stockInfo.changeSign) === '5') {
    sign = '-'
  }
  return `${sign}${formatPrice(Math.abs(stockInfo.changeAmount))}원 (${sign}${Math.abs(stockInfo.changeRate)}%)`
})

// 메서드들
const goBack = () => {
  router.push('/mock-trading')
}

// 백엔드 서버에서 주식 차트 데이터 조회 (새로운 API 형식)
const fetchStockChartData = async (stockCode) => {
  try {
    // 프록시를 통한 상대 경로 사용 (CORS 문제 해결)
    const url = `/api/chart/minute/${stockCode}`

    console.log(`[API 요청] ${stockCode} 차트 데이터 조회 시작`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API 오류] ${response.status} ${response.statusText}:`, errorText)
      throw new Error(`백엔드 API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // 한국투자증권 API 오류 체크 (rt_cd가 "0"이 아니면 오류)
    if (result.rt_cd && result.rt_cd !== '0') {
      console.error('[API 오류] 응답 오류:', result.msg1)
      throw new Error(`API 오류: ${result.msg1 || 'Unknown error'}`)
    }

    // output2 데이터 확인
    if (!result.output2 || !Array.isArray(result.output2)) {
      console.error('[API 오류] 차트 데이터가 없습니다')
      throw new Error(`API 오류: 차트 데이터가 없습니다`)
    }
    console.log(result)
    console.log(`[API 성공] ${result.output2.length}개 데이터 수신`)
    return result
  } catch (error) {
    console.error('[API 오류] 주식 차트 데이터 조회 실패:', error.message)
    throw error
  }
}

// 새로운 API 응답을 Chart.js 형식으로 변환
const convertApiDataToChartData = (apiResponse) => {
  // 한국투자증권 API 응답 구조: output2 배열 사용
  const chartDataArray = apiResponse.output2 || apiResponse.data || []

  if (!chartDataArray || !Array.isArray(chartDataArray)) {
    console.warn('[데이터 변환] API 응답에 차트 데이터가 없습니다')
    return []
  }

  // 15:20~15:29 데이터 제외, 15:19 이전 모든 데이터와 마지막 15:30 데이터만 남김
  let filteredData = chartDataArray.filter((item) => {
    const time = item.stck_cntg_hour
    // 15:20~15:29: 152000~152900
    if (time >= '152000' && time < '153000') {
      return false
    }
    return true
  })

  // 15:19 이전 모든 데이터 + 마지막 15:30 데이터만 남김
  const before1519 = filteredData.filter((item) => item.stck_cntg_hour <= '151900')
  const idx1530 = filteredData.findLastIndex((item) => item.stck_cntg_hour === '153000')
  let last1530 = []
  if (idx1530 !== -1) {
    // 15:19 데이터의 x값을 구함
    const last1519 = before1519[before1519.length - 1]
    if (last1519) {
      // 15:30 데이터의 시간 정보를 15:20으로 덮어씀
      const fake1530 = { ...filteredData[idx1530] }
      fake1530.stck_cntg_hour = '152000'
      last1530 = [fake1530]
    } else {
      last1530 = [filteredData[idx1530]]
    }
  }
  filteredData = [...before1519, ...last1530]

  const convertedData = filteredData
    .map((item, index) => {
      try {
        // 한국투자증권 API 필드 매핑
        const date = item.stck_bsop_date // 날짜: '20250725'
        const time = item.stck_cntg_hour // 시간: '134500'

        // 날짜와 시간을 파싱하여 Date 객체 생성
        const year = parseInt(date.substr(0, 4))
        const month = parseInt(date.substr(4, 2)) - 1 // 월은 0부터 시작
        const day = parseInt(date.substr(6, 2))

        const hour = parseInt(time.substr(0, 2))
        const minute = parseInt(time.substr(2, 2))
        const second = parseInt(time.substr(4, 2))

        const dateTime = new Date(year, month, day, hour, minute, second)

        return {
          x: dateTime.getTime(),
          o: parseInt(item.stck_oprc), // 시가
          h: parseInt(item.stck_hgpr), // 고가
          l: parseInt(item.stck_lwpr), // 저가
          c: parseInt(item.stck_prpr), // 종가 (현재가)
          volume: parseInt(item.cntg_vol || item.acml_vol || 0), // 거래량
        }
      } catch (error) {
        console.error(`[데이터 변환] 항목 ${index} 변환 실패:`, error.message)
        return null
      }
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.x - b.x) // 시간순 정렬

  console.log(`[데이터 변환] ${convertedData.length}개 캔들 데이터 생성`)
  return convertedData
}

// 차트 데이터를 가져오는 함수
const generateCandlestickData = async () => {
  try {
    // 실제 백엔드 API 호출
    const apiResponse = await fetchStockChartData(stockInfo.stockCode, selectedTimeFrame.value)
    const chartData = convertApiDataToChartData(apiResponse)

    // 차트 오른쪽 끝 시간 업데이트
    if (chartData.length > 0) {
      currentEndTime.value = new Date(chartData[chartData.length - 1].x)

      // 현재가 정보 업데이트 (가장 최근 캔들의 종가 사용)
      const latestCandle = chartData[chartData.length - 1]
      stockInfo.currentPrice = latestCandle.c
      // changeAmount는 mock price에서만 설정
    }

    return chartData
  } catch (error) {
    console.error('[차트 데이터] API 조회 실패, 더미 데이터 사용:', error.message)
    // API 실패 시 더미 데이터 사용
    return generateDummyData()
  }
}

// 1분 주기 차트 새로고침 함수
const refreshChart = async () => {
  try {
    await createChart()
  } catch (error) {
    console.error('[자동 새로고침] 실패:', error.message)
  }
}

// 더미 데이터 생성 함수 (API 실패 시 대체용)
const generateDummyData = () => {
  const data = []
  const basePrice = stockInfo.currentPrice
  let currentPrice = basePrice

  // 30개 데이터 생성
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
const createChart = async () => {
  if (!chartCanvas.value) {
    console.warn('[차트] 캔버스가 준비되지 않음')
    return
  }

  try {
    // 기존 차트 인스턴스 제거
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }

    const data = await generateCandlestickData()

    if (!data.length) {
      console.warn('[차트] 데이터가 없음')
      return
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
      console.error('[차트] 캔버스 컨텍스트를 가져올 수 없음')
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
              up: '#e42939',
              down: '#2272eb',
              unchanged: '#999999',
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
        animation: {
          duration: 0,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            external: function (context) {
              let tooltipEl = document.getElementById('chartjs-custom-tooltip')
              if (!tooltipEl) {
                tooltipEl = document.createElement('div')
                tooltipEl.id = 'chartjs-custom-tooltip'
                tooltipEl.style.position = 'absolute'
                tooltipEl.style.pointerEvents = 'none'
                tooltipEl.style.zIndex = 1000
                tooltipEl.style.background = 'rgba(255,255,255,0.97)'
                tooltipEl.style.border = '1px solid #e5e7eb'
                tooltipEl.style.borderRadius = '8px'
                tooltipEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                tooltipEl.style.padding = '14px 18px'
                tooltipEl.style.fontFamily = 'Noto Sans KR, sans-serif'
                tooltipEl.style.fontSize = '14px'
                tooltipEl.style.color = '#374151'
                document.body.appendChild(tooltipEl)
              }
              const { chart, tooltip } = context
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0
                return
              }
              if (tooltip.dataPoints && tooltip.dataPoints.length) {
                const d = tooltip.dataPoints[0].raw
                const price = (v) => v?.toLocaleString('ko-KR')
                let html = ''
                // 날짜 타이틀
                const date = new Date(d.x)
                const title = date.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                html += `<div style="font-size:13px;font-weight:bold;color:#111827;margin-bottom:6px;">${title}</div>`
                html += `<div style='margin-bottom:2px;'>시가: <span style='color:#eab308;font-weight:bold;'>${price(d.o)}원</span></div>`
                html += `<div style='margin-bottom:2px;'>고가: <span style='color:#ef4444;font-weight:bold;'>${price(d.h)}원</span></div>`
                html += `<div style='margin-bottom:2px;'>저가: <span style='color:#3b82f6;font-weight:bold;'>${price(d.l)}원</span></div>`
                html += `<div style='margin-bottom:2px;'>종가: <span style='color:#111827;font-weight:bold;'>${price(d.c)}원</span></div>`
                if (d.volume !== undefined) {
                  html += `<div>거래량: <span style='color:#6366f1;font-weight:bold;'>${price(d.volume)}</span></div>`
                }
                tooltipEl.innerHTML = html
              }
              // 위치 조정 (마우스 위치 기준)
              tooltipEl.style.opacity = 1
              // Chart.js 3.x 이상에서는 tooltip 객체에 mouseX, mouseY가 없으므로, getBoundingClientRect 사용
              const canvasRect = chart.canvas.getBoundingClientRect()
              // tooltip.caretX/Y는 캔버스 내 좌표이므로, 브라우저 전체 좌표로 변환
              const left = window.scrollX + canvasRect.left + tooltip.caretX + 16
              const top =
                window.scrollY + canvasRect.top + tooltip.caretY - tooltipEl.offsetHeight / 2
              tooltipEl.style.left = left + 'px'
              tooltipEl.style.top = top + 'px'
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
            afterDataLimits: function (scale) {
              const range = scale.max - scale.min
              const padding = range * 0.15
              scale.max = scale.max + padding
              scale.min = scale.min - padding
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    })

    console.log('[차트] 생성 완료')
  } catch (error) {
    console.error('[차트] 생성 오류:', error.message)
  }
}

// 1분 주기 자동 새로고침 시작
const startAutoRefresh = () => {
  stopAutoRefresh() // 기존 인터벌 정리

  autoRefreshInterval.value = setInterval(async () => {
    await refreshChart()
  }, 60000) // 60초마다 새로고침
}

// 자동 새로고침 중지
const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

// 시간대 변경 감지
const updateChart = async () => {
  try {
    await createChart()
    startAutoRefresh() // 자동 새로고침 재시작
  } catch (error) {
    console.error('[차트 업데이트] 오류:', error.message)
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
  // TradingPage로 이동하면서 stockCode와 stockName을 route에서 항상 보존
  const stockCode = route.params.stockCode || stockInfo.stockCode
  const stockName = route.query.stockName || stockInfo.name
  router.push({
    path: '/trading',
    query: {
      stockCode,
      stockName,
      tab: type,
    },
  })
}

onMounted(() => {
  // DOM이 완전히 렌더링된 후 차트 생성
  stockInfo.stockCode = route.params.stockCode || ''
  stockInfo.name = route.query.stockName || ''
  // 상단 가격/변동 정보는 mock price API에서만 세팅
  const setMockPriceInfo = async () => {
    try {
      const mockPriceUrl = `/api/mock/price/${stockInfo.stockCode}`
      const mockPriceRes = await fetch(mockPriceUrl, { method: 'GET' })
      const mockPriceRaw = await mockPriceRes.json()
      console.log('[RAW MOCK PRICE]', mockPriceRaw)
      if (mockPriceRaw && typeof mockPriceRaw === 'object' && mockPriceRaw.output) {
        stockInfo.currentPrice = Number(mockPriceRaw.output.stck_prpr) || 0
        stockInfo.changeAmount = Number(mockPriceRaw.output.prdy_vrss) || 0
        stockInfo.changeRate = Number(mockPriceRaw.output.prdy_ctrt) || 0
        stockInfo.changeSign = mockPriceRaw.output.prdy_vrss_sign || '2'
      }
    } catch (err) {
      console.warn(`[RAW MOCK PRICE] 요청 실패:`, err)
    }
  }
  nextTick(() => {
    setMockPriceInfo()
    setTimeout(() => {
      createChart()
      startAutoRefresh() // 자동 새로고침 시작
    }, 100)
  })
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopAutoRefresh() // 자동 새로고침 중지
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>

<style scoped>
/* 필요한 경우 추가적인 스타일링 */
</style>
