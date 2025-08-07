<template>
  <div class="px-5 py-6 bg-gray-50 min-h-screen">
    <h1 class="text-xl font-bold mb-4">📝 오늘의 퀴즈</h1>
    <p class="text-sm text-gray-600 mb-4">매일 퀴즈로 금융 감각을 키워보세요!</p>

    <div v-for="quiz in quizzes" :key="quiz.id" class="bg-white p-4 rounded-xl shadow-sm mb-3">
      <p class="text-xs text-yellow-600 font-bold mb-1">{{ quiz.credit }} 크레딧</p>
      <p class="font-semibold text-gray-800">{{ quiz.title }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const quizzes = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('/api/quiz/today', { withCredentials: true })
    quizzes.value = res.data
  } catch (err) {
    console.error('퀴즈 불러오기 실패:', err)
  }
})
</script>
