<template>
  <header class="header">
    <button class="back-btn" @click="goBack">&#8592;</button>
    <h1 class="app-title">AI 피드백</h1>
  </header>
  <div class="feedback-page">
    <div class="feedback-title">
      <span class="ai-icon">🤖</span>
      <span class="ai-header">이번 주 투자 분석</span>
    </div>
    <div v-if="loading" class="loading">피드백을 불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="rawFeedback">
      <FeedbackCard :feedback="rawFeedback" />
    </div>
    <!-- 버튼은 항상 보이게 -->
    <router-link :to="{ name: 'feedbacklist' }" class="prev-btn">지난 피드백 보기</router-link>
  </div>
</template>

<script setup>
import BottomNavigation from '@/components/FooterNavigation.vue'
import FeedbackCard from '@/components/FeedbackCard.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()
const rawFeedback = ref('')
const loading = ref(true)
const error = ref('')
function goBack() {
  router.back()
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/gpt')
    rawFeedback.value = res.data.feedback // feedback만 저장!
  } catch (e) {
    error.value = '피드백을 불러오지 못했습니다.'
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
.feedback-page {
  padding: 24px;
}
.feedback-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #3a3d4b;
  gap: 8px;
}
.ai-icon {
  font-size: 23px;
  border-radius: 50%;
  padding: 6px;
  color: #fff;
}
.ai-title {
  font-size: 15px;
}
.summary-section {
  margin-bottom: 16px;

  background: #f5f8ff;
  border-radius: 12px;
  padding: 18px 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(97, 102, 204, 0.08);
}
.summary-title {
  font-weight: bold;
  color: #6166cc;
  margin-bottom: 8px;
  font-size: 16px;
}
.summary-content {
  color: #212529;
  font-size: 15px;
  line-height: 1.6;
}
.ai-feedback-box {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(97, 102, 204, 0.08);
}
.ai-title {
  font-weight: bold;
  color: #6166cc;
  margin-bottom: 10px;
  font-size: 15px;
}
.ai-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  color: #212529;
}
.emoji {
  font-size: 18px;
  margin-top: 2px;
}
.prev-btn {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e6ee;
  border-radius: 12px;
  padding: 12px;
  color: #6166cc;
  font-weight: bold;
  font-size: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(97, 102, 204, 0.04);
  cursor: pointer;
  transition: background 0.2s;
  display: block;
  text-align: center;
  text-decoration: none;
}
.prev-btn:hover {
  background: #f5f8ff;
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
