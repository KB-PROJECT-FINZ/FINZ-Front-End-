<template>
  <div class="min-h-screen pb-20 bg-gray-100">
    <!-- <div class="min-h-screen pb-20 bg-[#f2f6fd]"> -->
    <div class="flex flex-col items-center px-6 pt-6">
      <div class="w-full max-w-[420px] flex items-center justify-between mb-2">
        <img src="@/assets/finz.png" alt="finz" class="w-12 ml-1" />
        <!-- <BellIcon class="w-7 h-7 text-gray-500 cursor-pointer" /> -->
      </div>

      <!-- 안내사항 카드 -->
      <NoticeCard
        v-if="showNotice"
        @close="showNotice = false"
        @goToLearning="goToLearning"
        class="w-full max-w-[420px] p-4 mb-4 bg-white rounded-2xl shadow"
      >
        <div class="w-full flex flex-col items-left">
          <p class="text-lg mb-2 text-gray-800 text-center mt-6">
            <span class="font-medium block">퀴즈를 풀면</span>
            <span class="font-medium block">
              <span class="text-blue-600 font-bold">8000C</span>를 드려요!
            </span>
          </p>
          <div class="flex justify-center w-full">
            <DotLottieVue
              style="height: 200px; width: 200px"
              speed="0.9"
              autoplay
              loop
              src="https://lottie.host/c404786e-2d84-4239-a092-5fa55366d5a7/DRPRrsgJH4.json"
            />
          </div>
        </div>
        <template #button> 퀴즈 풀고 크레딧 받기 </template>
      </NoticeCard>

      <!-- 서비스 기능 연결 카드 Swiper -->
      <div class="w-full max-w-[420px] mx-auto mt-2 mb-4">
        <div class="bg-white rounded-2xl shadow p-5">
          <p class="text-base font-medium mb-1">
            <span class="text-blue-600 font-bold">{{ nickname }}</span
            >님, finz가 처음이신가요?
          </p>
          <p class="text-base font-medium mb-4">아래 내용을 차근차근 살펴보세요.</p>
          <div v-if="swiperReady">
            <Swiper
              :slides-per-view="2"
              :space-between="5"
              :loop="true"
              :initial-slide="0"
              :autoplay="{ delay: 1000, disableOnInteraction: false, pauseOnMouseEnter: true }"
              :speed="4000"
              :allow-touch-move="true"
              class="w-full"
            >
              <SwiperSlide
                v-for="(feature, idx) in serviceFeatures"
                :key="feature.title + '-' + idx"
              >
                <button
                  class="flex items-center bg-gray-50 rounded-xl px-2 py-3 mb-2 shadow-sm hover:bg-blue-50 transition-all min-h-[64px]"
                  @click="feature.onClick"
                >
                  <span class="flex items-center justify-center w-10 h-10 rounded-lg mr-1">
                    <img
                      :src="feature.icon"
                      :alt="feature.title + ' 아이콘'"
                      class="w-9 h-9 object-contain"
                    />
                  </span>
                  <span class="flex flex-col items-start text-left">
                    <span class="font-semibold text-sm text-gray-900">{{ feature.title }}</span>
                    <span class="text-xs text-gray-500 mt-0.5">{{ feature.desc }}</span>
                  </span>
                </button>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>

      <!-- 총 자산 카드 -->
      <div class="w-full max-w-[420px] mx-auto p-5 mb-4 bg-white rounded-2xl shadow">
        <button class="w-full text-left" style="display: block">
          <div class="py-2">
            <div class="flex items-center mb-1">
              <span class="font-bold text-base text-gray-900">투자 중인 금액</span>
            </div>
            <div v-if="!dataLoaded" class="w-40 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div v-else class="w-full flex flex-col items-start">
              <div class="text-2xl font-bold text-gray-900 mb-1">
                {{ stockValue.toLocaleString() }}원
              </div>
              <div class="text-base font-medium mb-1">
                <span
                  :class="
                    calculatedProfitAmount > 0
                      ? 'text-red-600'
                      : calculatedProfitAmount < 0
                        ? 'text-blue-600'
                        : 'text-gray-600'
                  "
                >
                  {{ calculatedProfitAmount > 0 ? '+' : ''
                  }}{{ calculatedProfitAmount.toLocaleString() }}원
                </span>
                <span
                  :class="
                    calculatedProfitAmount > 0
                      ? 'text-red-600'
                      : calculatedProfitAmount < 0
                        ? 'text-blue-600'
                        : 'text-gray-600'
                  "
                >
                  ({{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%)
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- 종목 정렬 옵션 + 리스트 카드 -->
      <div
        v-if="holdingsData && holdingsData.length > 0"
        class="w-full max-w-[420px] mx-auto p-5 mb-4 bg-white rounded-2xl shadow"
      >
        <div class="flex flex-row items-center justify-between gap-2 min-h-[40px]">
          <!-- 정렬 드롭다운 -->
          <div class="relative inline-block flex-shrink-0" ref="sortDropdownRoot">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="py-2 text-sm font-medium text-gray-700 flex items-center gap-1 min-w-[120px] h-10"
              type="button"
            >
              <span>{{ sortOptions.find((opt) => opt.key === currentSort)?.label || '정렬' }}</span>
              <svg
                class="w-4 h-4 text-gray-400"
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
            <div
              v-if="showSortDropdown"
              class="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10"
            >
              <ul>
                <li v-for="sort in sortOptions" :key="sort.key">
                  <button
                    @click="selectSortOption(sort.key)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                    :class="currentSort === sort.key ? 'text-blue-600 font-bold' : 'text-gray-700'"
                  >
                    {{ sort.label }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <!-- 오른쪽: 자세히보기 + 평가금/현재가 토글 버튼 묶음 -->
          <div class="flex items-center gap-2 flex-1 justify-end min-h-[40px]">
            <button
              type="button"
              class="flex items-center text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap h-7 px-2 bg-gray-100"
              :class="[showDetail ? 'text-black-600' : 'text-gray-500']"
              style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
              @click="showDetail = !showDetail"
            >
              자세히 보기
            </button>
            <div
              class="flex bg-gray-100 rounded-lg p-0 gap-0 flex-nowrap h-8 items-center overflow-hidden"
            >
              <button
                :class="[
                  showPriceType === 'value'
                    ? 'bg-white text-black-600'
                    : 'bg-gray-100 text-gray-500',
                  'px-2 py-0 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[36px] h-6',
                ]"
                @click="showPriceType = 'value'"
                type="button"
                style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
              >
                평가금
              </button>
              <button
                :class="[
                  showPriceType === 'current'
                    ? 'bg-white text-black-600'
                    : 'bg-gray-100 text-gray-500',
                  'px-2 py-0 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[36px] h-6',
                ]"
                @click="showPriceType = 'current'"
                type="button"
                style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
              >
                현재가
              </button>
            </div>
          </div>
        </div>
        <!-- 내 종목 간단 카드 리스트 (전체 스크롤) -->
        <div class="max-h-75 overflow-y-auto pr-1">
          <div
            v-for="holding in sortedHoldings"
            :key="holding.stockCode"
            class="p-0 mb-5 bg-white rounded-xl cursor-pointer transition-colors hover:bg-gray-50 hover:rounded-xl"
            @click="goToStockChart(holding.stockCode, holding.stockName)"
          >
            <!-- 카드 상단: 기존과 동일하게 -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span
                  class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="holding.imageUrl && !imageErrors[holding.stockCode]"
                    :src="holding.imageUrl"
                    :alt="`${holding.stockName} 로고`"
                    class="w-full h-full object-cover rounded-full"
                    @error="handleImageError(holding.stockCode)"
                  />
                  <span
                    v-else
                    class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                    style="border-color: #2272eb; color: #2272eb; background: #fff"
                  >
                    {{ getStockInitial(holding.stockName) }}
                  </span>
                </span>
                <div class="flex flex-col min-w-0">
                  <div class="text-base font-semibold text-gray-900 truncate">
                    {{ holding.stockName }}
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ holding.quantity }}주</div>
                </div>
              </div>
              <div class="flex flex-col items-end justify-center min-w-[110px]">
                <span class="text-base text-gray-900 font-semibold mb-0.5">
                  {{
                    showPriceType === 'current'
                      ? holding.currentPrice.toLocaleString()
                      : (holding.currentPrice * holding.quantity).toLocaleString()
                  }}원
                </span>
                <template v-if="showPriceType === 'value'">
                  <span
                    v-if="holding.profitLoss !== null && holding.profitRate !== null"
                    :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
                    class="text-xs"
                  >
                    {{ holding.profitRate >= 0 ? '+' : '-' }}
                    {{ Math.abs(holding.profitLoss).toLocaleString() }}원 ({{
                      holding.profitRate >= 0 ? '+' : ''
                    }}{{ holding.profitRate }}%)
                  </span>
                  <span v-else class="text-xs text-gray-400">계산 중...</span>
                </template>
                <template v-else>
                  <span
                    v-if="stockPrices[holding.stockCode]"
                    class="text-xs"
                    :class="
                      Number(stockPrices[holding.stockCode].inter2_prdy_vrss) > 0
                        ? 'text-red-600'
                        : Number(stockPrices[holding.stockCode].inter2_prdy_vrss) < 0
                          ? 'text-blue-600'
                          : 'text-gray-600'
                    "
                  >
                    {{ Number(stockPrices[holding.stockCode].inter2_prdy_vrss) > 0 ? '+' : '' }}
                    {{ Number(stockPrices[holding.stockCode].inter2_prdy_vrss).toLocaleString() }}원
                    ({{ Number(stockPrices[holding.stockCode].prdy_ctrt) > 0 ? '+' : ''
                    }}{{ stockPrices[holding.stockCode].prdy_ctrt }}%)
                  </span>
                  <span v-else class="text-xs text-gray-400">-</span>
                </template>
              </div>
            </div>

            <!-- 자세히보기: 추가 정보만 아래에 표시 -->
            <div v-if="showDetail" class="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>
                <span class="text-gray-500">종목코드</span>
                <span class="ml-2 font-medium text-gray-900">{{ holding.stockCode }}</span>
              </div>
              <div>
                <span class="text-gray-500">평균단가</span>
                <span class="ml-2 font-medium text-gray-900"
                  >{{ holding.averagePrice.toLocaleString() }}원</span
                >
              </div>
              <div>
                <span class="text-gray-500">평가금액</span>
                <span class="ml-2 font-medium text-gray-900">
                  <span v-if="holding.totalValue > 0"
                    >{{ holding.totalValue.toLocaleString() }}원</span
                  >
                  <span v-else class="text-gray-400">계산 중...</span>
                </span>
              </div>
              <div>
                <span class="text-gray-500">평가손익</span>
                <span
                  v-if="holding.profitLoss !== null && holding.profitLoss !== undefined"
                  class="ml-2 font-medium"
                  :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
                >
                  {{ holding.profitLoss >= 0 ? '+' : ''
                  }}{{ Math.abs(holding.profitLoss).toLocaleString() }}원
                </span>
                <span v-else class="ml-2 font-medium text-gray-400">계산 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 자산 현황/거래 내역/체결 대기 목록 세로형 카드 (배열 기반) -->
      <div class="w-full max-w-[420px] mx-auto mb-4 bg-white rounded-2xl shadow overflow-hidden">
        <button
          v-for="(item, idx) in assetMenuButtons"
          :key="item.label"
          @click="item.onClick"
          class="w-full flex items-center justify-between px-5 py-4 bg-white/60 hover:bg-blue-50 transition-colors duration-150 text-black text-base font-medium focus:outline-none"
          style="backdrop-filter: blur(2px)"
        >
          <span class="flex items-center gap-2">
            <img
              v-if="typeof item.icon === 'string' && item.icon"
              :src="item.icon"
              :alt="item.label + ' 아이콘'"
              class="w-6 h-6 object-contain"
            />
            <component v-else-if="item.icon" :is="item.icon" class="w-6 h-6" />
            {{ item.label }}
          </span>
          <svg
            class="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style="transform: scaleX(-1)"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <router-view />
      <transition name="fade-scale">
        <div
          v-if="selectedContent"
          class="fixed inset-0 bg-gray-300/40 z-50 flex items-center justify-center"
        >
          <div
            class="bg-white p-6 rounded-xl w-[90%] max-w-md relative shadow-2xl ring-1 ring-gray-200 transition-all duration-300 ease-in-out"
          >
            <p
              v-if="selectedContent.label"
              class="text-xs text-gray-500 mb-1 uppercase tracking-wide"
            >
              {{ selectedContent.label }}
            </p>
            <h2 class="text-lg font-bold mb-1 text-gray-800">
              {{ selectedContent.title }}
            </h2>
            <div class="border-b border-gray-300 my-3"></div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">
              {{ selectedContent.content }}
            </p>
            <button
              class="absolute top-3 right-4 text-gray-500 hover:text-black"
              @click="selectedContent = null"
            >
              ✕
            </button>
          </div>
        </div>
      </transition>
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { register } from 'swiper/element/bundle'
import 'swiper/css'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

