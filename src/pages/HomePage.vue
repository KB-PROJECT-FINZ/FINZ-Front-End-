<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <!-- 상단 로고 + 인사말 -->
    <div class="px-5 pt-6">
      <img src="@/assets/finz.png" alt="finz" class="w-12 mb-2" />
      <p class="text-lg font-bold">
        안녕하세요! <span class="font-black">{{ name }}</span
        >님! 👍
      </p>
      <p class="text-sm text-gray-600 mb-2">오늘도 화이팅 해볼까요?</p>

      <!-- 내 투자 상태 카드 -->
      <div class="grid grid-cols-2 gap-3 px-5 mt-6 mb-4">
        <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">보유 현금</p>
          <p class="font-bold text-gray-600">
            {{ safeNumber(userAccount.currentBalance).toLocaleString() }}원
          </p>
        </div>
        <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">보유 크레딧</p>
          <p class="font-bold text-gray-600">{{ asset.amount }}C</p>
        </div>

        <!-- <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">완료한 학습</p>
          <p class="font-semibold text-gray-600">{{ completedLearningCount }}개</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-xl border-black">
          <p class="text-sm text-gray-600 font-medium text-black mb-1">모의투자 수익</p>
          <p class="font-semibold text-gray-600">
            {{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%
          </p>
        </div> -->
      </div>

      <!-- 내 종목보기 카드 전체를 버튼으로, 좌측 정렬 및 아이콘 추가 -->
      <button
        class="bg-white rounded-xl mx-4 mb-5 overflow-hidden border border-gray-200"
        @click="goToAssetStatus"
        style="display: block"
      >
        <div class="px-5 py-6">
          <div class="flex items-center mb-3">
            <span class="font-semibold text-base text-gray-900">내 종목보기</span>
            <svg
              class="w-6 h-6 ml-2 text-gray-400"
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
            <div class="text-lg font-bold text-gray-900 mb-1">
              {{ stockValue.toLocaleString() }}원
            </div>
            <div class="text-base font-semibold mb-1">
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
              <span class="ml-2 text-gray-500">
                ({{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%)
              </span>
            </div>
          </div>
        </div>
      </button>

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

      <!-- 내 투자내역 카드 -->
      <section class="bg-white rounded-xl mx-4 mb-5 overflow-hidden border border-gray-200">
        <div
          class="flex items-center justify-between bg-gray-50 px-5 py-4 border-b border-gray-200"
        >
          <div class="text-base font-bold text-gray-900">내 투자내역</div>
          <button
            class="bg-white text-black border border-gray-300 rounded px-3 py-1 text-sm font-medium hover:bg-gray-100 transition"
            @click="goToTransactions"
          >
            최근 투자 내역 바로가기
          </button>
        </div>

        <div class="px-5 py-4">
          <!-- 로딩 중 -->
          <div v-if="!dataLoaded">
            <div class="text-sm font-bold text-red-600 mb-2 pl-1">매수 내역</div>
            <div class="flex flex-col gap-2 mb-4">
              <div
                v-for="i in 2"
                :key="i"
                class="w-full h-10 bg-gray-200 rounded animate-pulse"
              ></div>
            </div>
            <div class="text-sm font-bold text-blue-600 mb-2 pl-1">매도 내역</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="i in 2"
                :key="i"
                class="w-full h-10 bg-gray-200 rounded animate-pulse"
              ></div>
            </div>
          </div>

          <!-- 실제 데이터 -->
          <div v-else>
            <!-- 매수 -->
            <div class="mb-4">
              <div class="text-sm font-bold text-red-600 mb-2 pl-1">매수 내역</div>
              <div v-if="buyHistory.length === 0" class="text-sm text-gray-500 text-center py-4">
                매수 내역이 없습니다
              </div>
              <div v-else>
                <div
                  v-for="(item, index) in buyHistory"
                  :key="`buy-${index}`"
                  class="flex items-center justify-between px-3 py-3 shadow border-l-4 border-red-600 rounded-lg mb-2"
                >
                  <div class="flex items-center">
                    <div
                      class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3"
                    >
                      <img
                        v-if="item.imageUrl && !imageErrors[item.stockCode]"
                        :src="item.imageUrl"
                        class="w-full h-full object-cover"
                        @error="handleImageError(item.stockCode)"
                      />
                      <span v-else class="text-xs font-bold" style="color: #2272eb">
                        {{ getStockInitial(item.name) }}
                      </span>
                    </div>
                    <div class="flex flex-col">
                      <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
                      <div class="text-xs text-gray-500">{{ item.desc }}</div>
                    </div>
                  </div>
                  <div class="text-sm font-bold text-gray-900">
                    {{ item.amount.toLocaleString() }}원
                  </div>
                </div>
              </div>
            </div>

            <!-- 매도 -->
            <div>
              <div class="text-sm font-bold text-blue-600 mb-2 pl-1">매도 내역</div>
              <div v-if="sellHistory.length === 0" class="text-sm text-gray-500 text-center py-4">
                매도 내역이 없습니다
              </div>
              <div v-else>
                <div
                  v-for="(item, index) in sellHistory"
                  :key="`sell-${index}`"
                  class="flex items-center justify-between px-3 py-3 shadow border-l-4 border-blue-600 rounded-lg mb-2"
                >
                  <div class="flex items-center">
                    <div
                      class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3"
                    >
                      <img
                        v-if="item.imageUrl && !imageErrors[item.stockCode]"
                        :src="item.imageUrl"
                        class="w-full h-full object-cover"
                        @error="handleImageError(item.stockCode)"
                      />
                      <span v-else class="text-xs font-bold" style="color: #2272eb">
                        {{ getStockInitial(item.name) }}
                      </span>
                    </div>
                    <div class="flex flex-col">
                      <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
                      <div class="text-xs text-gray-500">{{ item.desc }}</div>
                    </div>
                  </div>
                  <div class="text-sm font-bold text-gray-900">
                    {{ item.amount.toLocaleString() }}원
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 프로필 주요 정보: 총 보유자산 -->
      <div class="px-5 mt-6">
        <!-- 총 보유자산 -->
        <section class="bg-white rounded-xl mb-5 px-5 py-5 border border-gray-200">
          <div class="text-gray-500 text-sm mb-2">총 보유자산</div>
          <div v-if="!dataLoaded" class="flex items-center justify-between mb-1">
            <div class="w-40 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-32 h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div v-else class="flex items-baseline gap-x-4 mb-4">
            <span class="text-[28px] font-bold text-gray-900 leading-none">
              {{ calculatedTotalAssetValue.toLocaleString() }}원
            </span>
            <span
              :class="
                calculatedProfitRate > 0
                  ? 'text-red-600'
                  : calculatedProfitRate < 0
                    ? 'text-blue-600'
                    : 'text-gray-600'
              "
              class="text-base font-medium leading-none"
            >
              {{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%
            </span>
          </div>
          <div class="flex justify-center">
            <button
              class="bg-blue-600 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-blue-800 transition"
              style="width: 320px"
              @click="goToAssetStatus"
            >
              내 자산 현황 바로가기
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- 오늘의 할 일 -->
    <div class="px-5 mt-6">
      <h2 class="text-md font-bold mb-2">오늘의 할 일</h2>
      <div class="text-white rounded-xl p-4 mb-4" style="background-color: #fab809">
        <div class="flex justify-between items-center mb-1">
          <p class="font-semibold">오늘의 학습 목표</p>
          <button
            class="text-sm bg-white text-purple-600 px-3 py-1 rounded-full font-bold"
            @click="goToStudy"
          >
            시작하기
          </button>
        </div>
        <ul class="mt-2 space-y-1 text-sm list-disc list-inside">
          <li
            v-for="item in recommendedLearningContents.slice(0, 2)"
            :key="item.contentId"
            class="text-white"
          >
            {{ item.title }}
          </li>
          <li v-if="recommendedLearningContents.length === 0" class="text-white">
            학습 콘텐츠 없음
          </li>
        </ul>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white p-4 rounded-xl shadow-sm text-center">
          <p class="text-xs text-gray-500 mb-1">오늘의 퀴즈</p>
          <p class="font-semibold text-orange-400">+500 크레딧</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm text-center">
          <p class="text-xs text-gray-500 mb-1">투자 요약</p>
          <p class="font-semibold text-green-500">+2.1% 오늘</p>
        </div>
      </div>
    </div>

    <!-- 추천 콘텐츠 -->
    <div class="px-5 mt-6">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-md font-bold">{{ riskTypeName }}에게 추천 콘텐츠</h2>
        <button class="text-xs text-gray-400 underline" @click="goToContents">전체보기</button>
      </div>

      <div class="grid grid-cols-2 gap-3 place-items-center">
        <div
          v-for="(item, index) in recommendedContentsByRisk.filter(
            (item) => !item.quizId && !item.hasQuiz,
          )"
          :key="item.contentId"
          class="min-w-[160px] bg-white p-3 rounded-xl shadow-sm shrink-0 cursor-pointer"
          @click="openContentModal(item)"
        >
          <p
            :class="
              index % 2 === 0
                ? 'text-purple-600 text-base font-bold'
                : 'text-blue-600 text-base font-bold'
            "
            class="mb-1"
          >
            {{ item.label || '추천' }}
          </p>
          <p class="text-sm font-semibold">{{ item.title }}</p>
        </div>
      </div>
    </div>

    <!-- 빠른 실행 -->
    <div class="px-5 mt-6">
      <h2 class="text-md font-bold mb-2">빠른 실행</h2>
      <div class="grid grid-cols-2 gap-3">
        <!-- 오늘의 퀴즈 모달 트리거 버튼 -->
        <button
          @click="showQuizModal = true"
          class="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer"
        >
          <p class="font-bold">오늘의 퀴즈 보기</p>
          <p class="text-sm text-gray-400">5개</p>
        </button>

        <!-- 퀴즈 모달창 -->
        <transition name="fade-scale">
          <div
            v-if="showQuizModal"
            class="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              class="bg-white w-full max-w-md max-h-[80vh] rounded-xl shadow-2xl relative overflow-hidden"
            >
              <!-- 닫기 버튼 -->
              <button
                @click="showQuizModal = false"
                class="absolute top-4 right-5 text-gray-500 hover:text-black z-10"
              >
                ✕
              </button>

              <!-- 내부 콘텐츠 -->
              <div class="p-5 pt-10 overflow-y-auto h-full">
                <h2 class="text-lg font-bold mb-2 text-purple-600">📝 오늘의 퀴즈</h2>
                <p class="text-sm text-gray-500 mb-4">매일 퀴즈로 금융 감각을 키워보세요!</p>

                <!-- ✅ 퀴즈 목록 최대 5개 + 클릭 시 상세 이동 -->
                <div
                  v-for="item in recommendedLearningContents"
                  :key="item.contentId"
                  class="mb-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  @click="goToDetail(item.contentId)"
                >
                  <p class="text-xs text-yellow-600 font-bold mb-1">{{ item.credit }} 크레딧</p>
                  <p class="font-semibold text-gray-800">{{ item.title }}</p>
                </div>

                <!-- 퀴즈 없을 때 -->
                <div v-if="quizList.length === 0" class="text-gray-400 text-sm text-center">
                  오늘의 퀴즈가 없습니다.
                </div>
              </div>
            </div>
          </div>
        </transition>

        <div
          class="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer"
          @click="goToPortfolio"
        >
          <p class="font-bold">포트폴리오</p>
          <p class="text-sm text-gray-400">수익률 확인</p>
        </div>
      </div>
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

const asset = ref({ amount: 0 })
// ...existing code...
// --- 내 투자내역 카드 관련 상태 및 함수 ---
const buyHistory = ref([])
const sellHistory = ref([])
const imageErrors = ref({})

const goToTransactions = () => router.push('/mock-trading/transactions')

const handleImageError = (code) => {
  imageErrors.value[code] = true
}

const getStockInitial = (name) => {
  return name ? name[0] : '?'
}

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
import BottomNav from '@/components/FooterNavigation.vue'

const selectedContent = ref(null)
const showQuizModal = ref(false)
const quizList = ref([])

function goToDetail(id) {
  router.push(`/learning/${id}`)
}

const openContentModal = (item) => {
  selectedContent.value = item
}

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

const calculatedTotalAssetValue = computed(() => safeNumber(userAccount.value.totalAssetValue, 0))

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

// 페이지 이동
const goToStudy = () => router.push('/learning')
const goToContents = () => router.push('/recommend')

const goToPortfolio = () => router.push('/mock-trading/asset-status')

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
