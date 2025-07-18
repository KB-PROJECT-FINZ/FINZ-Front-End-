<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-6 py-8">
    <div class="w-full max-w-md">
      <!-- 로고 -->
      <img src="@/assets/finz.png" alt="finz" class="w-24 mb-4 mx-auto" />

      <!-- 안내 문구 -->
      <div class="text-center mb-4">
        <p class="text-sm text-gray-700 font-medium">
          <span class="font-bold">finz</span>와 함께 투자 여정을 떠나봐요!
        </p>
      </div>

      <!-- 간편가입 -->
      <div class="space-y-3 mb-4">
        <button
          class="w-full flex items-center justify-center py-2.5 rounded-lg bg-yellow-400 text-black font-semibold shadow-sm"
        >
          카카오 간편가입
        </button>
        <button
          class="w-full flex items-center justify-center py-2.5 rounded-lg border border-gray-300 bg-white text-black font-semibold shadow-sm"
        >
          Google 간편가입
        </button>
        <button
          class="w-full flex items-center justify-center py-2.5 rounded-lg bg-green-500 text-white font-semibold shadow-sm"
        >
          네이버 간편가입
        </button>
      </div>

      <!-- 또는 -->
      <div class="text-sm text-gray-400 text-center mb-2">또는</div>

      <!-- 회원가입 폼 -->
      <div class="bg-blue-50 rounded-xl px-5 py-6 space-y-4">
        <!-- 이름 -->
        <div>
          <input
            v-model="name"
            type="text"
            placeholder="실명을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
        </div>

        <!-- 이메일 -->
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="이메일을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
        </div>

        <!-- 닉네임 + 중복확인 -->
        <div class="flex gap-2">
          <input
            v-model="nickname"
            type="text"
            placeholder="닉네임을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <button
            class="px-2 w-25 text-sm bg-gray-200 rounded-full text-gray-600 font-medium cursor-not-allowed"
            disabled
          >
            중복확인
          </button>
        </div>

        <!-- 비밀번호 -->
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="6자 이상 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <span
            class="absolute right-4 top-2.5 cursor-pointer text-gray-400"
            @click="togglePassword"
          >
            {{ showPassword ? '👁️‍🗨️' : '👁️' }}
          </span>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="passwordConfirm"
            placeholder="비밀번호를 다시 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <span
            class="absolute right-4 top-2.5 cursor-pointer text-gray-400"
            @click="togglePassword"
          >
            {{ showPassword ? '👁️‍🗨️' : '👁️' }}
          </span>
        </div>

        <!-- 약관 동의 -->
        <div class="text-sm text-gray-600">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="agree" class="accent-purple-500" />
            <span>
              <span class="text-red-500 font-semibold">*</span> 이용약관 및 개인정보처리방침에
              동의합니다.
            </span>
          </label>
        </div>

        <!-- 시작하기 버튼 -->
        <button
          :disabled="!canSubmit"
          @click="handleSignup"
          class="w-full py-2.5 rounded-full font-bold transition text-white"
          :class="
            canSubmit ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300 cursor-not-allowed'
          "
        >
          FINZ 시작하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const nickname = ref('')
const password = ref('')
const passwordConfirm = ref('')
const agree = ref(false)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const canSubmit = computed(() => {
  return (
    name.value &&
    email.value &&
    nickname.value &&
    password.value.length >= 6 &&
    password.value === passwordConfirm.value &&
    agree.value
  )
})

const handleSignup = () => {
  // 추후 여기에 회원가입 API 연동도 추가 예정
  router.push('/login-form')
}
</script>

<style scoped>
/* 필요 시 스타일 추가 가능 */
</style>