import { getUserCredit } from '@/services/learning'
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
import BottomNav from '@/components/FooterNavigation.vue'
import { useHoldingsData } from '@/services/useHoldingsData'
// import PendingOrders from '@/components/mockTrading/PendingOrders.vue'
import NoticeCard from '@/components/NoticeCard.vue'

// import finzIcon from '@/assets/finz.png'
// import krwIcon from '@/assets/krw_image.png'

import introIcon from '@/assets/intro_image.png'
import quizIcon from '@/assets/quiz_image.png'
import suggestionIcon from '@/assets/suggestion_image.png'
import noteIcon from '@/assets/note_image.png'

import AssetIcon from '@/components/icons/AssetIcon.vue'
import transactionIcon from '@/components/icons/transactionIcon.vue'
import ListIcon from '@/components/icons/ListIcon.vue'
import BellIcon from '@/components/icons/BellIcon.vue'

const router = useRouter()

register()

// 서비스 기능 연결 카드 데이터
const serviceFeatures = [
  {
    icon: introIcon,
    title: '핀즈 알아보기',
    desc: '서비스 소개',
    onClick: () => router.push('/'),
  },
  {
    icon: quizIcon,
    title: '퀴즈 풀러가기',
    desc: '투자 개념 학습',
    onClick: () => router.push('/'),
  },
  {
    icon: suggestionIcon,
    title: '추천 받아보기',
    desc: 'AI 종목 추천',
    onClick: () => router.push('/'),
  },
  {
    icon: noteIcon,
    title: '일지 작성하기',
    desc: '투자 일지 작성',
    onClick: () => router.push('/'),
  },
]

