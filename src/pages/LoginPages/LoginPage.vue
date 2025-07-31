<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
    <!-- 🎨 로고 + 배경 파형 -->
    <div class="relative w-full max-w-xs h-60 mb-2">
      <!-- 배경 wave -->
      <img :src="waveImage" alt="wave" class="absolute inset-0 w-full h-60 object-contain z-0" />
      <!-- 로고 -->
      <img src="@/assets/finz.png" alt="finz" class="relative z-10 w-32 mx-auto mt-25" />
    </div>

    <!-- 텍스트 설명 -->
    <div class="text-center text-gray-600 text-sm leading-tight mb-20">
      투자 입문자를 위한 맞춤형 금융 플랫폼<br />
      <span class="text-xs text-gray-500">당신만의 투자 여정을 시작하세요</span>
    </div>

    <!-- 버튼 -->
    <div class="w-full max-w-xs space-y-4">
      <button
        @click="handleLogin"
        class="w-full py-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:translate-y-[-1px] active:shadow-2xl transition duration-200 transform"
      >
        로그인
      </button>
      <button
        @click="handleSignup"
        class="w-full py-3 rounded-full bg-white border border-gray-200 text-purple-600 font-semibold shadow-sm hover:shadow-md hover:scale-105 active:translate-y-[-1px] active:shadow-lg transition duration-200 transform"
      >
        회원가입...
      </button>
    </div>

    <!-- 소셜 로그인 -->
    <div class="flex justify-center gap-6 mt-8">
      <div class="w-10 h-10 rounded-full border flex items-center justify-center shadow-sm">
        <img
          src="https://images.icon-icons.com/652/PNG/512/naver_icon-icons.com_59879.png"
          alt="naver"
          class="w-5 h-5"
        />
      </div>
      <KakaoCircleButton />
      <div class="w-10 h-10 rounded-full border flex items-center justify-center shadow-sm">
        <img src="https://img.icons8.com/win10/512/google-logo.png" alt="google" class="w-5 h-5" />
      </div>
    </div>
  </div>
</template>

<script setup>
import waveImage from '@/assets/wave.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import KakaoCircleButton from '@/components/KakaoLoginButton.vue'

const isLoading = ref(false)
const router = useRouter()

const handleLogin = () => {
  isLoading.value = true
  router.push('/login-form')
}

const handleSignup = () => {
  router.push('/signup')
}
</script>
