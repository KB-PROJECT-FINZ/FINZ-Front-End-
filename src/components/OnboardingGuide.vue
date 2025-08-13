<template>
  <div
    v-if="showOnboarding"
    class="fixed inset-0 z-50 bg-white flex flex-col"
  >
    <!-- 상단 상태바 -->
    <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div class="text-sm text-gray-600">{{ getCurrentTime() }}</div>
      <button
        @click="skipOnboarding"
        class="text-blue-500 font-medium hover:text-blue-600 transition-colors"
      >
        건너뛰기
      </button>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <!-- 제목 영역 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ currentStep.title }}
        </h1>
        <p class="text-lg text-gray-600 leading-relaxed">
          {{ currentStep.subtitle }}
        </p>
      </div>

      <!-- 첫 번째와 마지막 단계는 심플한 카드, 나머지는 핀트 앱 스타일 -->
      <div v-if="currentStepIndex === 0 || currentStepIndex === steps.length - 1" 
           class="w-96 h-[400px] bg-blue-100 rounded-3xl shadow-2xl mb-8 flex flex-col items-center justify-center p-8">
        <!-- 첫 번째 단계 - 환영 화면 -->
        <div v-if="currentStepIndex === 0" class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">FINZ에 오신 것을 환영합니다!</h1>
          <p class="text-lg text-gray-700 mb-8">투자 초보자를 위한 맞춤형 금융 플랫폼</p>
          <button class="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
            시작하기
          </button>
        </div>
        
        <!-- 마지막 단계 - 시작 화면 -->
        <div v-else class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">이제 FINZ와 함께</h1>
          <p class="text-2xl font-bold text-gray-900 mb-2">투자 여정을</p>
          <p class="text-2xl font-bold text-gray-900 mb-8">시작해보세요!</p>
          <button class="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
            시작하기
          </button>
        </div>
      </div>

      <!-- 핀트 앱 스타일의 시뮬레이션된 폰 화면 (중간 단계들) -->
      <div v-else class="w-96 h-[500px] bg-white rounded-3xl shadow-2xl border-8 border-gray-100 overflow-hidden mb-8">
        <div class="w-full h-full bg-gray-50 p-4">
          <!-- 앱 헤더 -->
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium text-gray-700">{{ currentStep.appTitle }}</div>
            <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
          </div>

          <!-- 핀트 앱 스타일의 실제 UI 시뮬레이션 -->
          <div class="space-y-4">
            <!-- 첫 번째 섹션 -->
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-lg">{{ currentStep.content[0].icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900">{{ currentStep.content[0].title }}</div>
                  <div class="text-xs text-gray-500">{{ currentStep.content[0].description }}</div>
                </div>
              </div>
              <!-- 핀트 앱 스타일의 데이터 표시 -->
              <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div class="text-xs text-blue-800 font-medium mb-1">{{ currentStep.content[0].title }}</div>
                <div class="text-lg font-bold text-blue-900">{{ currentStep.content[0].value || '데이터' }}</div>
              </div>
            </div>

            <!-- 두 번째 섹션 -->
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-600 text-lg">{{ currentStep.content[1].icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900">{{ currentStep.content[1].title }}</div>
                  <div class="text-xs text-gray-500">{{ currentStep.content[1].description }}</div>
                </div>
              </div>
              <!-- 핀트 앱 스타일의 차트/그래프 시뮬레이션 -->
              <div class="bg-green-50 rounded-lg p-3 border border-green-100">
                <div class="flex items-center justify-between">
                  <div class="text-xs text-green-800 font-medium">{{ currentStep.content[1].title }}</div>
                  <div class="text-lg font-bold text-green-900">{{ currentStep.content[1].value || '수치' }}</div>
                </div>
                <!-- 간단한 차트 시뮬레이션 -->
                <div class="mt-2 h-8 bg-green-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: '70%' }"></div>
                </div>
              </div>
            </div>

            <!-- 세 번째 섹션 -->
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-purple-600 text-lg">{{ currentStep.content[2].icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900">{{ currentStep.content[2].title }}</div>
                  <div class="text-xs text-gray-500">{{ currentStep.content[2].description }}</div>
                </div>
              </div>
              <!-- 핀트 앱 스타일의 추가 정보 -->
              <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div class="text-xs text-purple-800 font-medium mb-1">{{ currentStep.content[2].title }}</div>
                <div class="text-sm text-purple-900">{{ currentStep.content[2].value || '정보' }}</div>
              </div>
            </div>
          </div>

          <!-- 추가 콘텐츠가 있다면 -->
          <div v-if="currentStep.additionalContent" class="mt-4">
            <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-yellow-600 text-lg">💡</span>
                <div class="text-sm text-yellow-800 font-medium">{{ currentStep.additionalContent.title }}</div>
              </div>
              <div class="text-xs text-yellow-700">{{ currentStep.additionalContent.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 진행률 표시 -->
      <div class="flex space-x-2 mb-8">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'w-3 h-3 rounded-full transition-colors duration-200',
            index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
          ]"
        ></div>
      </div>

      <!-- 하단 버튼 -->
      <div class="flex space-x-4 w-full max-w-sm">
        <button
          v-if="currentStepIndex > 0"
          @click="previousStep"
          class="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
        <button
          @click="nextStep"
          class="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          {{ currentStepIndex === steps.length - 1 ? '시작하기' : '다음' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  showOnboarding: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const currentStepIndex = ref(0)

const steps = [
  {
    title: 'FINZ에 오신 것을 환영합니다!',
    subtitle: '투자 초보자를 위한 맞춤형 금융 플랫폼',
    appTitle: 'FINZ',
    content: [
      {
        icon: '🎯',
        title: '맞춤형 투자',
        description: '개인 성향에 맞는 전략',
        value: '맞춤형'
      },
      {
        icon: '📱',
        title: '간편한 사용',
        description: '초보자도 쉽게',
        value: '간편함'
      },
      {
        icon: '🚀',
        title: '성장 가능성',
        description: '체계적인 투자 학습',
        value: '성장'
      }
    ]
  },
  {
    title: 'AI 투자 어시스턴트',
    subtitle: '투자 상담부터 종목 추천까지 언제든 물어보세요!',
    appTitle: 'AI 챗봇',
    content: [
      {
        icon: '🤖',
        title: 'AI 어시스턴트',
        description: '24시간 투자 상담',
        value: '24/7'
      },
      {
        icon: '💬',
        title: '실시간 대화',
        description: '자연스러운 상담',
        value: '실시간'
      },
      {
        icon: '📈',
        title: '맞춤 추천',
        description: '개인화된 투자 전략',
        value: '맞춤형'
      }
    ]
  },
  {
    title: '실전 연습 모의투자',
    subtitle: '실제 시장 데이터로 안전하게 투자 연습하기',
    appTitle: '모의투자',
    content: [
      {
        icon: '📱',
        title: '실시간 차트',
        description: 'KOSPI, NASDAQ 등',
        value: '실시간'
      },
      {
        icon: '💰',
        title: '가상 자금',
        description: '1억원으로 연습',
        value: '1억원'
      },
      {
        icon: '📊',
        title: '호가창',
        description: '실제 거래 환경',
        value: '실제환경'
      }
    ]
  },
  {
    title: '투자 지식 쌓기',
    subtitle: '성향별 맞춤 콘텐츠로 체계적으로 학습하기',
    appTitle: '학습',
    content: [
      {
        icon: '📖',
        title: '오늘의 콘텐츠',
        description: '매일 새로운 투자 지식'
      },
      {
        icon: '🎯',
        title: '성향별 추천',
        description: '내 투자 성향에 맞는 학습'
      },
      {
        icon: '🏆',
        title: '학습 크레딧',
        description: '1250P 보유'
      }
    ]
  },
  {
    title: '나만의 포트폴리오',
    subtitle: 'AI 분석 리포트로 투자 성과 한눈에 보기',
    appTitle: '자산 현황',
    content: [
      {
        icon: '💼',
        title: '총 자산',
        description: '17,757,632원'
      },
      {
        icon: '📈',
        title: '수익률',
        description: '+31.4%'
      },
      {
        icon: '🔍',
        title: 'AI 분석',
        description: '포트폴리오 진단'
      }
    ],
    additionalContent: {
      title: 'AI 분석 리포트',
      description: '시장 변화에 따른 자산 재배분 제안'
    }
  },
  {
    title: '다른 투자자와 비교',
    subtitle: '주간/월간 랭킹으로 투자 실력 확인하기',
    appTitle: '랭킹',
    content: [
      {
        icon: '🏆',
        title: '전체 순위',
        description: '3위'
      },
      {
        icon: '📊',
        title: '수익률',
        description: '+19.74%'
      },
      {
        icon: '📅',
        title: '주간 랭킹',
        description: '상위 40%'
      }
    ]
  },
  {
    title: '투자 일지 작성',
    subtitle: 'AI 피드백으로 투자 패턴 분석하기',
    appTitle: '투자 일지',
    content: [
      {
        icon: '✍️',
        title: '일일 기록',
        description: '투자 활동 기록'
      },
      {
        icon: '🤖',
        title: 'AI 피드백',
        description: '주간 투자 분석'
      },
      {
        icon: '📊',
        title: '패턴 분석',
        description: '투자 성향 파악'
      }
    ]
  },
  {
    title: '이제 FINZ와 함께',
    subtitle: '투자 여정을 시작해보세요!',
    appTitle: 'FINZ',
    content: [
      {
        icon: '🌟',
        title: '투자 여정',
        description: '함께 시작해요',
        value: '시작!'
      },
      {
        icon: '💪',
        title: '성장',
        description: '함께 성장해요',
        value: '성장!'
      },
      {
        icon: '🎉',
        title: '성공',
        description: '함께 성공해요',
        value: '성공!'
      }
    ]
  }
]

const currentStep = computed(() => steps[currentStepIndex.value])

const getCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  return `${displayHours}:${displayMinutes} ${ampm}`
}

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
  } else {
    completeOnboarding()
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const skipOnboarding = () => {
  completeOnboarding()
}

const completeOnboarding = () => {
  emit('close')
}


</script>

<style scoped>
/* 추가 스타일링이 필요한 경우 */
</style>
