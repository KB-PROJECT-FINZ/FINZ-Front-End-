<template>
  <header
    class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
  >
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">AI 피드백 목록</span>
  </header>
  <div class="feedback-list-page px-4 py-6">
    <h2 class="text-xl font-bold text-indigo-600 mb-5">지난 피드백 목록</h2>
    <div v-if="loading" class="text-indigo-500 font-bold my-6">목록을 불러오는 중...</div>
    <div v-else-if="error" class="text-red-500 font-bold my-6">{{ error }}</div>
    <div v-else>
      <FeedbackCard
        v-for="item in feedbackList"
        :key="item.id"
        :feedback="item.feedback"
        :period="`${item.weekStart} ~ ${item.weekEnd} 피드백`"
      />
    </div>
  </div>
</template>
<script setup>
import FeedbackCard from '@/components/FeedbackCard.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFeedbackList } from '@/services/feedback.js'

const router = useRouter()
const feedbackList = ref([])
const loading = ref(true)
const error = ref('')

function goBack() {
  router.push({ name: 'feedback' })
}

onMounted(async () => {
  try {
    const res = await fetchFeedbackList()
    feedbackList.value = Array.isArray(res) ? res : [res]
  } catch (err) {
    error.value = '피드백 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>
