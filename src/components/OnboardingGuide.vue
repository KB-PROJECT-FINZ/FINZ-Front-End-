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

      <!-- 첫 번째와 마지막 단계는 모바일 앱 온보딩 화면, 나머지는 핀트 앱 스타일 -->
      <!-- 첫 번째와 마지막 단계는 웹 사이즈, 나머지는 핀트 앱 스타일 -->
      <div v-if="currentStepIndex === 0 || currentStepIndex === steps.length - 1" 
           class="bg-sky-50 min-h-screen flex flex-col items-center justify-center p-6">
        <!-- 첫 번째 단계 - 환영 화면 (웹 사이즈) -->
        <div v-if="currentStepIndex === 0" class="text-center w-full max-w-md mx-auto">
          <h1 class="text-4xl font-bold text-gray-900 mb-6 leading-tight">FINZ에 오신 것을<br>환영합니다!</h1>
          <p class="text-xl text-gray-700 mb-12 leading-relaxed">투자 초보자를 위한<br>맞춤형 금융 플랫폼</p>
          <button 
            @click="nextStep"
            class="bg-blue-600 text-white w-full max-w-sm py-5 rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            시작하기
          </button>
        </div>
        
        <!-- 마지막 단계 - 시작 화면 (웹 사이즈) -->
        <div v-else class="text-center w-full max-w-md mx-auto">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">이제 FINZ와 함께</h1>
          <p class="text-3xl font-bold text-gray-900 mb-2">투자 여정을</p>
          <p class="text-3xl font-bold text-gray-900 mb-12">시작해보세요!</p>
          <button 
            @click="nextStep"
            class="bg-blue-600 text-white w-full max-w-sm py-5 rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            시작하기
          </button>
        </div>
      </div>

      <!-- 두 번째 이미지 스타일의 온보딩 화면 (폰 와이어프레임) -->
      <div v-else class="bg-white min-h-screen flex flex-col">
        <!-- 상단 Welcome 텍스트 -->
        <div class="text-left p-6">
          <h2 class="text-lg font-medium text-gray-500">Welcome</h2>
        </div>
        
        <!-- 중앙 콘텐츠 영역 -->
        <div class="flex-1 flex flex-col items-center justify-center px-6">
          <!-- 헤드라인 -->
          <div class="mb-6 text-center">
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">
              투자, 잘 몰라도 
              <span class="text-blue-400">AI</span>가 알아서 다 해줘요
            </h1>
          </div>
          
          <!-- 본문 텍스트 -->
          <div class="mb-8 text-center">
            <p class="text-base text-gray-700 leading-relaxed">
              FINZ의 AI 챗봇이 당신의 투자 여정을 쉽고 스마트하게 만들어 드립니다. 
              궁금한 점을 즉시 물어보고, 맞춤형 답변을 받아보세요.
            </p>
          </div>
          
          <!-- 폰 와이어프레임 (실제 챗봇 서비스 화면) -->
          <div class="mb-8 flex justify-center">
            <div class="w-64 h-96 border-2 border-gray-800 rounded-3xl relative bg-white overflow-hidden">
              <!-- 노치 -->
              <div class="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-3 bg-gray-800 rounded-full z-10"></div>
              
              <!-- 챗봇 서비스 화면 -->
              <div class="w-full h-full p-4">
                <!-- 상단 헤더 -->
                <div class="flex justify-between items-center mb-4">
                  <span class="text-lg font-bold text-gray-900">finz</span>
                  <div class="w-6 h-6 bg-gray-400 rounded-full"></div>
                </div>
                
                <!-- 챗봇 메시지 -->
                <div class="mb-4">
                  <div class="bg-gray-200 rounded-lg p-3 mb-2">
                    <div class="text-sm text-gray-700">투자 성향 기반 추천을 위해 아래 옵션 중 하나를 선택해주세요:</div>
                  </div>
                  <div class="bg-gray-200 rounded-lg p-3 mb-2">
                    <div class="text-sm text-gray-700">투자 성향 테스트 하러 가기</div>
                  </div>
                  <div class="bg-gray-200 rounded-lg p-3">
                    <div class="text-sm text-gray-700">내 성향 기반 추천 받아보기</div>
                  </div>
                </div>
                
                <!-- 사용자 메시지 -->
                <div class="mb-4 flex justify-end">
                  <div class="bg-blue-500 rounded-lg p-3 max-w-48">
                    <div class="text-sm text-white">나의 투자 성향인 TEC에 맞는 종목을 추천해줘</div>
                  </div>
                </div>
                
                <!-- 추천 카드 -->
                <div class="bg-white border border-gray-300 rounded-lg p-3 mb-4">
                  <div class="text-sm font-bold text-gray-900 mb-1">KODEX 200선물인버스 2X</div>
                  <div class="text-sm text-gray-600 mb-2">252670</div>
                  <div class="text-sm text-red-500 bg-red-100 rounded px-2 py-1 inline-block mb-2">위험도: 높음</div>
                  <div class="text-xs text-gray-700 mb-2">코로나19 여파로 인한 시장 하락에 대한 헤지 수단으로 활용 가능해 보여요...</div>
                  <div class="flex items-center text-xs text-blue-600">
                    <span class="mr-1">💡</span>
                    AI 분석 Tip
                  </div>
                </div>
                
                <!-- 하단 네비게이션 -->
                <div class="absolute bottom-4 left-4 right-4">
                  <div class="grid grid-cols-3 gap-3">
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 진행률 점들 -->
          <div class="flex justify-center space-x-2 mb-6">
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          
          <!-- 다음 버튼 -->
          <button 
            @click="nextStep"
            class="bg-blue-400 text-white w-full max-w-sm py-4 rounded-full text-lg font-semibold hover:bg-blue-500 transition-colors"
          >
            다음에
          </button>
        </div>
      </div>

      <!-- 진행률 표시 (모바일 반응형) -->
      <div class="flex space-x-2 mb-6 sm:mb-8 justify-center">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-200',
            index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
          ]"
        ></div>
      </div>

      <!-- 하단 버튼 (모바일 반응형) -->
      <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-sm mx-auto px-4">
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
              title: '주식, 부담 없이 연습해요',
              subtitle: '실제 주식 시장 데이터로 투자 전략을 연습하고,\nAI 기반 투자 시뮬레이션으로 경험을 쌓아보세요.',
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
