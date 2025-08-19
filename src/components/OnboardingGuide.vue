<template>
  <div
    v-if="showOnboarding"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#f9f9f9]/90 backdrop-blur-sm"
  >
    <div class="relative w-full max-w-[430px] px-1 mx-auto">
      <!--  단계 전환에 애니메이션 적용 -->
      <transition name="fade-slide" mode="out-in">
        <div :key="currentStep">
          <!-- STEP 1 -->
          <div
            v-if="currentStep === 1"
            class="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FC]"
          >
            <h1 class="text-[30px] md:text-[34px] font-bold mb-10 text-center leading-tight">
              FINZ에 오신 것을<br />환영합니다!
            </h1>
            <p class="text-[16px] md:text-[17px] text-gray-600 mb-10 text-center leading-normal">
              투자 초보자를 위한<br />맞춤형 금융 플랫폼
            </p>
            <button
              @click="nextStep"
              class="w-full max-w-[320px] py-2.5 mt-18 bg-[#5ac6e9] text-white text-base rounded-[12px] font-semibold"
            >
              시작하기
            </button>
          </div>

          <!-- STEP 2~6 -->
          <div v-else class="flex flex-col min-h-screen pt-8 pb-[100px] items-center">
            <div class="px-2 text-center mb-4 min-h-[200px] mt-[8px]">
              <template v-if="currentStep === 2">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  주식, 부담 없이 연습해요<br /><span class="text-[#5ac6e9]">실전</span
                  >처럼,<br />안전하게 경험하세요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  실제 주식 시장 데이터로 투자를 연습하고,<br />AI 기반 시뮬레이션으로 경험을
                  쌓아보세요.
                </p>
              </template>
              <template v-else-if="currentStep === 3">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  투자 지식, 3분 만에 완성<br />쉽고 빠르게 배우는<br />
                  <span class="text-[#5ac6e9]">금융 상식</span>
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  FINZ의 다양한 학습 콘텐츠로 <br />금융 지식을 쌓아보세요.
                </p>
              </template>
              <template v-else-if="currentStep === 4">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  투자, 잘 몰라도 <span class="text-[#5ac6e9]">AI</span>가 <br />알아서 다 해줘요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  FINZ의 AI 챗봇이 당신의 투자 여정을 스마트하게 도와드립니다.<br />
                  궁금한 점을 즉시 물어보세요!
                </p>
              </template>
              <template v-else-if="currentStep === 5">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  나의 성적, 실시간 비교<br />전국 투자자와
                  <span class="text-[#5ac6e9]">경쟁</span>해보세요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  다양한 랭킹 기준으로 다른 투자자와 비교해보세요.
                </p>
              </template>
              <template v-else-if="currentStep === 6">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  매일 쓰는 투자일지,<br />AI가 분석<br />당신만의<span class="text-[#5ac6e9]">
                    투자코치</span
                  >
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  기록을 분석해 더 나은 투자 습관을 만들어보세요.
                </p>
              </template>
            </div>

            <img
              :src="stepImage[currentStep]"
              class="w-[90%] max-w-[310px] mx-auto mb-0 mt-[-20px]"
            />

            <!-- dots -->
            <div class="flex justify-center mt-[8px] mb-[18px]">
              <span
                v-for="i in 6"
                :key="i"
                class="mx-[3px] w-[8px] h-[8px] rounded-full"
                :class="i === currentStep ? 'bg-[#5ac6e9]' : 'bg-gray-300'"
              ></span>
            </div>

            <!-- buttons -->
            <div class="absolute bottom-10 md:bottom-60 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                v-if="currentStep > 1"
                class="bg-gray-200 text-gray-700 w-[120px] h-9 rounded-lg text-sm"
                @click="prevStep"
              >
                이전
              </button>
              <button
                class="bg-[#5ac6e9] text-white w-[120px] h-9 rounded-lg text-sm"
                @click="nextStep"
              >
                {{ currentStep === 6 ? '시작하기' : '다음' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
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

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter {
  opacity: 0;
  transform: translateX(30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
