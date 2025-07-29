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
      <div class="h-80 bg-white rounded-lg flex items-center justify-center mb-4 relative">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
        <!-- 로딩 스피너 오버레이 -->
        <div
          v-if="isChartLoading"
          class="absolute inset-0 flex items-center justify-center bg-white/70 z-10"
        >
          <svg
            class="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
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

    <!-- 분봉 선택 모달 (드래그 다운 슬라이드 닫기) -->
    <div
      v-if="showMinutesModal"
      class="fixed inset-0 bg-transparent z-50 flex items-end"
      @click="showMinutesModal = false"
    >
      <div
        class="bg-white w-full max-w-[420px] mx-auto rounded-t-2xl p-4 sm:p-6"
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
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-date-fns'

// --- 분봉 모달 드래그 다운 슬라이드 닫기 로직 ---
import { onBeforeUnmount } from 'vue'

const modalDragOffset = ref(0)
const isModalDragging = ref(false)
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
    showMinutesModal.value = false
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

onBeforeUnmount(() => {
  document.body.style.userSelect = ''
})

// Chart.js 모든 컴포넌트 등록
Chart.register(...registerables)
Chart.register(CandlestickController, CandlestickElement)
Chart.register(zoomPlugin)

// Chart.js 관련 변수
const chartCanvas = ref(null)
const chartInstance = ref(null)

// 차트 로딩 상태
const isChartLoading = ref(false)

// 차트 상태 관리
const currentEndTime = ref(null) // 현재 차트 오른쪽 끝 시간
const autoRefreshInterval = ref(null) // 자동 새로고침 인터벌

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

// 오늘 날짜를 YYYYMMDD 형식으로 반환
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// 메서드들
const goBack = () => {
  router.push('/mock-trading')
}

// 분봉 차트 데이터 조회 (기존)
const fetchStockChartData = async (stockCode) => {
  try {
    const url = `/api/chart/minute/${stockCode}/fullday`
    console.log(`[API 요청] ${stockCode} fullday 차트 데이터 조회 시작`)

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

    if (result.rt_cd && result.rt_cd !== '0') {
      console.error('[API 오류] 응답 오류:', result.msg1)
      throw new Error(`API 오류: ${result.msg1 || 'Unknown error'}`)
    }

    if (!result.output2 || !Array.isArray(result.output2)) {
      console.error('[API 오류] 차트 데이터가 없습니다')
      throw new Error(`API 오류: 차트 데이터가 없습니다`)
    }

    console.log(`[API 성공] ${result.output2.length}개 데이터 수신`)
    return result
  } catch (error) {
    console.error('[API 오류] 주식 차트 데이터 조회 실패:', error.message)
    throw error
  }
}

