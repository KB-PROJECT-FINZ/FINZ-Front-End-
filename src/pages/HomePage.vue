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
        <p class="font-semibold text-indigo-500">15,420</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">완료한 학습</p>
        <p class="font-semibold text-green-500">23개</p>
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
        <h2 class="text-md font-bold">적극투자형에게 추천하는 콘텐츠</h2>
        <button class="text-xs text-gray-400 underline" @click="goToContents">전체보기</button>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-1">
        <!-- 콘텐츠 카드 -->
        <div class="min-w-[160px] bg-white p-3 rounded-xl shadow-sm shrink-0">
          <p class="text-xs font-bold text-purple-600 mb-1">성장주식</p>
          <p class="text-sm font-semibold">성장주 투자 핵심 포인트</p>
        </div>
        <div class="min-w-[160px] bg-white p-3 rounded-xl shadow-sm shrink-0">
          <p class="text-xs font-bold text-blue-600 mb-1">백서추천</p>
          <p class="text-sm font-semibold">스타트업 투자 가이드</p>
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

    <!-- 개발자 도구 -->
    <div class="px-5 mt-6">
      <h2 class="text-md font-bold mb-2">개발자 도구</h2>
      <div class="grid grid-cols-1 gap-3">
        <button
          @click="navigateToChart"
          class="bg-blue-500 text-white p-4 rounded-xl text-center hover:bg-blue-600 transition-colors"
        >
          <p class="font-bold">차트 보기</p>
          <p class="text-sm opacity-80">캔들스틱 차트</p>
        </button>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <div>
      <router-view />
      <BottomNav />
      <!-- 하단 고정 바 -->
    </div>
  </div>
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

// 세션 기반 사용자 정보 불러오기
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/me', {
      withCredentials: true,
    })

    const user = response.data
    name.value = user.name
    userName.value = user.username
    riskTypeName.value = convertRiskTypeToName(user.riskType)
  } catch (e) {
    console.error('세션 정보 불러오기 실패:', e)
    router.push('/login-form')
  }
})

function convertRiskTypeToName(code) {
  const map = {
    CSD: '신중한 안정형',
    CAG: '신중한 성장형',
    BSS: '균형 잡힌 수익 추구형',
    BGT: '균형 잡힌 도전형',
    AID: '적극적 안정형',
    AGR: '적극적 성장형',
    EXP: '실험적 모험가형',
    FAD: '감정적 결정형',
    SYS: '시스템 트레이더형',
  }
  return map[code] || '미분류'
}

// 페이지 이동용
const goToStudy = () => router.push('/learning')
const goToContents = () => router.push('/contents')
const goToQuiz = () => router.push('/quiz')
const goToPortfolio = () => router.push('/portfolio')
</script>
