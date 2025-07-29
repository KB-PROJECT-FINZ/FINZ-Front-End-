<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-6 py-8">
    <div class="w-full max-w-md">
      <!-- 뒤로가기 버튼 -->
      <div class="w-full max-w-md relative">
        <button
          @click="goBack"
          class="absolute left-0 -top-36 text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
        >
          ← 뒤로가기
        </button>
      </div>
      <!-- 로고 -->
      <img src="@/assets/finz.png" alt="finz" class="w-24 mb-4 mx-auto" />

      <!-- 안내 문구 -->
      <div class="text-center mb-6">
        <p class="text-xl font-semibold">계정을 잊으셨나요? 🔍</p>
        <p class="text-sm text-gray-600 mt-1">아이디 또는 비밀번호를 찾아드릴게요</p>
      </div>

      <!-- 탭 전환 -->
      <div class="flex justify-center mb-4 gap-4 text-sm font-semibold">
        <button
          @click="tab = 'id'"
          :class="tab === 'id' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-400'"
        >
          아이디 찾기
        </button>
        <button
          @click="tab = 'pw'"
          :class="tab === 'pw' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-400'"
        >
          비밀번호 찾기
        </button>
      </div>

      <!-- 폼 영역 -->
      <div class="bg-blue-50 rounded-xl px-5 py-6 space-y-4">
        <!-- 아이디 찾기 -->
        <div v-if="tab === 'id'">
          <input
            v-model="name"
            type="text"
            placeholder="이름을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <input
            v-model="email"
            type="email"
            placeholder="가입한 이메일을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <button
            @click="handleFindId"
            class="w-full py-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:translate-y-[-1px] active:shadow-2xl transition duration-200 transform"
          >
            아이디 찾기
          </button>

          <!-- 결과 메시지 -->
          <p v-if="foundId" class="text-sm text-center text-green-600 mt-2">
            가입된 아이디: {{ maskedId }}
          </p>
        </div>

        <!-- 비밀번호 찾기 -->
        <div v-else>
          <input
            v-model="findEmail"
            type="email"
            placeholder="가입한 이메일을 입력해주세요"
            class="w-full px-4 py-2 rounded-full border border-gray-300 bg-white placeholder-gray-400"
          />
          <button
            @click="handleResetPw"
            class="w-full py-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:translate-y-[-1px] active:shadow-2xl transition duration-200 transform"
          >
            비밀번호 재설정 메일 발송
          </button>

          <p v-if="pwSent" class="text-sm text-center text-green-600 mt-2">
            비밀번호 재설정 링크가 이메일로 전송되었습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const tab = ref('id') // 'id' or 'pw'

const name = ref('')
const email = ref('')
const foundId = ref('')
const findEmail = ref('')
const pwSent = ref(false)

const handleFindId = async () => {
  if (!name.value || !email.value) {
    alert('이름과 이메일을 모두 입력해주세요.')
    return
  }

  try {
    const res = await axios.post('http://localhost:8080/auth/find-username', {
      name: name.value,
      email: email.value,
    })
    foundId.value = res.data // 응답: 이메일 (username)
  } catch (err) {
    alert('일치하는 아이디를 찾을 수 없습니다.')
    console.error(err)
  }
}
const handleResetPw = async () => {
  if (!findEmail.value) {
    alert('이메일을 입력해주세요.')
    return
  }

  try {
    const res = await axios.post('http://localhost:8080/auth/find-password', {
      email: findEmail.value,
    })
    pwSent.value = true
  } catch (err) {
    alert('해당 이메일로 가입된 계정을 찾을 수 없습니다.')
    console.error(err)
  }
}

const goBack = () => router.push('/login-form')

// 마스킹 처리된 이메일 예시
const maskedId = computed(() => {
  if (!foundId.value) return ''
  const [local, domain] = foundId.value.split('@')
  const masked = local.slice(0, 2) + '***'
  return masked + '@' + domain
})
</script>

<style scoped>
/* 필요 시 추가 */
</style>
