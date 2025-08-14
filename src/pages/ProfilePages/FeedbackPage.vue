<template>
  <header
    class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
  >
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">AI 피드백</span>
  </header>
  <div class="feedback-page px-6 py-6">
    <div class="flex items-center font-bold text-[18px] mb-5 text-gray-800 gap-2">
      <img
        src="https://cdn-icons-png.flaticon.com/128/14700/14700716.png"
        alt="분석 아이콘"
        class="w-9 h-9"
      />
      <span>지난 주 투자 분석</span>
    </div>
    <div v-if="loading" class="text-gray-500 font-bold my-6">피드백을 불러오는 중...</div>
    <div v-else-if="error" class="text-red-500 font-bold my-6">{{ error }}</div>
    <div v-else-if="rawFeedback">
      <div v-if="rawFeedback.feedback">
        <FeedbackCard :feedback="rawFeedback.feedback" />
      </div>
      <div v-else class="text-gray-500 my-4">
        {{ rawFeedback.statusMessage }}
      </div>
    </div>
    <router-link
      :to="{ name: 'feedbacklist' }"
      class="block w-full bg-white border border-gray-200 rounded-xl py-3 mt-6 mb-6 text-blue-600 font-semibold text-lg shadow text-center hover:bg-indigo-50 transition"
    >
      지난 피드백 보기
    </router-link>
  </div>
</template>

<script setup>
import FeedbackCard from '@/components/FeedbackCard.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAiFeedback } from '@/services/feedback.js'

const router = useRouter()
const rawFeedback = ref(null)
const loading = ref(true)
const error = ref('')

function goBack() {
  router.push({ name: 'journal' })
}

onMounted(async () => {
  try {
    rawFeedback.value = await fetchAiFeedback()
  } catch (err) {
    error.value = '피드백을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>
