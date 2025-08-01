<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">AI 피드백 목록</h1>
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
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() {
  router.back()
}

const feedbackList = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/feedback', {
      withCredentials: true,
    })
    feedbackList.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (e) {
    error.value = '피드백 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>
