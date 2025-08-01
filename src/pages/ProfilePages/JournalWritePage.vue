<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">투자 일지</h1>
  </header>

  <div class="journal-write-page px-4 py-6">
    <h2 class="text-lg font-semibold mb-4">오늘의 투자 일지 작성</h2>

    <form @submit.prevent="submitJournal" class="flex flex-col gap-4">
      <label class="font-semibold">감정</label>
      <input
        v-model="form.emotion"
        type="text"
        placeholder="예: 불안, 기쁨 등"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      <label class="font-semibold">이유</label>
      <textarea
        v-model="form.reason"
        placeholder="이유를 입력하세요"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      <label class="font-semibold">실수</label>
      <textarea
        v-model="form.mistake"
        placeholder="실수 내용을 입력하세요"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      <label class="font-semibold">날짜</label>
      <input
        v-model="form.journalDate"
        type="date"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      <button
        type="submit"
        class="bg-indigo-500 text-white py-2 rounded-lg font-bold mt-2 hover:bg-indigo-600 transition"
      >
        저장
      </button>
    </form>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
function goBack() {
  router.back()
}
const form = ref({
  emotion: '',
  reason: '',
  mistake: '',
  journalDate: '',
  userId: null,
})

onMounted(async () => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
  } catch (err) {
    console.error('❌ 유저 정보 조회 실패:', err)
    alert('로그인이 필요합니다')
    router.push('/login-form')
    return
  }

  if (route.query.emotion) form.value.emotion = route.query.emotion
  if (route.query.reason) form.value.reason = route.query.reason
  if (route.query.mistake) form.value.mistake = route.query.mistake
  if (route.query.journalDate) form.value.journalDate = route.query.journalDate
})

const submitJournal = async () => {
  try {
    if (route.query.id) {
      await axios.put(`http://localhost:8080/api/journals/${route.query.id}`, form.value)
      alert('수정 완료!')
    } else {
      await axios.post('http://localhost:8080/api/journals', form.value)
      alert('저장 완료!')
    }
    router.push('/journal')
  } catch (err) {
    console.error(err)
    alert('저장 실패')
    router.push('/journal')
  }
}
</script>