const assetMenuButtons = [
  {
    label: '자산 현황',
    icon: AssetIcon,
    onClick: () => router.push('/mock-trading/asset-status'),
  },
  {
    label: '거래 내역',
    icon: transactionIcon,
    onClick: () => router.push('/mock-trading/transactions'),
  },
  {
    label: '체결 대기 목록',
    icon: ListIcon,
    onClick: () => router.push('/mock-trading/pending-orders'),
  },
]

// --- 내 투자내역 카드 관련 상태 및 함수 ---
const asset = ref({ amount: 0 })
const buyHistory = ref([])
const sellHistory = ref([])
const imageErrors = ref({})
const showNotice = ref(true)

const handleImageError = (code) => {
  imageErrors.value[code] = true
}

const getStockInitial = (name) => {
  return name ? name[0] : '?'
}

// --- 내 종목보기(보유 종목) 데이터 ---
const {
  holdingsData,
  loading: holdingsLoading,
  fetchHoldings,
  safeNumber: holdingsSafeNumber,
} = useHoldingsData()

// 현재가/평가금 토글 상태
const showPriceType = ref('value') // 'current' | 'value'

// 보유 종목 코드 추출
const stockCodes = computed(() =>
  (holdingsData.value || []).map((item) => item.stockCode).join(','),
)

