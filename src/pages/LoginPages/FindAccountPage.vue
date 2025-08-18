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
        <img src="@/assets/finz.png" alt="finz" class="w-35 mt-30 mb-15" />
      </div>

      <!-- 안내 문구 -->
      <!-- <div class="text-center mb-6">
        <p class="text-lg font-semibold text-gray-900">계정을 잊으셨나요? 🔍</p>
        <p class="text-sm text-gray-500 mt-1">아이디 또는 비밀번호를 찾아드릴게요</p>
      </div> -->

      <!-- 탭 전환 (심플 언더라인) -->
      <div class="flex justify-center mb-6 gap-6 text-sm font-semibold">
        <button
          @click="tab = 'id'"
          class="pb-2"
          :class="tab === 'id' ? 'text-[#2165C2] border-b-2 border-[#2165C2]' : 'text-gray-400'"
        >
          아이디 찾기
        </button>
        <button
          @click="tab = 'pw'"
          class="pb-2"
          :class="tab === 'pw' ? 'text-[#2165C2] border-b-2 border-[#2165C2]' : 'text-gray-400'"
        >
          비밀번호 찾기
        </button>
      </div>

      <!-- 폼: 로그인 페이지와 동일한 인풋 톤 -->
      <div class="space-y-6">
        <!-- 아이디 찾기 -->
        <div v-if="tab === 'id'">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
            <input
              v-model="name"
              type="text"
              placeholder="이름을 입력해주세요"
              class="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div class="mt-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">가입한 이메일</label>
            <input
              v-model="email"
              type="email"
              placeholder="oliviablue@gmail.com"
              class="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <!-- 결과 메시지 -->
          <p v-if="foundId" class="text-sm text-center text-green-600 mt-3">
            가입된 아이디: {{ maskedId }}
          </p>
        </div>

        <!-- 비밀번호 찾기 -->
        <div v-else>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">가입한 이메일</label>
            <input
              v-model="findEmail"
              type="email"
              placeholder="oliviablue@gmail.com"
              class="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <p v-if="pwSent" class="text-sm text-center text-green-600 mt-3">
            비밀번호 재설정 링크가 이메일로 전송되었습니다.
          </p>
        </div>
      </div>
    </main>

    <!-- 하단 메인 버튼 (탭에 따라 액션/라벨 변경) -->
    <div class="w-full flex justify-center mb-8">
      <button
        @click="tab === 'id' ? handleFindId() : handleResetPw()"
        class="w-10/12 max-w-sm h-12 rounded-lg bg-[#2165C2] text-white font-medium"
      >
        {{ tab === 'id' ? '아이디 찾기' : '비밀번호 재설정 메일 발송' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const tab = ref('id') // 'id' or 'pw'

// 로고 애니메이션
const logoUp = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    logoUp.value = true
  })
})

// 아이디 찾기 상태
const name = ref('')
const email = ref('')
const foundId = ref('')

// 비밀번호 찾기 상태
const findEmail = ref('')
const pwSent = ref(false)

// 액션: 아이디 찾기
const handleFindId = async () => {
  if (!name.value || !email.value) {
    alert('이름과 이메일을 모두 입력해주세요.')
    return
  }
  try {
    const res = await axios.post('http://localhost:8080/api/auth/find-username', {
      name: name.value,
      email: email.value,
    })
    // 서버에서 이메일(=username) 문자열을 반환한다고 가정
    foundId.value = res.data
  } catch (err) {
    foundId.value = ''
    alert('일치하는 아이디를 찾을 수 없습니다.')
    console.error(err)
  }
}

// 액션: 비밀번호 재설정 메일
const handleResetPw = async () => {
  if (!findEmail.value) {
    alert('이메일을 입력해주세요.')
    return
  }
  try {
    const res = await axios.post('http://localhost:8080/api/auth/find-password', {
      email: findEmail.value,
    })
    console.log('비밀번호 재설정 메일 발송 성공:', res.data)
    pwSent.value = true
  } catch (err) {
    pwSent.value = false
    console.error('비밀번호 재설정 메일 발송 실패:', err)
    alert('비밀번호 재설정에 실패했습니다. 이메일을 확인해주세요.')
  }
}

const goBack = () => router.push('/login-form')

// 마스킹 처리된 이메일 표시
const maskedId = computed(() => {
  if (!foundId.value) return ''
  const [local, domain] = String(foundId.value).split('@')
  if (!local || !domain) return foundId.value
  const masked = local.slice(0, 2) + '***'
  return masked + '@' + domain
})
</script>

<style scoped>
/* 필요 시 추가 커스터마이징 */
</style>
