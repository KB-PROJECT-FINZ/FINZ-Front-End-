<template>
  <div class="feedback-card">
    <div class="feedback-period" v-if="period">
      <span>{{ period }}</span>
    </div>
    <div class="summary-section" v-if="parsed.summary">
      <div class="summary-title">주간 요약</div>
      <div class="summary-content">{{ parsed.summary }}</div>
    </div>
    <div class="ai-feedback-box">
      <div class="ai-title">AI 피드백</div>
      <div class="ai-item">
        <span class="emoji">📝</span>
        <span><strong>강점:</strong> {{ parsed.strength }}</span>
      </div>
      <div class="ai-item">
        <span class="emoji">⚠️</span>
        <span><strong>개선점:</strong> {{ parsed.improvement }}</span>
      </div>
      <div class="ai-item">
        <span class="emoji">⭐</span>
        <span><strong>추천:</strong> {{ parsed.recommendation }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  feedback: String,
  period: String,
})

function parseFeedback(text) {
  const summary = text.match(/요약:\s*([^\n]*)/)?.[1] || ''
  const strength = text.match(/강점:\s*([^\n]*)/)?.[1] || ''
  const improvement = text.match(/개선점:\s*([^\n]*)/)?.[1] || ''
  const recommendation = text.match(/추천:\s*([^\n]*)/)?.[1] || ''
  return { summary, strength, improvement, recommendation }
}

const parsed = computed(() => parseFeedback(props.feedback || ''))
</script>

<style scoped>
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
.summary-section {
  margin-bottom: 16px;
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
  background: #f5f8ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 0;
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
</style>
