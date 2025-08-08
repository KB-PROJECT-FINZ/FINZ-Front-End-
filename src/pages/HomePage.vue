<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <!-- 상단 로고 + 인사말 -->
    <div class="px-5 pt-6">
      <img src="@/assets/finz.png" alt="finz" class="w-16 mb-2" />
      <p class="text-lg font-bold">
        안녕하세요! <span class="font-black">{{ name }}</span
        >님! 👍
      </p>
      <p class="text-sm text-gray-600">오늘도 화이팅 해볼까요?</p>
    </div>

    <!-- 내 투자 상태 카드 -->
    <div class="grid grid-cols-2 gap-3 px-5 mt-6">
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">내 투자 성향</p>
        <p class="font-semibold text-purple-600">{{ riskTypeName }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">누적 크레딧</p>
        <p class="font-semibold text-indigo-500">{{ totalEarnedCredit }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">완료한 학습</p>
        <p class="font-semibold text-green-500">{{ completedLearningCount }}개</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">모의투자 수익</p>
        <p class="font-semibold text-blue-500">{{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%</p>
      </div>
    </div>

    <!-- 오늘의 할 일 -->
    <div class="px-5 mt-6">
      <h2 class="text-md font-bold mb-2">오늘의 할 일</h2>
      <div class="bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-xl p-4 mb-4">
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
import BottomNav from '@/components/FooterNavigation.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useAssetDataStore } from '@/services/useAssetData'

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

// 자산 데이터 스토어
const { calculatedProfitRate, loadUserData } = useAssetDataStore()

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
    const riskType = await fetchUserInfo() //
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
    throw new Error('사용자 정보 조회 실패')
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
</style>
