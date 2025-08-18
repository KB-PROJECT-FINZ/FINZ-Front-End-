<template>
  <div class="min-h-screen bg-white px-6 pt-4 pb-16 max-w-[430px] mx-auto relative">
    <!-- Header -->
    <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
      <div class="font-bold text-black text-lg">finz</div>
      <div class="flex items-center gap-2">
        <button
          class="text-xs text-[#2165C2] border border-[#2165C2]/50 rounded-full px-2 py-0.5"
          @click="restart"
        >
          처음부터
        </button>
        <span class="text-xs text-gray-500">{{ currentIndex + 1 }}/{{ questions.length }}</span>
      </div>
    </div>

    <p class="font-semibold text-sm text-gray-800 mb-1">투자성향 테스트</p>

    <!-- Progress Bar -->
    <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
      <div
        class="bg-[#2165C2] h-full transition-all duration-300"
        :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
      />
    </div>

    <!-- Dot Indicator -->
    <div class="flex justify-center mb-6 gap-2">
      <span
        v-for="(q, i) in questions"
        :key="i"
        class="w-2 h-2 rounded-full"
        :class="i === currentIndex ? 'bg-[#2165C2]' : 'bg-gray-200'"
      ></span>
    </div>

    <!-- 질문 -->
    <p class="text-center font-semibold text-base mb-6">
      {{ currentQuestion.question }}
    </p>

    <!-- 선택지 -->
    <div class="space-y-4">
      <button
        class="w-full py-3 text-sm font-semibold bg-white rounded-2xl shadow-md hover:shadow-lg active:translate-y-[1px] transition border border-gray-100"
        @click="select('A')"
      >
        A. {{ currentQuestion.a }}
      </button>
      <button
        class="w-full py-3 text-sm font-semibold bg-white rounded-2xl shadow-md hover:shadow-lg active:translate-y-[1px] transition border border-gray-100"
        @click="select('B')"
      >
        B. {{ currentQuestion.b }}
      </button>
    </div>

    <!-- 도움말 -->
    <p class="text-xs text-center text-gray-500 mt-6">💡 더 가깝게 느껴지는 선택지를 골라주세요</p>
    <p class="text-[11px] text-[#2165C2] text-center absolute bottom-3 left-0 right-0">
      🔐 정확한 결과를 위해 솔직하게 답변해주세요
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentIndex = ref(0)
const answers = ref([])

import { useRoute } from 'vue-router'
const route = useRoute()
const username = route.query.username

const questions = [
  {
    question: '당신은 자산의 변동성이 클 때 어떻게 반응하나요?',
    a: '원금을 지키기 위해 매도',
    b: '더 싸지면 추가 매수',
  },
  {
    question: '투자 기간은 보통 얼마로 잡나요?',
    a: '1년 이상 장기',
    b: '1개월~3개월 단기',
  },
  {
    question: '하루에 수익률을 얼마나 자주 확인하나요?',
    a: '거의 안 봄',
    b: '자주 확인함',
  },
  {
    question: '‘좋은 정보’라고 생각되는 것이 있다면?',
    a: '전문가 분석 리포트',
    b: '커뮤니티 급등 정보',
  },
  {
    question: 'ETF와 개별 종목 중 무엇을 선호하나요?',
    a: 'ETF',
    b: '개별 주식',
  },
  {
    question: '수익률 -5%일 때의 반응은?',
    a: '지켜본다',
    b: '일부 손절 또는 갈아탄다',
  },
  {
    question: '주로 어떤 기준으로 종목을 고르나요?',
    a: '실적 / 재무 지표',
    b: '차트 흐름 / 테마',
  },
  {
    question: '뉴스/유튜버의 영향은?',
    a: '참고만 한다',
    b: '크게 영향을 받는다',
  },
  {
    question: '‘고점’이 보이는 종목이 인기일 때?',
    a: '리스크 높다고 판단',
    b: '지금이라도 타야지',
  },
  {
    question: '당신의 투자 목적은?',
    a: '자산을 안정적으로 늘리기',
    b: '짧은 시간 고수익 노리기',
  },
  {
    question: '관심 있는 투자 테마는?',
    a: 'ESG, 인덱스',
    b: 'AI, 로봇, 전기차 등',
  },
  {
    question: '지금 1000만 원이 있다면?',
    a: 'ETF, 우량주 분산',
    b: '테마주에 몰빵',
  },
]

const currentQuestion = computed(() => questions[currentIndex.value])

const select = (choice) => {
  answers.value.push(choice)

  if (currentIndex.value < questions.length - 1) {
    currentIndex.value++
  } else {
    const score = answers.value.filter((ans) => ans === 'B').length
    const typeCode = determineType(score)
    console.log('점수:', score, '유형:', typeCode)

    // 결과 페이지로 이동 시 typeCode 전달
    router.push({
      name: 'InvestmentResult',
      query: {
        type: typeCode,
        username: username,
      },
    })
  }
}

const restart = () => {
  currentIndex.value = 0
  answers.value = []
}

// 투자 성향 점수에 따른 유형 매핑
const determineType = (score) => {
  if (score <= 1) return 'CSD'
  if (score <= 3) return 'CAG'
  if (score === 4) return 'BSS'
  if (score === 5) return 'BGT'
  if (score === 6) return 'AID'
  if (score === 7) return 'AGR'
  if (score === 8) return 'EXP'
  if (score === 9) return 'FAD'
  if (score === 10) return 'SYS'
  if (score === 11) return 'DTA'
  if (score === 12) {
    // 추가 질문을 통해 분기할 수도 있음
    return 'TEC'
  }
  return 'UNKNOWN'
}
</script>
