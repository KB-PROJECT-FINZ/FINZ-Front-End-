<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-8">
    <!-- 로고 -->
    <img src="@/assets/finz.png" alt="finz" class="w-24 mb-4" />

    <!-- 환영 메시지 -->
    <div class="text-center mb-6">
      <p class="text-xl font-semibold">안녕하세요! 👋</p>
      <p class="text-sm text-gray-700 font-medium mt-1">
        <span class="font-bold">finz</span>와 함께 투자 여정을 떠나봐요!
      </p>
    </div>

    <!-- 로그인 입력 박스 -->
    <div class="bg-blue-50 rounded-xl px-5 py-6 w-full max-w-md space-y-4">
      <!-- 이메일 -->
      <div>
        <label class="text-sm text-gray-600">이메일</label>
        <div class="relative mt-1">
          <input
            v-model="email"
            type="email"
            placeholder="이메일을 입력해주세요"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <!-- 비밀번호 -->
      <div>
        <label class="text-sm text-gray-600">비밀번호</label>
        <div class="relative mt-1">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="비밀번호를 입력해주세요"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span
            class="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
            @click="togglePassword"
          >
            {{ showPassword ? '👁️‍🗨️' : '👁️' }}
          </span>
        </div>
      </div>

      <!-- 로그인 버튼 -->
      <button
        @click="handleLogin"
        class="w-full py-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:translate-y-[-1px] active:shadow-2xl transition duration-200 transform"
      >
        로그인
      </button>
    </div>

    <!-- 비밀번호 찾기 -->
    <button @click="handleFindAccount" class="text-sm text-gray-400 mt-2 underline cursor-pointer">
      아이디/비밀번호 찾기
    </button>

    <!-- 소셜 로그인 버튼 -->
    <div class="w-full max-w-md mt-6 space-y-3">
      <button
        class="w-full flex items-center justify-center py-2.5 rounded-lg bg-yellow-400 text-black font-semibold shadow-sm"
      >
        카카오로 시작하기
      </button>
      <button
        class="w-full flex items-center justify-center py-2.5 rounded-lg border border-gray-300 bg-white text-black font-semibold shadow-sm"
      >
        Google로 시작하기
      </button>
      <button
        class="w-full flex items-center justify-center py-2.5 rounded-lg bg-green-500 text-white font-semibold shadow-sm"
      >
        네이버로 시작하기
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

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 입력값
const email = ref('')
const password = ref('')

// 로그인 요청
const handleLogin = async () => {
  try {
    const res = await axios.post('/auth/login', {
      username: email.value, // 수정: email을 username으로 보냄
      password: password.value,
    })

    if (res.data) {
      const { username, name, id } = res.data

      // 상태 저장
      userStore.setUser(res.data)

      // 로컬스토리지 저장
      localStorage.setItem('username', username)
      localStorage.setItem('name', name)
      localStorage.setItem('userId', id)
      console.log(localStorage.getItem('name'))
      alert('로그인 성공!')
      router.push('/home')
    }
  } catch (err) {
    alert('로그인 실패: 아이디 또는 비밀번호 확인')
    console.log('email:', email.value)
    console.log('password:', password.value)
    console.error(err)
  }
}

const handleFindAccount = () => {
  router.push('/find-account')
}
</script>

<style scoped>
/* 아이콘을 바꾸고 싶다면 Font Awesome 또는 이미지 아이콘으로 교체 가능 */
</style>
