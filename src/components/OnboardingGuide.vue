<template>
  <div
    v-if="showOnboarding"
    :class="
      modalMode
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'
        : 'min-h-screen bg-white'
    "
  >
    <div class="relative w-full max-w-[430px] px-1 mx-auto">
      <Swiper
        ref="swiperRef"
        :allow-touch-move="false"
        :slides-per-view="1"
        :space-between="0"
        class="w-full"
        @swiper="onSwiper"
      >
        <!-- 1단계 -->
        <SwiperSlide>
          <div class="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FC]">
            <h1 class="text-[30px] md:text-[34px] font-bold mb-10 text-center leading-tight">
              FINZ에 오신 것을<br />환영합니다!
            </h1>
            <p class="text-[13px] md:text-[14px] text-gray-600 mb-4 text-center leading-normal">
              투자 초보자를 위한<br />맞춤형 금융 플랫폼
            </p>
            <button
              @click="slideNext"
              class="w-full max-w-[320px] py-2.5 mt-18 bg-[#5ac6e9] text-white text-base rounded-[12px] font-semibold"
            >
              시작하기
            </button>
          </div>
        </SwiperSlide>

        <!-- 2~6단계 -->
        <SwiperSlide v-for="step in [2, 3, 4, 5, 6]" :key="step">
          <div class="flex flex-col min-h-screen pt-8 pb-[100px] items-center">
            <div class="px-2 text-center mb-4 min-h-[200px] mt-[8px]">
              <template v-if="step === 2">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  주식, 부담 없이 연습해요<br /><span class="text-[#5ac6e9]">실전</span
                  >처럼,<br />안전하게 경험하세요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  실제 주식 시장 데이터로 투자를 연습하고,<br />AI 기반 시뮬레이션으로 경험을
                  쌓아보세요.
                </p>
              </template>
              <template v-else-if="step === 3">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  투자 지식, 3분 만에 완성<br />쉽고 빠르게 배우는<br />
                  <span class="text-[#5ac6e9]">금융 상식</span>
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  FINZ의 다양한 학습 콘텐츠로 <br />금융 지식을 쌓아보세요.
                </p>
              </template>
              <template v-else-if="step === 4">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  투자, 잘 몰라도 <span class="text-[#5ac6e9]">AI</span>가 <br />알아서 다 해줘요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  FINZ의 AI 챗봇이 당신의 투자 여정을 스마트하게 도와드립니다.<br />
                  궁금한 점을 즉시 물어보세요!
                </p>
              </template>
              <template v-else-if="step === 5">
                <h2 class="text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  나의 성적, 실시간 비교<br />전국 투자자와
                  <span class="text-[#5ac6e9]">경쟁</span>해보세요
                </h2>
                <p class="text-[14px] md:text-[16px] text-gray-500 leading-snug">
                  다양한 랭킹 기준으로 다른 투자자와 비교해보세요.
                </p>
              </template>
              <template v-else-if="step === 6">
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

            <img :src="stepImage[step]" class="w-[90%] max-w-[310px] mx-auto mb-0 mt-[-20px]" />

            <!-- dots -->
            <div class="flex justify-center mt-[8px] mb-[18px]">
              <span
                v-for="i in 6"
                :key="i"
                class="mx-[3px] w-[8px] h-[8px] rounded-full"
                :class="i === stepIndex ? 'bg-[#5ac6e9]' : 'bg-gray-300'"
              ></span>
            </div>
            <div class="flex gap-3 mt-2 mb-1">
              <button
                v-if="stepIndex > 1"
                class="bg-gray-200 text-gray-700 w-[120px] h-9 rounded-lg text-sm"
                @click="slidePrev"
              >
                이전
              </button>
              <button
                class="bg-[#5ac6e9] text-white w-[120px] h-9 rounded-lg text-sm"
                @click="stepIndex === 6 ? goLogin() : slideNext()"
              >
                {{ stepIndex === 6 ? '시작하기' : '다음' }}
              </button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
// import 'swiper/css'
// import 'swiper/css/navigation'
// import 'swiper/css/pagination'
import 'swiper/swiper-bundle.css'

const onSwiper = (swiper) => {
  swiperRef.value = swiper
}

const router = useRouter()
const swiperRef = ref(null)
const stepIndex = ref(1)

const stepImage = {
  2: new URL('@/assets/OnboardingGuide/trade.png', import.meta.url).href,
  3: new URL('@/assets/OnboardingGuide/learning.png', import.meta.url).href,
  4: new URL('@/assets/OnboardingGuide/chatbot.png', import.meta.url).href,
  5: new URL('@/assets/OnboardingGuide/ranking.png', import.meta.url).href,
  6: new URL('@/assets/OnboardingGuide/feedback.png', import.meta.url).href,
}

const props = defineProps({ showOnboarding: Boolean })
const emit = defineEmits(['close'])

const slideNext = () => {
  swiperRef.value.slideNext()
}
const slidePrev = () => {
  swiperRef.value.slidePrev()
}
const goLogin = () => {
  router.push('/login-form')
}

onMounted(() => {
  watch(
    () => swiperRef.value?.realIndex,
    (value) => {
      stepIndex.value = value + 1
    },
  )
})
</script>
