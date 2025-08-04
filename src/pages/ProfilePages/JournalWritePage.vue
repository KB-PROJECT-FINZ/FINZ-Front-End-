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
    <h2 class="text-lg font-semibold mb-4">{{ formattedDateTitle }} 투자 일지 작성</h2>
    <div v-if="matchedTransactions.length" class="mt-4 mb-4">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(t, index) in matchedTransactions"
          :key="index"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium shadow-sm',
            t.transactionType === 'BUY' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800',
          ]"
        >
          {{ t.transactionType === 'BUY' ? '매수' : '매도' }} {{ t.stockName }} {{ t.quantity }}주
        </div>
      </div>
    </div>

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
  <SuccessModal :message="successMessage" :visible="showSuccess" />
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import SuccessModal from '@/components/SuccessModal.vue'

const formattedDateTitle = computed(() => {
  if (!form.value.journalDate) return '오늘'
  const [year, month, day] = form.value.journalDate.split('-')
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
})
const transactions = ref([])
const route = useRoute()
const router = useRouter()
const showSuccess = ref(false)
const successMessage = ref('저장')
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
const matchedTransactions = computed(() => {
  if (!form.value.journalDate) return []
  return transactions.value.filter((t) => {
    const dateOnly = t.executedAt?.slice(0, 10)
    return dateOnly === form.value.journalDate
  })
})

function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // 'YYYY-MM-DD'
}

onMounted(async () => {
  if (route.query.emotion) form.value.emotion = route.query.emotion
  if (route.query.reason) form.value.reason = route.query.reason
  if (route.query.mistake) form.value.mistake = route.query.mistake
  if (route.query.journalDate) {
    form.value.journalDate = route.query.journalDate
  } else {
    form.value.journalDate = getTodayDate()
  }
  // 거래 내역 불러오기
  try {
    const response = await axios.get('/api/trading/transactions', {
      withCredentials: true,
    })
    transactions.value = response.data
  } catch (error) {
    console.error('❌ 거래 내역 불러오기 실패:', error)
  }
})
const submitJournal = async () => {
  try {
    if (route.query.id) {
      await axios.put(`http://localhost:8080/api/journals/${route.query.id}`, form.value)
      successMessage.value = '수정'
    } else {
      await axios.post('http://localhost:8080/api/journals', form.value)
      successMessage.value = '저장'
    }
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      router.push('/journal')
    }, 1500)
  } catch (err) {
    console.error(err)
    alert('실패했습니다.')
    router.push('/journal')
  }
}
</script>