// 시세 데이터 저장
const stockPrices = ref({})

// 시세 데이터 불러오기 함수
const fetchStockPrices = async () => {
  if (!stockCodes.value) return
  try {
    const res = await axios.get(`/api/stock/prices/${stockCodes.value}`)
    if (res.data && res.data.success) {
      stockPrices.value = res.data.data
    }
  } catch (e) {
    stockPrices.value = {}
  }
}

// 종목코드 변경 시마다 시세 데이터 갱신
watch(stockCodes, fetchStockPrices, { immediate: true })

const showDetail = ref(false)

const sortOptions = [
  { key: 'name', label: '가나다 순' },
  { key: 'profitRateAsc', label: '수익률 낮은 순' },
  { key: 'profitRateDesc', label: '수익률 높은 순' },
  { key: 'valueAsc', label: '평가손익 낮은 순' },
  { key: 'valueDesc', label: '평가손익 높은 순' },
]

const goToStockChart = (stockCode, stockName) => {
  router.push(`/mock-trading/${stockCode}/chart?stockName=${encodeURIComponent(stockName)}`)
}

const goToLearning = () => {
  router.push('/learning-start')
}

const currentSort = ref('name')
function changeSortOption(key) {
  currentSort.value = key
}

const sortedHoldings = computed(() => {
  const holdings = holdingsData.value || []
  if (!holdings.length) return []
  const sortKey = currentSort.value

  let arr = [...holdings]
  switch (sortKey) {
    case 'name':
      arr.sort((a, b) => (a.stockName || '').localeCompare(b.stockName || '', 'ko'))
      break
    case 'profitRateDesc':
      arr.sort((a, b) => (b.profitRate ?? -Infinity) - (a.profitRate ?? -Infinity))
      break
    case 'profitRateAsc':
      arr.sort((a, b) => (a.profitRate ?? Infinity) - (b.profitRate ?? Infinity))
      break
    case 'valueDesc':
      arr.sort((a, b) => (b.profitLoss ?? -Infinity) - (a.profitLoss ?? -Infinity))
      break
    case 'valueAsc':
      arr.sort((a, b) => (a.profitLoss ?? Infinity) - (b.profitLoss ?? Infinity))
      break
    default:
      break
  }
  return arr
})

