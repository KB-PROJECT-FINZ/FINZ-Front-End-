<template>
  <Header />
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
    <BottomNavigation />
  </div>
</template>

<script setup>
import BottomNavigation from '@/components/FooterNavigation.vue'
import Header from '@/components/Header.vue'
import FeedbackCard from '@/components/FeedbackCard.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const feedbackList = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/feedback')
    feedbackList.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (e) {
    error.value = '피드백 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.feedback-list-page {
  padding: 24px;
  background: #f6f8fc;
  min-height: 100vh;
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