// 일/주/월/년봉 차트 데이터 조회 (신규)
const fetchVariousChartData = async (stockCode, periodCode) => {
  try {
    const startDate = '20150101' // 2015년 1월 1일부터 최대 가능한 갯수 호출
    const endDate = getTodayDate() // 오늘까지

    const url = `/api/chart/various/${stockCode}`
    const params = new URLSearchParams({
      periodCode,
      startDate,
      endDate,
    })

    console.log(`[API 요청] ${stockCode} ${periodCode}봉 차트 데이터 조회 시작`)
    console.log(`[요청 파라미터] startDate: ${startDate}, endDate: ${endDate}`)

    const response = await fetch(`${url}?${params}`, {
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

    if (result.rt_cd && result.rt_cd !== '0') {
      console.error('[API 오류] 응답 오류:', result.msg1)
      throw new Error(`API 오류: ${result.msg1 || 'Unknown error'}`)
    }

    if (!result.output2 || !Array.isArray(result.output2)) {
      console.error('[API 오류] 차트 데이터가 없습니다')
      throw new Error(`API 오류: 차트 데이터가 없습니다`)
    }

    console.log(`[API 성공] ${result.output2.length}개 ${periodCode}봉 데이터 수신`)
    return result
  } catch (error) {
    console.error(`[API 오류] ${periodCode}봉 차트 데이터 조회 실패:`, error.message)
    throw error
  }
}

// 1분봉 데이터를 Chart.js 형식으로 변환
function convertApiDataTo1MinChartData(apiResponse) {
  const chartDataArray = apiResponse.output2 || apiResponse.data || []
  if (!chartDataArray || !Array.isArray(chartDataArray)) {
    console.warn('[데이터 변환] API 응답에 차트 데이터가 없습니다')
    return []
  }

  // 15:20~15:29 데이터 제외, 15:19 이전 모든 데이터와 마지막 15:30 데이터만 남김
  let filteredData = chartDataArray.filter((item) => {
    const time = item.stck_cntg_hour
    if (time >= '152000' && time < '153000') {
      return false
    }
    return true
  })

  const before1519 = filteredData.filter((item) => item.stck_cntg_hour <= '151900')
  const idx1530 = filteredData.findLastIndex((item) => item.stck_cntg_hour === '153000')
  let last1530 = []
  if (idx1530 !== -1) {
    const last1519 = before1519[before1519.length - 1]
    if (last1519) {
      const fake1530 = { ...filteredData[idx1530] }
      fake1530.stck_cntg_hour = '152000'
      last1530 = [fake1530]
    } else {
      last1530 = [filteredData[idx1530]]
    }
  }
  filteredData = [...before1519, ...last1530]

  // 오늘 오전 9시 이전 데이터는 모두 제외
  const now = new Date()
  const today9am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0).getTime()

  const convertedData = filteredData
    .map((item, index) => {
      try {
        const date = item.stck_bsop_date
        const time = item.stck_cntg_hour
        const year = parseInt(date.substr(0, 4))
        const month = parseInt(date.substr(4, 2)) - 1
        const day = parseInt(date.substr(6, 2))
        const hour = parseInt(time.substr(0, 2))
        const minute = parseInt(time.substr(2, 2))
        const second = parseInt(time.substr(4, 2))
        const dateTime = new Date(year, month, day, hour, minute, second)

        return {
          x: dateTime.getTime(),
          dateTime: dateTime.getTime(), // 분봉도 dateTime 필드 추가
          dateString: `${date}${time}`, // 분봉용 dateString 추가
          o: parseInt(item.stck_oprc),
          h: parseInt(item.stck_hgpr),
          l: parseInt(item.stck_lwpr),
          c: parseInt(item.stck_prpr),
          volume: parseInt(item.cntg_vol || item.acml_vol || 0),
        }
      } catch (error) {
        console.error(`[데이터 변환] 항목 ${index} 변환 실패:`, error.message)
        return null
      }
    })
    .filter((item) => item !== null && item.x >= today9am)
    .sort((a, b) => a.x - b.x)

  return convertedData
}

// 일/주/월/년봉 데이터를 Chart.js 형식으로 변환
function convertVariousApiDataToChartData(apiResponse) {
  const chartDataArray = apiResponse.output2 || []
  if (!chartDataArray || !Array.isArray(chartDataArray)) {
    console.warn('[데이터 변환] API 응답에 차트 데이터가 없습니다')
    return []
  }

  const convertedData = chartDataArray
    .map((item, index) => {
      try {
        const date = item.stck_bsop_date
        const year = parseInt(date.substr(0, 4))
        const month = parseInt(date.substr(4, 2)) - 1
        const day = parseInt(date.substr(6, 2))
        const dateTime = new Date(year, month, day, 0, 0, 0)

        return {
          x: index, // 인덱스 기반으로 변경 (공백 제거용)
          dateTime: dateTime.getTime(), // 실제 날짜는 별도 저장
          dateString: item.stck_bsop_date, // 날짜 문자열 저장
          o: parseInt(item.stck_oprc),
          h: parseInt(item.stck_hgpr),
          l: parseInt(item.stck_lwpr),
          c: parseInt(item.stck_clpr), // 일봉의 경우 종가는 stck_clpr
          volume: parseInt(item.acml_vol || 0),
        }
      } catch (error) {
        console.error(`[데이터 변환] 항목 ${index} 변환 실패:`, error.message)
        return null
      }
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.dateTime - b.dateTime) // 실제 날짜 기준으로 정렬
    .map((item, sortedIndex) => ({ ...item, x: sortedIndex })) // 정렬 후 인덱스 재할당

  return convertedData
}

// 1분봉 데이터를 N분봉(3,5,10,15,30,60분)으로 변환
function convert1MinToNMinChartData(oneMinData, n) {
  if (!oneMinData || oneMinData.length === 0 || !n || n < 2) return oneMinData || []
  const result = []
  for (let i = 0; i < oneMinData.length; i += n) {
    const group = oneMinData.slice(i, i + n)
    if (group.length === 0) continue
    if (!group[0] || typeof group[0].x === 'undefined') continue
    const o = group[0].o
    const c = group[group.length - 1].c
    const h = Math.max(...group.map((d) => d.h))
    const l = Math.min(...group.map((d) => d.l))
    const volume = group.reduce((sum, d) => sum + (d.volume || 0), 0)
    result.push({
      x: group[0].x,
      o,
      h,
      l,
      c,
      volume,
    })
  }
  return result.sort((a, b) => a.x - b.x)
}

// 기존 인터페이스와 호환되는 변환 함수
function convertApiDataToChartData(apiResponse, timeFrame = '1min') {
  // 분봉의 경우
  if (timeFrame.includes('min')) {
    const oneMinData = convertApiDataTo1MinChartData(apiResponse)
    const minMatch = /^([0-9]+)min$/.exec(timeFrame)
    if (minMatch) {
      const n = parseInt(minMatch[1])
      if (n === 1) return oneMinData
      return convert1MinToNMinChartData(oneMinData, n)
    }
    return oneMinData
  }

  // 일/주/월/년봉의 경우
  return convertVariousApiDataToChartData(apiResponse)
}

// API 데이터 캐시 (분봉과 각 기간별로 별도 캐시)
let cachedMinuteApiResponse = null
let cachedDayApiResponse = null
let cachedWeekApiResponse = null
let cachedMonthApiResponse = null
let cachedYearApiResponse = null
let cachedStockCode = ''

// 차트 데이터를 가져오는 함수 (API 데이터 캐싱)
const generateCandlestickData = async () => {
  isChartLoading.value = true
  try {
    let apiResponse

    // stockCode가 바뀌었으면 모든 캐시 초기화
    if (cachedStockCode !== stockInfo.stockCode) {
      cachedMinuteApiResponse = null
      cachedDayApiResponse = null
      cachedWeekApiResponse = null
      cachedMonthApiResponse = null
      cachedYearApiResponse = null
      cachedStockCode = stockInfo.stockCode
    }

    // 시간대별로 다른 API 호출 및 캐싱
    if (selectedTimeFrame.value.includes('min')) {
      // 분봉 데이터
      if (!cachedMinuteApiResponse) {
        apiResponse = await fetchStockChartData(stockInfo.stockCode)
        cachedMinuteApiResponse = apiResponse
      } else {
        apiResponse = cachedMinuteApiResponse
      }
    } else if (selectedTimeFrame.value === 'day') {
      // 일봉 데이터
      if (!cachedDayApiResponse) {
        apiResponse = await fetchVariousChartData(stockInfo.stockCode, 'D')
        cachedDayApiResponse = apiResponse
      } else {
        apiResponse = cachedDayApiResponse
      }
    } else if (selectedTimeFrame.value === 'week') {
      // 주봉 데이터
      if (!cachedWeekApiResponse) {
        apiResponse = await fetchVariousChartData(stockInfo.stockCode, 'W')
        cachedWeekApiResponse = apiResponse
      } else {
        apiResponse = cachedWeekApiResponse
      }
    } else if (selectedTimeFrame.value === 'month') {
      // 월봉 데이터
      if (!cachedMonthApiResponse) {
        apiResponse = await fetchVariousChartData(stockInfo.stockCode, 'M')
        cachedMonthApiResponse = apiResponse
      } else {
        apiResponse = cachedMonthApiResponse
      }
    } else if (selectedTimeFrame.value === 'year') {
      // 년봉 데이터
      if (!cachedYearApiResponse) {
        apiResponse = await fetchVariousChartData(stockInfo.stockCode, 'Y')
        cachedYearApiResponse = apiResponse
      } else {
        apiResponse = cachedYearApiResponse
      }
    }

    const chartData = convertApiDataToChartData(apiResponse, selectedTimeFrame.value)

    // 차트 오른쪽 끝 시간 업데이트
    if (chartData.length > 0) {
      currentEndTime.value = new Date(chartData[chartData.length - 1].x)

      // 현재가 정보 업데이트 (가장 최근 캔들의 종가 사용)
      const latestCandle = chartData[chartData.length - 1]
      stockInfo.currentPrice = latestCandle.c
    }

    return chartData
  } catch (error) {
    console.error('[차트 데이터] API 조회 실패, 더미 데이터 사용:', error.message)
    // API 실패 시 더미 데이터 사용
    return generateDummyData()
  } finally {
    isChartLoading.value = false
  }
}

// 1분 주기 차트 새로고침 함수
const refreshChart = async () => {
  try {
    // 분봉일 때만 자동 새로고침 수행
    if (selectedTimeFrame.value.includes('min')) {
      // 분봉 캐시 초기화하여 최신 데이터 가져오기
      cachedMinuteApiResponse = null
      await createChart()
    }
  } catch (error) {
    console.error('[자동 새로고침] 실패:', error.message)
  }
}

// 더미 데이터 생성 함수 (API 실패 시 대체용)
const generateDummyData = () => {
  const data = []
  const basePrice = stockInfo.currentPrice || 70000
  let currentPrice = basePrice

  // 20개 데이터 생성
  const dataCount = 20

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

    // 시간대별로 다른 표시 개수 설정
    let showCount = 20
    if (selectedTimeFrame.value === 'day') {
      showCount = 20 // 일봉도 20개로 통일
    } else if (selectedTimeFrame.value === 'week') {
      showCount = 20 // 주봉도 20개
    } else if (selectedTimeFrame.value === 'month') {
      showCount = 20 // 월봉도 20개
    } else if (selectedTimeFrame.value === 'year') {
      showCount = 20 // 년봉도 20개
    }

    // 확대: 마지막 N개만 보이도록 x축 min/max 설정 및 pan 제한
    let xMin, xMax, dataMin, dataMax, limitMin
    if (data.length > 0) {
      const lastIdx = data.length - 1
      const actualShowCount = Math.min(showCount, data.length)
      if (selectedTimeFrame.value.includes('min')) {
        // 분봉: xMin/xMax는 timestamp
        xMin = data[Math.max(0, lastIdx - actualShowCount + 1)]?.x
        xMax = data[lastIdx]?.x
        const firstDate = new Date(data[0].x)
        const nineAM = new Date(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          firstDate.getDate(),
          9,
          0,
          0,
          0,
        )
        limitMin = nineAM.getTime()
        dataMin = Math.max(data[0]?.x, limitMin)
        dataMax = data[lastIdx]?.x
      } else {
        // 일/주/월/년봉: xMin/xMax는 인덱스
        xMin = Math.max(0, lastIdx - actualShowCount + 1)
        xMax = lastIdx
        limitMin = 0
        dataMin = 0
        dataMax = lastIdx
      }

      // 값이 undefined이거나 NaN이면 fallback
      if (typeof xMin !== 'number' || isNaN(xMin)) xMin = 0
      if (typeof xMax !== 'number' || isNaN(xMax)) xMax = lastIdx
      if (typeof dataMin !== 'number' || isNaN(dataMin)) dataMin = xMin
      if (typeof dataMax !== 'number' || isNaN(dataMax)) dataMax = xMax

      // 데이터가 1개 이하일 때 pan/zoom min/max가 같으면 오류 발생하므로 보정
      if (dataMin === dataMax) {
        dataMin = dataMin - 1
        dataMax = dataMax + 1
      }
    } else {
      // 데이터가 없을 때 기본값 설정
      const now = new Date()
      xMin = 0
      xMax = 19
      dataMin = 0
      dataMax = 19
      limitMin = 0
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
                let title
                if (selectedTimeFrame.value.includes('min')) {
                  // 분봉의 경우 x값이 실제 timestamp이므로 직접 포맷팅
                  const date = new Date(d.x)
                  const yyyy = date.getFullYear()
                  const mm = String(date.getMonth() + 1).padStart(2, '0')
                  const dd = String(date.getDate()).padStart(2, '0')
                  const HH = String(date.getHours()).padStart(2, '0')
                  const MM = String(date.getMinutes()).padStart(2, '0')
                  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
                  const dayOfWeek = weekDays[date.getDay()]
                  title = `${yyyy}.${mm}.${dd}(${dayOfWeek}) ${HH}:${MM}`
                } else {
                  // 일/주/월/년봉의 경우 dateString이 있으면 사용
                  if (d.dateString) {
                    const dateStr = d.dateString
                    const year = dateStr.substr(0, 4)
                    const month = dateStr.substr(4, 2)
                    const day = dateStr.substr(6, 2)
                    // 요일 구하기
                    const dateObj = new Date(`${year}-${month}-${day}`)
                    const weekDays = ['일', '월', '화', '수', '목', '금', '토']
                    const dayOfWeek = weekDays[dateObj.getDay()]
                    title = `${year}.${month}.${day}(${dayOfWeek})`
                  } else if (d.dateTime) {
                    const date = new Date(d.dateTime)
                    const yyyy = date.getFullYear()
                    const mm = String(date.getMonth() + 1).padStart(2, '0')
                    const dd = String(date.getDate()).padStart(2, '0')
                    const weekDays = ['일', '월', '화', '수', '목', '금', '토']
                    const dayOfWeek = weekDays[date.getDay()]
                    title = `${yyyy}.${mm}.${dd}(${dayOfWeek})`
                  } else {
                    title = 'N/A'
                  }
                }
                html += `<div style="font-size:13px;font-weight:bold;color:#111827;margin-bottom:6px;">${title}</div>`
                html += `<div style='margin-bottom:2px;'>시가: <span style='color:#111827;font-weight:bold;'>${price(d.o)}</span></div>`
                html += `<div style='margin-bottom:2px;'>고가: <span style='color:#ef4444;font-weight:bold;'>${price(d.h)}</span></div>`
                html += `<div style='margin-bottom:2px;'>저가: <span style='color:#3b82f6;font-weight:bold;'>${price(d.l)}</span></div>`
                html += `<div style='margin-bottom:2px;'>종가: <span style='color:#111827;font-weight:bold;'>${price(d.c)}</span></div>`
                if (d.volume !== undefined) {
                  html += `<div>거래량: <span style='color:#111827;font-weight:bold;'>${price(d.volume)}</span></div>`
                }
                tooltipEl.innerHTML = html
              }
              // 위치 조정 (마우스 위치 기준)
              tooltipEl.style.opacity = 1
              const canvasRect = chart.canvas.getBoundingClientRect()
              const left = window.scrollX + canvasRect.left + tooltip.caretX + 16
              const top =
                window.scrollY + canvasRect.top + tooltip.caretY - tooltipEl.offsetHeight / 2
              tooltipEl.style.left = left + 'px'
              tooltipEl.style.top = top + 'px'
            },
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              modifierKey: null,
              min: selectedTimeFrame.value.includes('min') ? limitMin : 0, // 분봉이 아니면 인덱스 0부터
              max: selectedTimeFrame.value.includes('min') ? dataMax : data.length - 1, // 분봉이 아니면 마지막 인덱스까지
              speed: 3,
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'x',
            },
            limits: {
              x: {
                minRange: 5,
                min: selectedTimeFrame.value.includes('min') ? limitMin : 0,
                max: selectedTimeFrame.value.includes('min') ? dataMax : data.length - 1,
              },
            },
          },
        },
        scales: {
          x: selectedTimeFrame.value.includes('min')
            ? {
                type: 'time',
                time: {
                  unit: 'minute',
                  displayFormats: {
                    minute: 'HH:mm',
                  },
                },
                display: true,
                grid: { display: false },
                ticks: {
                  maxTicksLimit: 6,
                  color: '#6B7280',
                  font: { size: 10 },
                  // Chart.js가 자동으로 HH:mm 포맷 적용
                },
                min: xMin,
                max: xMax,
              }
            : {
                type: 'linear',
                display: true,
                grid: { display: false },
                ticks: {
                  maxTicksLimit: 6,
                  color: '#6B7280',
                  font: { size: 10 },
                  callback: function (value, index) {
                    const idx = Math.floor(value)
                    const dataPoint = data[idx]
                    if (!dataPoint || !dataPoint.dateString) return ''
                    const dateStr = dataPoint.dateString
                    // 년봉 또는 월봉: 년도 4자리만, 년도 바뀔 때만 표시
                    if (selectedTimeFrame.value === 'year' || selectedTimeFrame.value === 'month') {
                      const year = dateStr.substr(0, 4)
                      if (idx === 0) return year
                      const prev = data[idx - 1]
                      if (prev && prev.dateString) {
                        const prevYear = prev.dateString.substr(0, 4)
                        if (year !== prevYear) return year
                      }
                      return ''
                    }
                    // 그 외(일/주봉): 기존 MM/DD
                    const month = dateStr.substr(4, 2)
                    const day = dateStr.substr(6, 2)
                    return `${month}/${day}`
                  },
                },
                min: xMin,
                max: xMax,
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

    // 차트 캔버스에서 마우스가 벗어나면 툴팁 숨기기
    if (chartCanvas.value) {
      chartCanvas.value.addEventListener('mouseleave', hideCustomTooltip)
    }
    console.log('[차트] 생성 완료')
  } catch (error) {
    console.error('[차트] 생성 오류:', error.message)
  }
}

