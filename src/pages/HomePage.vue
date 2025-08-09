<template>
  <div class="min-h-screen pb-20">
    <!-- 상단 로고 + 인사말 -->
    <div class="px-5 pt-6">
      <img src="@/assets/finz.png" alt="finz" class="mx-5 w-12 mb-2" />
      <p class="text-lg font-normal mx-5">
        안녕하세요, <span class="font-black">{{ name }}</span
        >님!
      </p>

      <!-- 내 투자 상태 카드 -->
      <div class="grid grid-cols-2 gap-3 px-5 mt-2 mb-4">
        <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">보유 현금</p>
          <p class="font-bold text-gray-700">
            {{ safeNumber(userAccount.currentBalance).toLocaleString() }}원
          </p>
        </div>
        <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">보유 크레딧</p>
          <p class="font-bold text-gray-700">{{ asset.amount }}C</p>
        </div>
      </div>

      <!-- 내 종목보기 카드 전체를 버튼으로, 좌측 정렬 및 아이콘 추가 -->
      <button
        class="mx-6 w-80 max-w-[420px] bg-white rounded-xl mb-2 overflow-hidden"
        @click="goToAssetStatus"
        style="display: block"
      >
        <div class="py-4">
          <div class="flex items-center mb-1">
            <span class="font-bold text-base text-gray-900">내 종목보기</span>
            <svg
              class="w-5 h-5 text-gray-700"
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

      <!-- 종목 정렬 옵션 셀렉트 + 현재가/평가금 토글 -->
      <div v-if="holdingsData && holdingsData.length > 0" class="mx-6 mb-2">
        <div class="flex items-center justify-between">
          <!-- 정렬 드롭다운 -->
          <div class="relative inline-block" ref="sortDropdownRoot">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="px-0 py-2 text-sm font-medium rounded-md bg-white text-gray-700 flex items-center gap-1 min-w-[120px]"
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
                    class="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded-md"
                    :class="currentSort === sort.key ? 'text-blue-600 font-bold' : 'text-gray-700'"
                  >
                    {{ sort.label }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <!-- 현재가/평가금 토글 버튼 (오른쪽 정렬) -->
          <div class="flex items-center ml-2">
            <div class="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 flex-nowrap">
              <button
                :class="[
                  showPriceType === 'current'
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200',
                  'px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[56px] h-7',
                ]"
                @click="showPriceType = 'current'"
                type="button"
                style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
              >
                현재가
              </button>
              <button
                :class="[
                  showPriceType === 'value'
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200',
                  'px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[56px] h-7',
                ]"
                @click="showPriceType = 'value'"
                type="button"
                style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
              >
                평가금
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 내 종목 간단 카드 리스트 -->
      <div v-if="holdingsData && holdingsData.length > 0" class="mx-6 mb-5">
        <div
          v-for="holding in sortedHoldings"
          :key="holding.stockCode"
          class="p-0 mb-5 bg-white rounded-xl cursor-pointer transition-colors hover:bg-gray-50 hover:rounded-xl"
          @click="goToStockDetail(holding.stockCode, holding.stockName)"
        >
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
                <!-- 기존 평가손익/수익률 표시 -->
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
                <!-- 전일 대비 변동 금액/변동률 표시 -->
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
        </div>
      </div>

      <!-- 학습 안내 컨테이너 -->
      <!-- <div class="bg-white rounded-2xl shadow px-5 py-4 flex flex-col items-center mb-4">
        <div class="w-full flex flex-col items-left">
          <p class="text-base mb-2 text-gray-800">
            <span class="font-extrabold">{{ name }}</span
            ><span class="font-medium">님,</span><br />
            <span class="font-medium">오늘의 학습 목표예요</span>
          </p>
          <div class="my-2 flex justify-center">
            <svg
              class="w-12 h-12 animate-bounce-smooth"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="8" y="16" width="32" height="20" rx="6" fill="#fbbf24" />
              <rect x="14" y="22" width="20" height="8" rx="3" fill="#fff" />
              <path d="M24 16v-4" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="24" cy="10" r="3" fill="#fbbf24" />
            </svg>
          </div>
        </div>
        <button
          class="mt-3 bg-yellow-400 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-yellow-500 transition-all text-sm w-full max-w-xs"
          style="border-radius: 0.5rem"
          @click="goToStudy"
        >
          학습 시작하기
        </button>
      </div> -->

      <!-- 여기에 최근 거래 내역, 거래 대기 중인 목록 가져오는 가로 버튼 만들기 -->
    </div>

    <div>
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
import { getUserCredit } from '@/services/learning'
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
import BottomNav from '@/components/FooterNavigation.vue'
import { useHoldingsData } from '@/services/useHoldingsData'