const showSortDropdown = ref(false)
function selectSortOption(key) {
  changeSortOption(key)
  showSortDropdown.value = false
}

// 드롭다운 외부 클릭 시 닫기
import { onBeforeUnmount } from 'vue'
const sortDropdownRoot = ref(null)
function handleClickOutside(event) {
  if (sortDropdownRoot.value && !sortDropdownRoot.value.contains(event.target)) {
    showSortDropdown.value = false
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
const swiperReady = ref(false)

onMounted(async () => {
  await fetchHoldings()
  document.addEventListener('click', handleClickOutside)
  setTimeout(() => {
    swiperReady.value = true
  }, 0) // 또는 데이터 fetch 후 true
})

// 데이터 로딩 (내 투자내역)
onMounted(async () => {
  try {
    const txRes = await axios.get('/api/mocktrading/transactions', { withCredentials: true })
    if (txRes.data && txRes.data.length > 0) {
      const buyTx = txRes.data.filter((t) => t.transactionType === 'BUY')
      const sellTx = txRes.data.filter((t) => t.transactionType === 'SELL')

      buyHistory.value = buyTx.slice(0, 2).map((tx) => ({
        name: tx.stockName,
        desc: `매수 ${tx.quantity}주`,
        amount: tx.totalAmount,
        stockCode: tx.stockCode,
        imageUrl: tx.imageUrl,
      }))
      sellHistory.value = sellTx.slice(0, 2).map((tx) => ({
        name: tx.stockName,
        desc: `매도 ${tx.quantity}주`,
        amount: tx.totalAmount,
        stockCode: tx.stockCode,
        imageUrl: tx.imageUrl,
      }))
    }
  } catch (e) {
    // ignore error for now
    console.error('내 투자내역 로딩 실패:', e)
  }
})

const selectedContent = ref(null)

// 자산 데이터 스토어 (for total asset section)
const {
  dataLoaded,
  userAccount,
  calculatedProfitRate,
  loadUserData,
  safeNumber,
  stockValue,
  totalInvestment,
} = useAssetDataStore()

// 원금 대비 손익금 계산 (평가금액 - 투자원금)
const calculatedProfitAmount = computed(() => {
  if (!dataLoaded.value) return 0
  // 평가금액 - 투자원금
  return safeNumber(stockValue.value, 0) - safeNumber(totalInvestment.value, 0)
})

// 상태 변수
const nickname = ref('')
const riskTypeName = ref('')
const totalEarnedCredit = ref(0)
const completedLearningCount = ref(0)

const recommendedLearningContents = ref([]) // 퀴즈 없는 콘텐츠 → 학습 목표
const recommendedContentsByRisk = ref([]) // 성향 기반 콘텐츠 (추천용)

// 투자 성향 코드 → 이름 변환
function convertRiskTypeToName(code) {
  const map = {
    AGR: '적극적 성장형',
    AID: '적극적 안정형',
    BGT: '균형 잡힌 도전형',
    BSS: '균형 잡힌 수익 추구형',
    CAG: '신중한 성장형',
    CSD: '신중한 안정형',
    DTA: '단타 추구형',
    EXP: '실험적 모험가형',
    IND: '인덱스 수동형',
    INF: '정보 수집형',
    SOC: '사회 책임형',
    SYS: '시스템 트레이더형',
    TEC: '기술적 분석형',
    THE: '테마 투자형',
    VAL: '가치 투자형',
  }
  return map[code] || '미분류'
}

// 초기 실행
onMounted(async () => {
  try {
    const riskType = await fetchUserInfo()
    // 크레딧 정보 가져오기
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const userId = res.data.userId
    asset.value.amount = await getUserCredit(userId)
    await fetchRecommendedContentsByRiskType(riskType)
    await fetchAllRecommendedContents()
    await fetchCompletedLearningCount()
    await fetchTotalCredit()
    await loadUserData() // 자산 데이터 로드
  } catch (e) {
    console.error('❌ 초기 로딩 실패:', e)
    router.push('/login-form')
  }
})

// 사용자 정보 조회
const fetchUserInfo = async () => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const user = res.data
    nickname.value = user.nickname
    riskTypeName.value = convertRiskTypeToName(user.riskType)
    return user.riskType // riskType 코드 (예: 'TEC') 반환
  } catch (e) {
    throw new Error('사용자 정보 조회 실패', e)
  }
}