// 자동 새로고침 시작 (분봉일 때만)
const startAutoRefresh = () => {
  stopAutoRefresh() // 기존 인터벌 정리

  // 분봉일 때만 자동 새로고침
  if (selectedTimeFrame.value.includes('min')) {
    autoRefreshInterval.value = setInterval(async () => {
      await refreshChart()
    }, 60000) // 60초마다 새로고침
  }
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
    startAutoRefresh() // 자동 새로고침 재시작 (분봉일 때만)
  } catch (error) {
    console.error('[차트 업데이트] 오류:', error.message)
  }
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
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
    // 차트 종목이 바뀌면 캐시 초기화
    cachedMinuteApiResponse = null
    cachedDayApiResponse = null
    cachedWeekApiResponse = null
    cachedMonthApiResponse = null
    cachedYearApiResponse = null
    cachedStockCode = ''
    setTimeout(() => {
      createChart()
      startAutoRefresh() // 자동 새로고침 시작 (분봉일 때만)
    }, 100)
  })
})

// 커스텀 툴팁 숨기기 함수
function hideCustomTooltip() {
  const tooltipEl = document.getElementById('chartjs-custom-tooltip')
  if (tooltipEl) {
    tooltipEl.style.opacity = 0
  }
}

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopAutoRefresh() // 자동 새로고침 중지
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
  // 차트 캔버스 이벤트 리스너 제거
  if (chartCanvas.value) {
    chartCanvas.value.removeEventListener('mouseleave', hideCustomTooltip)
  }
  // 페이지 이동 시 툴팁 완전히 제거
  const tooltipEl = document.getElementById('chartjs-custom-tooltip')
  if (tooltipEl) {
    tooltipEl.remove()
  }
})
</script>

<style scoped>
/* 필요한 경우 추가적인 스타일링 */
</style>
