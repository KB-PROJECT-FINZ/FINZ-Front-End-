<template>
  <div
    v-if="showOnboarding"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#f9f9f9]/90 backdrop-blur-sm"
  >
    <div class="w-full max-w-[430px] px-4 mx-auto">
      <!-- STEP 1 -->
      <div
        v-if="currentStep === 1"
        class="flex flex-col items-center justify-center min-h-screen bg-[#effcfa]"
      >
        <h1 class="text-[30px] md:text-[36px] font-bold mb-5 text-center leading-tight">
          FINZ에 오신 것을<br />환영합니다!
        </h1>
        <p class="text-[16px] md:text-[18px] text-gray-600 mb-14 text-center leading-normal">
          투자 초보자를 위한<br />맞춤형 금융 플랫폼
        </p>
        <button
          @click="nextStep"
          class="w-full max-w-[260px] py-3 bg-[#5ac6e9] text-white text-lg rounded-lg font-semibold"
        >
          시작하기
        </button>
      </div>

      <!-- STEP 2~6 -->
      <div v-else class="flex flex-col min-h-screen pt-10 pb-24 items-center">
        <!-- heading -->
        <div class="px-4 text-center mb-6">
          <template v-if="currentStep === 2">
            <h2 class="text-[26px] md:text-[30px] font-bold leading-snug mb-3">
              주식, 부담 없이 연습해요<br /><span class="text-[#5ac6e9]">실전</span
              >처럼,<br />안전하게 경험하세요
            </h2>
            <p class="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
              실제 주식 시장 데이터로 투자 전략을 연습하고,<br />AI 기반 시뮬레이션으로 경험을
              쌓아보세요.
            </p>
          </template>
          <template v-else-if="currentStep === 3">
            <h2 class="text-[26px] md:text-[30px] font-bold leading-snug mb-3">
              투자 지식, 3분 만에 완성<br />쉽고 빠르게 배우는
              <span class="text-[#5ac6e9]">금융 상식</span>
            </h2>
            <p class="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
              FINZ의 다양한 학습 콘텐츠로 <br />금융 지식을 쌓아보세요.
            </p>
          </template>
          <template v-else-if="currentStep === 4">
            <h2 class="text-[26px] md:text-[30px] font-bold leading-snug mb-3">
              투자, 잘 몰라도 <span class="text-[#5ac6e9]">AI</span>가 <br />알아서 다 해줘요
            </h2>
            <p class="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
              FINZ의 AI 챗봇이 당신의 투자 여정을 쉽고<br />스마트하게 만들어 드립니다.
            </p>
          </template>
          <template v-else-if="currentStep === 5">
            <h2 class="text-[26px] md:text-[30px] font-bold leading-snug mb-3">
              나의 성적, 실시간 비교<br />전국 투자자와
              <span class="text-[#5ac6e9]">경쟁</span>해보세요
            </h2>
            <p class="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
              자산 순위, AI 평가 등으로 나의 실력을 비교해보세요.
            </p>
          </template>
          <template v-else-if="currentStep === 6">
            <h2 class="text-[26px] md:text-[30px] font-bold leading-snug mb-3">
              매일 쓰는 투자일지, AI가 분석<br />당신만의
              <span class="text-[#5ac6e9]">투자코치</span>를 <br />만나보세요
            </h2>
            <p class="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
              투자 기록을 남기고 AI의 피드백을 받아보세요.
            </p>
          </template>
        </div>

        <!-- 이미지 -->
        <img :src="stepImage[currentStep]" class="w-full max-w-[330px] mx-auto mb-8" />
        <!-- indicator + buttons -->
        <div class="flex flex-col items-center w-full">
          <!-- 진행률 dots -->
          <div class="flex gap-2 justify-center mt-6 mb-6">
            <span
              v-for="i in 6"
              :key="i"
              class="w-[8px] h-[8px] rounded-full"
              :class="i === currentStep ? 'bg-[#5ac6e9]' : 'bg-gray-300'"
            ></span>
          </div>

          <!-- 이전 / 다음 버튼 -->
          <div class="flex gap-4 justify-center w-full mt-1">
            <button
              v-if="currentStep > 1"
              class="bg-gray-200 text-gray-700 w-[110px] h-10 rounded-lg"
              @click="prevStep"
            >
              이전
            </button>
            <button class="bg-[#5ac6e9] text-white w-[110px] h-10 rounded-lg" @click="nextStep">
              {{ currentStep === 6 ? '시작하기' : '다음' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stepImage = {
  2: new URL('@/assets/OnboardingGuide/trade1.png', import.meta.url).href,
  3: new URL('@/assets/OnboardingGuide/learning1.png', import.meta.url).href,
  4: new URL('@/assets/OnboardingGuide/chatbot1.png', import.meta.url).href,
  5: new URL('@/assets/OnboardingGuide/ranking1.png', import.meta.url).href,
  6: new URL('@/assets/OnboardingGuide/feedback1.png', import.meta.url).href,
}

const props = defineProps({ showOnboarding: Boolean })
const emit = defineEmits(['close'])
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value < 6) currentStep.value++
  else router.push('/login-form')
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
</script>
