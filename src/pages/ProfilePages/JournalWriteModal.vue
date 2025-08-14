<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 relative">
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        @click="$emit('close')"
        aria-label="닫기"
      >
        &times;
      </button>
      <h2 class="text-lg font-bold text-gray-900 mb-4 text-center">투자 일지 작성</h2>
      <form @submit.prevent="submitJournal">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1 ml-[3px]">감정</label>
          <input
            v-model="form.emotion"
            type="text"
            maxlength="10"
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 기쁨, 불안 등"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1 ml-[3px]">이유</label>
          <textarea
            v-model="form.reason"
            rows="2"
            maxlength="100"
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="오늘의 투자 이유를 적어주세요"
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1 ml-[3px]">실수</label>
          <textarea
            v-model="form.mistake"
            rows="2"
            maxlength="100"
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="오늘의 실수나 아쉬운 점을 적어주세요"
          ></textarea>
        </div>
        <div class="flex gap-3 mt-4 w-full">
          <button
            type="submit"
            :disabled="!form.emotion || !form.reason || !form.mistake"
            :class="[
              'flex-1 py-2 px-4 rounded-lg transition-colors',
              !form.emotion || !form.reason || !form.mistake
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600',
            ]"
          >
            {{ props.id ? '수정' : '확인' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
      <SuccessModal :visible="showValidationModal" :message="validationMessage" emoji="❗️" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { createJournal, updateJournal } from '@/services/journal.js'
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
const form = ref({
  emotion: '',
  reason: '',
  mistake: '',
  journalDate: '',
})
const showValidationModal = ref(false)
const validationMessage = ref('')
function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
onMounted(() => {
  form.value.emotion = props.emotion || ''
  form.value.reason = props.reason || ''
  form.value.mistake = props.mistake || ''
  form.value.journalDate = props.journalDate || getTodayDate()
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
      emit('saved', 'edit')
    } else {
      await createJournal(form.value)
      emit('saved', 'create')
    }
    emit('close')
  } catch (err) {
    alert('저장 실패')
  }
}
</script>
<style scoped>
/* ProfileEditModal 참고: 배경 투명도 적용 */
.bg-opacity-40 {
  background-color: rgba(0, 0, 0, 0.4);
}

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
