<template>
  <transition name="slide-up">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end justify-center">
      <!-- LearningDetailPage 참고: bg-gray-900/60 -->
      <div class="absolute inset-0 bg-gray-900/60" @click="$emit('close')"></div>
      <div
        class="bg-white w-full max-w-md rounded-t-2xl p-6 pt-8 pb-safe shadow-lg animate-slide-up relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <button class="absolute top-2 right-2 text-2xl z-20" @click="$emit('close')">×</button>
        <h2 class="text-lg font-semibold mb-4">{{ formattedDateTitle }} 투자 일지 작성</h2>
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
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-lg border font-bold"
              @click="$emit('close')"
            >
              취소
            </button>
            <button
              type="submit"
              class="flex-1 bg-indigo-500 text-white py-2 rounded-lg font-bold hover:bg-indigo-600 transition"
            >
              저장
            </button>
          </div>
        </form>
      </div>
      <SuccessModal :visible="showValidationModal" :message="validationMessage" emoji="❗️" />
    </div>
  </transition>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { createJournal, updateJournal } from '@/services/journal.js'
import { useTransactionsData } from '@/services/useTranscationsData.js'
import SuccessModal from '@/components/SuccessModal.vue'
const props = defineProps({
  id: String,
  emotion: String,
  reason: String,
  mistake: String,
  journalDate: String,
  visible: { type: Boolean, default: true },
})
const emit = defineEmits(['close', 'saved'])
const { fetchTransactions } = useTransactionsData()
const form = ref({
  emotion: '',
  reason: '',
  mistake: '',
  journalDate: '',
  userId: null,
})
const showValidationModal = ref(false)
const validationMessage = ref('')
const formattedDateTitle = computed(() => {
  if (!form.value.journalDate) return '오늘'
  const [year, month, day] = form.value.journalDate.split('-')
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
})
function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
onMounted(async () => {
  form.value.emotion = props.emotion || ''
  form.value.reason = props.reason || ''
  form.value.mistake = props.mistake || ''
  form.value.journalDate = props.journalDate || getTodayDate()
  try {
    await fetchTransactions()
  } catch (error) {
    console.error('❌ 거래내역 불러오기 실패:', error)
  }
})
async function submitJournal() {
  if (!form.value.journalDate || !form.value.emotion || !form.value.reason || !form.value.mistake) {
    validationMessage.value = '모든 항목을 입력해 주세요.'
    showValidationModal.value = true
    setTimeout(() => {
      showValidationModal.value = false
    }, 1500)
    return
  }
  try {
    if (props.id) {
      await updateJournal(props.id, form.value)
    } else {
      await createJournal(form.value)
    }
    emit('saved')
    emit('close')
  } catch (err) {
    alert('저장 실패')
  }
}
</script>
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 2, 0.6, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
