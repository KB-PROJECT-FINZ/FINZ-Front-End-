<template>
  <div class="min-h-screen bg-white">
    <!-- 상단 헤더 -->
    <header class="px-4 pt-5">
      <button @click="goBack" class="p-2 -ml-2 rounded-lg hover:bg-gray-100">
        <svg class="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </header>

    <!-- 본문 -->
    <main class="px-6 pt-2 pb-28">
      <!-- <h1 class="text-3xl font-extrabold text-[#111827]">
        F<span class="text-[#2165C2]">I</span>NZ
      </h1> -->

      <div class="flex-1 flex flex-col items-center justify-center">
        <img src="@/assets/finz.png" alt="finz" class="w-35 mt-30 mb-20" />
      </div>
      <!-- 이메일 -->
      <div class="mt-8">
        <label class="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
        <input
          v-model="email"
          type="email"
          placeholder="이메일을 입력하세요"
          class="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>

      <!-- 비밀번호 -->
      <div class="mt-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="비밀번호를 입력하세요"
            class="w-full h-12 px-4 pr-11 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            @click="togglePassword"
            aria-label="비밀번호 보기 토글"
          >
            <!-- 눈 아이콘 -->
            <svg
              v-if="!showPassword"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3l18 18M10.585 10.585A3 3 0 0013.5 13.5M9.88 4.84A9.956 9.956 0 0112 4c4.477 0 8.268 2.943 9.542 7a9.98 9.98 0 01-4.132 5.225M6.228 6.228A9.982 9.982 0 002.458 12C3.732 16.057 7.523 19 12 19c1.21 0 2.368-.214 3.433-.606"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 비밀번호 찾기 -->
      <button @click="handleFindAccount" class="mt-3 text-sm text-gray-400 underline">
        비밀번호를 잊어버리셨나요?
      </button>
    </main>

    <div class="w-full flex justify-center mb-8">
      <button
        @click="handleLogin"
        class="w-10/12 max-w-sm h-12 rounded-lg bg-[#2165C2] text-white font-medium"
      >
        로그인
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const togglePassword = () => (showPassword.value = !showPassword.value)

const goBack = () => {
  router.push('/')
}

const handleLogin = async () => {
  try {
    const res = await axios.post(
      'http://localhost:8080/api/auth/login',
      { username: email.value, password: password.value },
      { withCredentials: true },
    )
    if (res.data) {
      userStore.setUser(res.data)
      router.push('/home')
    }
  } catch (err) {
    const message = err.response?.data || '로그인 실패: 아이디 또는 비밀번호 확인'
    alert(message)
    console.error(err)
  }
}

const handleFindAccount = () => {
  router.push('/find-account')
}
</script>