// 추천 콘텐츠 조회
const fetchRecommendedContentsByRiskType = async (riskType) => {
  try {
    const res = await axios.get(`/api/contents/recommend?riskType=${riskType}`, {
      withCredentials: true,
    })
    recommendedContentsByRisk.value = res.data
    console.log('✅ 성향 기반 추천 콘텐츠:', res.data)
  } catch (e) {
    console.error('❌ 추천 콘텐츠 조회 실패:', e)
    recommendedContentsByRisk.value = []
  }
}

const fetchAllRecommendedContents = async () => {
  try {
    const res = await axios.get('/api/learning/recommend/list', {
      withCredentials: true,
    })

    const noQuiz = res.data.filter((item) => !item.quizId && !item.hasQuiz)
    recommendedLearningContents.value = noQuiz.slice(0, 5)
    console.log('✅ 퀴즈 없는 콘텐츠 수:', noQuiz.length)
  } catch (e) {
    console.error('❌ 학습 목표 콘텐츠 조회 실패:', e)
    recommendedLearningContents.value = []
  }
}

// 학습 완료 수
const fetchCompletedLearningCount = async () => {
  try {
    const res = await axios.get('/api/learning/history/count', {
      withCredentials: true,
    })
    completedLearningCount.value = res.data
  } catch (e) {
    console.error('❌ 학습 완료 수 조회 실패:', e)
    completedLearningCount.value = 0
  }
}

// 누적 크레딧 조회
const fetchTotalCredit = async () => {
  try {
    const res = await axios.get('/api/learning/user/total-earned-credit', {
      withCredentials: true,
    })
    totalEarnedCredit.value = res.data
  } catch (e) {
    console.error('❌ 누적 크레딧 조회 실패:', e)
    totalEarnedCredit.value = 0
  }
}

watch(
  holdingsData,
  (val) => {
    console.log('holdingsData:', JSON.parse(JSON.stringify(val)))
  },
  { immediate: true, deep: true },
)

watch(
  stockPrices,
  (val) => {
    console.log('stockPrices:', JSON.parse(JSON.stringify(val)))
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.animate-bounce-smooth {
  animation: bounce-smooth 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
@keyframes bounce-smooth {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.swiper-wrapper {
  transition-timing-function: linear;
}
</style>
