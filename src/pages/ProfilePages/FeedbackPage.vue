<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">AI 피드백</h1>
  </header>
  <div class="feedback-page px-6 py-6">
    <div class="flex items-center font-bold text-[20px] mb-5 text-gray-800 gap-2">
      <span
        class="text-[23px] rounded-full p-1 bg-gradient-to-r from-indigo-500 to-indigo-300 text-white"
        >🤖</span
      >
      <span>이번 주 투자 분석</span>
    </div>
    <div v-if="loading" class="text-indigo-500 font-bold my-6">피드백을 불러오는 중...</div>
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
      class="block w-full bg-white border border-gray-200 rounded-xl py-3 mt-6 mb-6 text-indigo-600 font-bold text-lg shadow text-center hover:bg-indigo-50 transition"
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
