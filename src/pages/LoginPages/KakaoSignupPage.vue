<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-2xl font-bold mb-4">카카오 회원가입</h2>

    <div v-if="email">
      <p><strong>이메일:</strong> {{ email }}</p>
    </div>

    <div>
      <label class="block mb-1 text-sm">닉네임</label>
      <input v-model="nickname" type="text" class="w-full border px-3 py-2 rounded" />
    </div>

    <div>
      <label class="block mb-1 text-sm">투자 성향</label>
      <select v-model="riskType" class="w-full border px-3 py-2 rounded">
        <option value="CSD">신중한 안정형</option>
        <option value="BSS">균형 수익형</option>
        <option value="AGR">적극적 성장형</option>
        <option value="EXP">실험적 모험형</option>
      </select>
    </div>

    <button
      @click="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      회원가입 완료
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const nickname = ref('')
const riskType = ref('CSD')
const router = useRouter()

// 1️⃣ 세션에 저장된 이메일/닉네임 가져오기
onMounted(async () => {
  const res = await axios.get('/api/auth/kakao-info')
  email.value = res.data.email
  nickname.value = res.data.nickname || ''
})

// 2️⃣ 카카오 회원가입 완료 요청
const submit = async () => {
  try {
    const payload = {
      username: email.value,
      nickname: nickname.value,
      riskType: riskType.value,
    }
    await axios.post('/api/auth/kakao-signup', payload)
    alert('회원가입 완료!')
    router.push('/')
  } catch (e) {
    alert('회원가입 실패: ' + e.response?.data || e.message)
  }
}
</script>
