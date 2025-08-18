<template>
  <div
    v-if="showOnboarding"
    class="fixed inset-0 z-50 bg-[#f2f2f2]/90 backdrop-blur-md flex items-center justify-center"
  >
    <div class="w-full max-w-[430px] mx-auto relative">
      <!-- 1단계 -->
      <div
        v-if="currentStep === 1"
        class="flex flex-col items-center justify-center min-h-screen bg-[#cce1ff] px-4"
      >
        <h1 class="text-[36px] font-bold mb-4 leading-tight text-center">
          FINZ에 오신 것을<br />환영합니다!
        </h1>
        <p class="text-[18px] text-gray-700 leading-normal mb-16 text-center">
          투자 초보자를 위한<br />맞춤형 금융 플랫폼
        </p>
        <button
          @click="nextStep"
          class="bg-[#5387d0] text-white rounded-[6px]"
          style="width: 252px; height: 52px; font-size: 18px; font-weight: 600"
        >
          시작하기
        </button>
      </div>

      <!-- 2~6단계 -->
      <div
        v-else-if="currentStep >= 2 && currentStep <= 6"
        class="flex flex-col items-center pt-10 pb-14 min-h-screen"
      >
        <!-- 문구 -->
        <div class="text-center px-6 mb-6">
          <template v-if="currentStep === 2">
            <h2 class="text-[30px] font-bold leading-snug mb-4">
              투자, 잘 몰라도 <span class="text-[#5ac6e9]">AI</span>가 <br />알아서 다 해줘요
            </h2>
            <p class="text-[18px] text-gray-500">
              FINZ의 AI 챗봇이 당신의 투자 여정을 쉽고<br />스마트하게 만들어 드립니다.
            </p>
          </template>
          <template v-else-if="currentStep === 3">
            <h2 class="text-[30px] font-bold leading-snug mb-4">
              주식, 부담 없이 연습해요<br /><span class="text-[#5ac6e9]">실전</span
              >처럼,<br />안전하게 경험하세요
            </h2>
            <p class="text-[18px] text-gray-500">
              실제 주식 시장 데이터로 투자 전략을 연습하고,<br />AI 기반 투자 시뮬레이션으로 경험을
              쌓아보세요.
            </p>
          </template>
          <template v-else-if="currentStep === 4">
            <h2 class="text-[30px] font-bold leading-snug mb-4">
              투자 지식, 3분 만에 완성<br />쉽고 빠르게 배우는
              <span class="text-[#5ac6e9]">금융 상식</span>
            </h2>
            <p class="text-[18px] text-gray-500">
              FINZ의 다양한 학습 콘텐츠를 통해 투자 지식을<br />쌓고, 금융 시장을 더 깊이
              이해하세요.
            </p>
          </template>
          <template v-else-if="currentStep === 5">
            <h2 class="text-[30px] font-bold leading-snug mb-4">
              나의 성적, 실시간 비교<br />전국 투자자와
              <span class="text-[#5ac6e9]">경쟁</span>해보세요
            </h2>
            <p class="text-[18px] text-gray-500">
              자산 순위, 투자 성과, AI 평가 등 다양한 기준을<br />통해 사용자 랭킹을 확인하세요.
            </p>
          </template>
          <template v-else-if="currentStep === 6">
            <h2 class="text-[30px] font-bold leading-snug mb-4">
              매일 쓰는 투자일지, AI가 분석<br />당신만의
              <span class="text-[#5ac6e9]">투자 코치</span>를 만나보세요
            </h2>
            <p class="text-[18px] text-gray-500">
              투자 기록을 남기고 AI 피드백으로 더 현명한<br />투자를 경험하세요.
            </p>
          </template>
        </div>

        <!-- 스마트폰 모형 -->
        <div class="relative w-[340px] h-[640px] mx-auto mb-6">
          <!-- 콘텐츠(안쪽) -->
          <img
            :src="stepImage[currentStep]"
            class="absolute inset-[18px] w-[304px] h-[600px] object-cover rounded-[28px] z-20"
          />
          <!-- 프레임(PNG) -->
          <img
            src="@/assets/OnboardingGuide/phone-frame.png"
            class="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          />
        </div>

        <!-- 진행 점 + 버튼 -->
        <div class="flex flex-col items-center">
          <div class="flex space-x-2 mb-3">
            <span
              v-for="i in 7"
              :key="i"
              class="w-[8px] h-[8px] rounded-full"
              :class="i === currentStep ? 'bg-[#5ac6e9]' : 'bg-gray-300'"
            ></span>
          </div>
          <button
            @click="nextStep"
            class="bg-[#5ac6e9] text-white rounded-[6px]"
            style="width: 252px; height: 36px; font-size: 14px; font-weight: 600"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 7단계 -->
      <div
        v-else-if="currentStep === 7"
        class="flex flex-col items-center justify-center min-h-screen bg-[#cce1ff] px-4"
      >
        <h2 class="text-[36px] font-bold leading-tight mb-12 text-center">
          이제 FINZ와 함께<br />투자 여정을<br />시작해보세요!
        </h2>
        <button
          @click="closeOnboarding"
          class="bg-[#5387d0] text-white rounded-[6px]"
          style="width: 252px; height: 52px; font-size: 18px; font-weight: 600"
        >
          시작하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 안쪽 콘텐츠(swiper 없이 단계별 이미지)
const stepImage = {
  2: new URL('@/assets/OnboardingGuide/chatbot.png', import.meta.url).href,
  3: new URL('@/assets/OnboardingGuide/trade.png', import.meta.url).href,
  4: new URL('@/assets/OnboardingGuide/learning.png', import.meta.url).href,
  5: new URL('@/assets/OnboardingGuide/ranking.png', import.meta.url).href,
  6: new URL('@/assets/OnboardingGuide/feedback.png', import.meta.url).href,
}

const props = defineProps({ showOnboarding: Boolean })
const emit = defineEmits(['close'])
const currentStep = ref(1)

const nextStep = () => {
  currentStep.value < 7 ? currentStep.value++ : emit('close')
}
const closeOnboarding = () => emit('close')
</script>
