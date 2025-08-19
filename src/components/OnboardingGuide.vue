<template>
  <div
    v-if="showOnboarding"
    :class="
      modalMode
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'
        : 'min-h-screen bg-white'
    "
  >
    <div
      :class="
        modalMode
          ? 'relative w-full max-w-[350px] mx-auto bg-white rounded-2xl shadow-xl p-0 flex flex-col items-center justify-center'
          : 'relative w-full max-w-[430px] mx-auto'
      "
      :style="modalMode ? 'min-height: 260px; max-height: 420px; overflow-y-auto;' : ''"
    >
      <!-- X 닫기 버튼 (모달 모드에서만) -->
      <button
        v-if="modalMode"
        class="absolute top-4 right-4 text-gray-400 text-2xl z-10"
        @click="emit('close')"
        aria-label="닫기"
      >
        &times;
      </button>
      <transition name="fade-slide" mode="out-in">
        <div :key="currentStep">
          <!-- STEP 1 -->
          <div
            v-if="currentStep === 1"
            :class="
              modalMode
                ? 'flex flex-col items-center justify-center min-h-[260px] py-4 bg-white'
                : 'flex flex-col items-center justify-center min-h-screen bg-white'
            "
          >
            <h1 class="text-[22px] md:text-[26px] font-bold mb-4 text-center leading-tight">
              FINZ에 오신 것을<br />환영합니다!
            </h1>
            <p class="text-[13px] md:text-[14px] text-gray-600 mb-4 text-center leading-normal">
              투자 초보자를 위한<br />맞춤형 금융 플랫폼
            </p>
            <button
              @click="nextStep"
              class="w-full max-w-[180px] py-2 mt-4 bg-[#5ac6e9] text-white text-base rounded-[12px] font-semibold"
            >
              시작하기
            </button>
          </div>

          <!-- STEP 2~6 -->
          <div
            v-else
            :class="
              modalMode
                ? 'flex flex-col min-h-[160px] pt-2 pb-2 items-center'
                : 'flex flex-col min-h-[screen] pt-8 pb-[0px] items-center'
            "
          >
            <div class="px-2 text-center mb-2 min-h-[40px] mt-[2px]">
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
              class="w-[80%] max-w-[140px] mx-auto mb-0 mt-[-6px]"
            />
            <div class="flex justify-center mt-[2px] mb-[6px]">
              <span
                v-for="i in 6"
                :key="i"
                class="mx-[2px] w-[7px] h-[7px] rounded-full"
                :class="i === currentStep ? 'bg-[#5ac6e9]' : 'bg-gray-300'"
              ></span>
            </div>
            <div class="flex gap-3 mt-2 mb-1">
              <button
                v-if="currentStep > 1"
                class="bg-gray-200 text-gray-700 w-[70px] h-7 rounded-lg text-xs"
                @click="prevStep"
              >
                이전
              </button>
              <button
                class="bg-[#5ac6e9] text-white w-[70px] h-7 rounded-lg text-xs"
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
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const modalMode = route?.redirectedFrom?.fullPath === '/home' || route?.query?.from === '/home'

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
