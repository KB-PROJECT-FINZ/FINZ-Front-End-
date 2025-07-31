<template>
  <header class="header">
    <button class="back-btn" @click="goBack">&#8592;</button>
    <h1 class="app-title">AI 피드백 목록</h1>
  </header>
  <div class="feedback-list-page">
    <h2>지난 피드백 목록</h2>
    <div v-if="loading" class="loading">목록을 불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
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
    console.log('피드백 목록:', res.data)
    feedbackList.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (e) {
    error.value = '피드백 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #fff;
  padding: 18px 0 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}
.back-btn {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
}
.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
  letter-spacing: -1px;
}
.feedback-list-page {
  padding: 24px;
}
h2 {
  font-size: 20px;
  font-weight: bold;
  color: #6166cc;
  margin-bottom: 18px;
}
.feedback-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(97, 102, 204, 0.08);
  padding: 16px;
  margin-bottom: 18px;
}
.feedback-period {
  font-weight: bold;
  color: #3a3d4b;
  margin-bottom: 8px;
  font-size: 15px;
}
.feedback-content {
  color: #212529;
  font-size: 15px;
  white-space: pre-line;
}
.loading {
  color: #6166cc;
  font-weight: bold;
  margin: 24px 0;
}
.error {
  color: #ff4d4f;
  font-weight: bold;
  margin: 24px 0;
}
</style>
