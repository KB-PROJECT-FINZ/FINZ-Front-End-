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
      <div class="flex-1 flex flex-col items-center justify-center">
        <img src="@/assets/finz.png" alt="finz" class="w-30 mt-30 mb-10" />
      </div>

      <!-- 안내 문구 -->
      <div class="text-center mb-6">
        <p class="text-lg font-semibold text-gray-900">지금 가입하고 시작해보세요</p>
        <p class="text-sm text-gray-500 mt-1">간단한 정보 입력만으로 finz를 시작할 수 있어요</p>
      </div>

      <!-- 폼 -->
      <div class="space-y-2">
        <!-- 이름 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
          <input
            v-model="name"
            type="text"
            placeholder="실명을 입력해주세요"
            class="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <!-- 아이디(닉네임) + 중복확인 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
          <div class="flex gap-2">
            <input
              v-model="nickname"
              type="text"
              placeholder="아이디를 입력해주세요"
              class="flex-1 h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              class="h-12 px-4 rounded-xl border border-[#2165C2] text-[#2165C2] font-medium hover:bg-blue-50 transition"
              @click="checkNickname"
            >
              {{ nicknameChecking ? '⏳ 확인중' : '중복확인' }}
            </button>
          </div>
          <p v-if="nicknameStatus === 'available'" class="text-sm text-green-600 mt-2">
            ✔ 사용 가능한 아이디입니다.
          </p>
          <p v-else-if="nicknameStatus === 'unavailable'" class="text-sm text-red-500 mt-2">
            ✖ 이미 사용 중인 아이디입니다.
          </p>
        </div>
        <!-- 이메일 + 중복확인 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
          <div class="flex gap-2">
            <input
              v-model="email"
              type="email"
              placeholder="oliviablue@gmail.com"
              class="flex-1 h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              class="h-12 px-4 rounded-xl border border-[#2165C2] text-[#2165C2] font-medium hover:bg-blue-50 transition"
              @click="checkEmail"
            >
              {{ emailChecking ? '⏳ 확인중' : '중복확인' }}
            </button>
          </div>
          <p v-if="emailStatus === 'available'" class="text-sm text-green-600 mt-2">
            ✔ 사용 가능한 이메일입니다.
          </p>
          <p v-else-if="emailStatus === 'unavailable'" class="text-sm text-red-500 mt-2">
            ✖ 이미 사용 중인 이메일입니다.
          </p>
        </div>
        <!-- 비밀번호 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="6자 이상 입력해주세요"
              class="w-full h-12 px-4 pr-11 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              @click="togglePassword"
              aria-label="비밀번호 보기 토글"
            >
              <span>{{ showPassword ? '👁️‍🗨️' : '👁️' }}</span>
            </button>
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordConfirm"
              placeholder="비밀번호를 다시 입력해주세요"
              class="w-full h-12 px-4 pr-11 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              @click="togglePassword"
              aria-label="비밀번호 보기 토글"
            >
              <span>{{ showPassword ? '👁️‍🗨️' : '👁️' }}</span>
            </button>
          </div>
          <p
            v-if="password && passwordConfirm && password !== passwordConfirm"
            class="text-sm text-red-500 mt-2"
          >
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <!-- 약관 동의 -->
        <div class="text-sm text-gray-600">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="agree" class="accent-[#2165C2] w-4 h-4" />
            <span>
              <span class="text-red-500 font-semibold">*</span> 이용약관 및 개인정보처리방침에
              동의합니다.
            </span>
          </label>
        </div>
      </div>
    </main>

    <!-- 하단 메인 버튼 -->
    <div class="w-full flex justify-center mb-13">
      <button
        :disabled="!canSubmit"
        @click="handleSignup"
        class="w-10/12 max-w-sm h-12 rounded-lg text-white font-medium transition"
        :class="canSubmit ? 'bg-[#2165C2] hover:bg-[#1b55a5]' : 'bg-gray-300 cursor-not-allowed'"
      >
        FINZ 시작하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 로고 애니메이션
const logoUp = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    logoUp.value = true
  })
})

// 폼 상태
const name = ref('')
const email = ref('')
const nickname = ref('')
const password = ref('')
const passwordConfirm = ref('')
const agree = ref(false)
const showPassword = ref(false)

// 중복확인 상태
const emailStatus = ref(null) // 'available' | 'unavailable' | null
const nicknameStatus = ref(null) // 'available' | 'unavailable' | null
const emailChecking = ref(false)
const nicknameChecking = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const checkEmail = async () => {
  if (!email.value) {
    emailStatus.value = null
    alert('이메일을 입력해주세요.')
    return
  }
  try {
    emailChecking.value = true
    const res = await axios.get(`/api/auth/check-email?email=${encodeURIComponent(email.value)}`)
    emailStatus.value = res.data?.available ? 'available' : 'unavailable'
  } catch (err) {
    console.error('이메일 확인 오류:', err.response?.data || err.message)
    emailStatus.value = null
  } finally {
    emailChecking.value = false
  }
}

const nicknameStatusResetIfEmpty = () => {
  if (!nickname.value) nicknameStatus.value = null
}

const checkNickname = async () => {
  if (!nickname.value) {
    nicknameStatus.value = null
    alert('아이디를 입력해주세요.')
    return
  }
  try {
    nicknameChecking.value = true
    const res = await axios.get(
      `/api/auth/check-nickname?nickname=${encodeURIComponent(nickname.value)}`,
    )
    nicknameStatus.value = res.data?.available ? 'available' : 'unavailable'
  } catch (err) {
    console.error('닉네임 확인 오류:', err.response?.data || err.message)
    nicknameStatus.value = null
  } finally {
    nicknameChecking.value = false
  }
}

const canSubmit = computed(() => {
  return (
    name.value &&
    email.value &&
    nickname.value &&
    password.value.length >= 6 &&
    password.value === passwordConfirm.value &&
    agree.value &&
    emailStatus.value === 'available' &&
    nicknameStatus.value === 'available'
  )
})

const goBack = () => {
  router.push('/') // 랜딩으로
}

const handleSignup = async () => {
  try {
    const res = await axios.post('/api/auth/signup', {
      username: email.value,
      password: password.value,
      name: name.value,
      email: email.value,
      nickname: nickname.value,
      phoneNumber: '010-0000-0000',
      provider: 'local',
      riskType: 'CSD',
    })

    if (res.data) {
      alert('회원가입 성공! 투자 성향 테스트로 이동합니다.')
      router.push({
        path: '/investment-test',
        query: { username: email.value },
      })
    }
  } catch (err) {
    alert('회원가입 실패: 입력값을 다시 확인해주세요.')
    console.error(err)
  }
}
</script>

<style scoped>
/* 필요 시 추가 커스터마이징 */
</style>
