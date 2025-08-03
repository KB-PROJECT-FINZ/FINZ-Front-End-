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
        <p class="font-semibold text-blue-500">+12.8%</p>
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
        <p class="text-sm">투자 기초 개념 2개 학습하기</p>
        <div class="h-2 bg-white/30 rounded-full mt-3">
          <div class="h-full bg-white rounded-full w-1/2"></div>
        </div>
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

      <div class="flex gap-3 overflow-x-auto pb-1">
        <div
          v-for="(item, index) in recommendedContents"
          :key="item.id"
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
            {{ item.label }}
          </p>
          <p class="text-sm font-semibold">{{ item.title }}</p>
        </div>
      </div>
    </div>

    <!-- 빠른 실행 -->
    <div class="px-5 mt-6">
      <h2 class="text-md font-bold mb-2">빠른 실행</h2>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer" @click="goToQuiz">
          <p class="font-bold">오늘의 퀴즈</p>
          <p class="text-sm text-gray-400">5문제 남음</p>
        </div>
        <div
          class="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer"
          @click="goToPortfolio"
        >
          <p class="font-bold">포트폴리오</p>
          <p class="text-sm text-gray-400">수익률 확인</p>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <div>
      <router-view />
      <BottomNav />
      <!-- 하단 고정 바 -->
    </div>
  </div>
  <transition name="fade-scale">
    <div
      v-if="selectedContent"
      class="fixed inset-0 bg-gray-300/40 z-50 flex items-center justify-center"
    >
      <div
        class="bg-white p-6 rounded-xl w-[90%] max-w-md relative shadow-2xl ring-1 ring-gray-200 transition-all duration-300 ease-in-out"
      >
        <p v-if="selectedContent.label" class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {{ selectedContent.label }}
        </p>
        <h2 class="text-lg font-bold mb-1" :class="selectedContent.titleColor">
          {{ selectedContent.title }}
        </h2>
        <div class="border-b border-gray-300 my-3"></div>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedContent.content }}</p>
        <button
          class="absolute top-3 right-4 text-gray-500 hover:text-black"
          @click="selectedContent = null"
        >
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import BottomNav from '@/components/FooterNavigation.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref, onMounted } from 'vue'

const router = useRouter()

// 사용자 데이터
const name = ref('')
const userName = ref('')
const riskTypeName = ref('')
const totalEarnedCredit = ref(0) // 누적 크레딧 추가
const completedLearningCount = ref(0)

// 세션 기반 사용자 정보 불러오기
onMounted(async () => {
  try {
    // 사용자 정보 요청
    const response = await axios.get('http://localhost:8080/api/auth/me', {
      withCredentials: true,
    })

    const user = response.data
    name.value = user.name
    userName.value = user.username
    riskTypeName.value = convertRiskTypeToName(user.riskType)

    // 학습 완료 수 조회
    const countRes = await axios.get('http://localhost:8080/api/learning/history/count', {
      withCredentials: true,
    })
    completedLearningCount.value = countRes.data

    // 누적 크레딧 조회
    try {
      const creditResponse = await axios.get(
        'http://localhost:8080/api/learning/user/total-earned-credit',
        { withCredentials: true },
      )
      totalEarnedCredit.value = creditResponse.data
    } catch (error) {
      console.log('누적 크레딧 조회 실패:', error)
      totalEarnedCredit.value = 0
    }

    // 추천 콘텐츠 조회
    try {
      const contentRes = await axios.get(
        `http://localhost:8080/api/contents/recommend?riskType=${user.riskType}`,
        { withCredentials: true },
      )
      console.log('추천 콘텐츠:', contentRes.data)
      recommendedContents.value = contentRes.data
    } catch (error) {
      console.error('추천 콘텐츠 조회 실패:', error)
    }
  } catch (e) {
    console.error('세션 정보 불러오기 실패:', e)
    router.push('/login-form')
  }
})

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

const selectedContent = ref(null)

const recommendedContents = ref([])

function openContentModal(item) {
  selectedContent.value = item
}

// 페이지 이동용
const goToStudy = () => router.push('/learning')
const goToContents = () => router.push('/recommend')
const goToQuiz = () => router.push('/quiz')
const goToPortfolio = () => router.push('/mock-trading/asset-status')
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
