<template>
  <div class="min-h-screen bg-white flex flex-col px-6">
    <!-- 상단: 로고 + 설명 (가운데 정렬) -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <img src="@/assets/finz.png" alt="finz" class="h-[56px] md:h-[64px] object-contain mb-20" />
      <div class="text-center text-gray-400 text-base leading-6">
        투자 입문자를 위한 맞춤형 금융 플랫폼<br />
        <span class="text-base text-gray-400">당신만의 투자 여정을 시작하세요</span>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="w-full mx-auto space-y-3 mb-10">
      <button @click="handleLogin" class="w-full py-3 rounded-xl bg-[#2165C2] text-white font-base">
        로그인
      </button>
      <button
        @click="handleSignup"
        class="w-full py-3 rounded-xl bg-white border-1 border-[#2165C2] text-[#2165C2] font-base"
      >
        회원가입
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