// --- 내 투자내역 카드 관련 상태 및 함수 ---
const asset = ref({ amount: 0 })
const buyHistory = ref([])
const sellHistory = ref([])
const imageErrors = ref({})

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
const showPriceType = ref('current') // 'current' | 'value'

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

const sortOptions = [
  { key: 'name', label: '가나다 순' },
  { key: 'profitRateAsc', label: '총 수익률 낮은 순' },
  { key: 'profitRateDesc', label: '총 수익률 높은 순' },
  { key: 'valueAsc', label: '평가손익 낮은 순' },
  { key: 'valueDesc', label: '평가손익 높은 순' },
]

const currentSort = ref('name')
function changeSortOption(key) {
  currentSort.value = key
}

const sortedHoldings = computed(() => {
  const holdings = holdingsData.value || []
  const prices = stockPrices.value || {}
  if (!holdings.length) return []
  const priceType = showPriceType.value
  const sortKey = currentSort.value

  let arr = [...holdings]
  switch (sortKey) {
    case 'name':
      arr.sort((a, b) => (a.stockName || '').localeCompare(b.stockName || '', 'ko'))
      break

    case 'profitRateDesc':
      arr.sort((a, b) => {
        if (priceType === 'value') {
          // 평가금 기준 수익률: (평가금-매입금)/매입금*100
          const aBuy = a.avgBuyPrice * a.quantity
          const bBuy = b.avgBuyPrice * b.quantity
          const aEval = a.currentPrice * a.quantity
          const bEval = b.currentPrice * b.quantity
          const aRate = aBuy ? ((aEval - aBuy) / aBuy) * 100 : -Infinity
          const bRate = bBuy ? ((bEval - bBuy) / bBuy) * 100 : -Infinity
          return bRate - aRate
        } else {
          // 현재가 기준: 실시간 prdy_ctrt
          const aRate = Number(prices[a.stockCode]?.prdy_ctrt ?? -Infinity)
          const bRate = Number(prices[b.stockCode]?.prdy_ctrt ?? -Infinity)
          return bRate - aRate
        }
      })
      break

    case 'profitRateAsc':
      arr.sort((a, b) => {
        if (priceType === 'value') {
          const aBuy = a.avgBuyPrice * a.quantity
          const bBuy = b.avgBuyPrice * b.quantity
          const aEval = a.currentPrice * a.quantity
          const bEval = b.currentPrice * b.quantity
          const aRate = aBuy ? ((aEval - aBuy) / aBuy) * 100 : Infinity
          const bRate = bBuy ? ((bEval - bBuy) / bBuy) * 100 : Infinity
          return aRate - bRate
        } else {
          const aRate = Number(prices[a.stockCode]?.prdy_ctrt ?? Infinity)
          const bRate = Number(prices[b.stockCode]?.prdy_ctrt ?? Infinity)
          return aRate - bRate
        }
      })
      break

    case 'valueDesc':
      arr.sort((a, b) => {
        if (priceType === 'value') {
          // 평가손익: (평가금 - 매입금)
          const aVal = a.currentPrice * a.quantity - a.avgBuyPrice * a.quantity
          const bVal = b.currentPrice * b.quantity - b.avgBuyPrice * b.quantity
          return bVal - aVal
        } else {
          // 현재가 기준: 실시간 inter2_prdy_vrss
          const aVal = Number(prices[a.stockCode]?.inter2_prdy_vrss ?? -Infinity)
          const bVal = Number(prices[b.stockCode]?.inter2_prdy_vrss ?? -Infinity)
          return bVal - aVal
        }
      })
      break

    case 'valueAsc':
      arr.sort((a, b) => {
        if (priceType === 'value') {
          const aVal = a.currentPrice * a.quantity - a.avgBuyPrice * a.quantity
          const bVal = b.currentPrice * b.quantity - b.avgBuyPrice * b.quantity
          return aVal - bVal
        } else {
          const aVal = Number(prices[a.stockCode]?.inter2_prdy_vrss ?? Infinity)
          const bVal = Number(prices[b.stockCode]?.inter2_prdy_vrss ?? Infinity)
          return aVal - bVal
        }
      })
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

onMounted(async () => {
  await fetchHoldings()
  document.addEventListener('click', handleClickOutside)
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

const router = useRouter()

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

const goToAssetStatus = () => router.push('/mock-trading/asset-status')

// 상태 변수
const name = ref('')
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
    name.value = user.name
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
</style>
