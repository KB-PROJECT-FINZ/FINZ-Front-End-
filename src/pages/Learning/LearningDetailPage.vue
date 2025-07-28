<template>
  <div class="detail-page">
    <!-- 상단 헤더 -->
    <header class="header">
      <button class="back-btn" @click="goBack">&#8592;</button>
      <h1 class="app-title">개념 학습</h1>
    </header>

    <div class="detail-content">
      <div v-if="content?.youtubeUrl" class="video-wrap">
        <iframe
          :src="`https://www.youtube.com/embed/${extractYoutubeId(content.youtubeUrl)}`"
          frameborder="0"
          allowfullscreen
          class="youtube-player"
        ></iframe>
      </div>
      <img v-else-if="content?.imageUrl" :src="content.imageUrl" class="detail-thumb" />
      <h2 class="detail-title">{{ content?.title }}</h2>
      <div class="detail-body" v-html="formattedBody"></div>
    </div>
    <!-- 퀴즈 카드 -->
    <div v-if="quiz" class="quiz-card">
      <div class="quiz-credit">🎁 {{ quiz.creditReward }}크레딧 획득 가능</div>
      <div class="quiz-question">{{ removeOX(quiz.question) }}</div>
      <div class="quiz-ox-choices">
        <button
          class="quiz-ox-btn o-btn"
          :class="{ selected: selected === 'O', disabled: result !== null }"
          :disabled="result !== null"
          @click="selectOX('O')"
        >
          O (맞음)
        </button>
        <button
          class="quiz-ox-btn x-btn"
          :class="{ selected: selected === 'X', disabled: result !== null }"
          :disabled="result !== null"
          @click="selectOX('X')"
        >
          X (틀림)
        </button>
      </div>
      <div v-if="result !== null" class="quiz-feedback">
        <div v-if="result" class="quiz-correct">
          ✅ 정답입니다! 
          <span v-if="creditAwarded" class="credit-awarded">+{{ quiz.creditReward }}크레딧 획득!</span>
        </div>
        <div v-else class="quiz-wrong">❌ 오답입니다.</div>
      </div>
      <div v-if="result !== null && !showExplainBtnClicked">
        <button class="quiz-explain-toggle" @click="showExplainBtnClicked = true">해설 보기</button>
      </div>
      <div v-if="result !== null && showExplainBtnClicked" class="quiz-explain">
        <div class="quiz-ex-title">💡 해설</div>
        <div class="quiz-ex-body">{{ quiz.comment }}</div>
      </div>

      <div v-if="result !== null" class="complete-button-wrap">
        <button class="complete-btn" @click="handleComplete">학습 완료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchLearningContentById, fetchLearningQuizById, awardQuizCredit } from '../../services/learning'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const content = ref(null)
const quiz = ref(null)
const selected = ref('')
const result = ref(null)
const showExplainBtnClicked = ref(false)
const userId = Number(localStorage.getItem('userId') || 1)
const creditAwarded = ref(false) // 크레딧 지급 여부

onMounted(async () => {
  content.value = await fetchLearningContentById(route.params.id)
  quiz.value = await fetchLearningQuizById(route.params.id)
})

function goBack() {
  router.back()
}

function selectOX(val) {
  if (result.value !== null) return
  selected.value = val
  result.value = selected.value === quiz.value.answer
  showExplainBtnClicked.value = false // 선택 시 해설은 다시 숨김
  
  // 정답이고 아직 크레딧을 지급하지 않았다면 크레딧 지급
  if (result.value && !creditAwarded.value) {
    awardQuizCreditLocal();
  }
}

async function awardQuizCreditLocal() {
  try {
    const response = await awardQuizCredit(userId, Number(route.params.id));
    creditAwarded.value = true;
    alert(`정답입니다! ${quiz.value.creditReward}크레딧이 지급되었습니다!`);
  } catch (e) {
    console.error('크레딧 지급 실패:', e);
  }
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\/|youtube.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  return match ? match[1] : ''
}

function removeOX(text) {
  return text ? text.replace(/\s*\(O\/X\)/gi, '') : ''
}

// 본문 줄바꿈, 리스트 등 간단 포맷팅
const formattedBody = computed(() => {
  if (!content.value?.body) return ''
  let html = content.value.body
    .replace(/\n/g, '<br>')
    .replace(/•\s?(.+?)(?=<br>|$)/g, '<li>$1</li>')
  if (html.includes('<li>')) html = '<ul>' + html + '</ul>'
  return html
})

async function handleComplete() {
  try {
    await axios.post('/learning/history', {
      userId,
      contentId: Number(route.params.id),
    })
    alert('학습 완료가 기록되었습니다!')
  } catch (e) {
    console.error('기록 실패:', e)
    alert('기록에 실패했습니다.')
  }
}
</script>

<style scoped>
.detail-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 24px;
}
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
.detail-content {
  background: #fff;
  border-radius: 18px;
  margin: 18px 16px 0 16px;
  padding: 22px 18px 18px 18px;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.detail-thumb {
  width: 100%;
  max-width: 420px;
  height: auto;
  border-radius: 14px;
  margin: 0 auto 18px auto;
  display: block;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
}
.detail-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 14px;
  margin-top: 0;
}
.detail-body {
  color: #444;
  font-size: 1rem;
  line-height: 1.7;
  word-break: keep-all;
}
.detail-body ul {
  margin: 10px 0 10px 18px;
  padding-left: 0;
}
.detail-body li {
  margin-bottom: 6px;
  list-style: disc inside;
}
.quiz-card {
  background: #fff;
  border-radius: 16px;
  margin: 18px 16px 0 16px;
  padding: 20px 18px 18px 18px;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.quiz-credit {
  font-size: 0.92rem;
  color: #bfa700;
  background: #fffbe6;
  border-radius: 8px;
  padding: 2px 10px;
  margin-bottom: 10px;
  font-weight: bold;
}
.quiz-question {
  font-size: 1.08rem;
  font-weight: bold;
  margin-bottom: 14px;
  color: #222;
}
.quiz-choices {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.quiz-choice {
  background: #f3f4f6;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  transition:
    background 0.15s,
    border 0.15s;
}
.quiz-choice.selected {
  background: #e0e7ff;
  border: 1.5px solid #3730a3;
  color: #3730a3;
}
.quiz-choice.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.quiz-ox-choices {
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
  justify-content: center;
  width: 100%;
}
.quiz-ox-btn {
  flex: 1 1 0;
  font-size: 1.15rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 12px 0;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.07);
}
.o-btn {
  background: #e0f7e9;
  color: #22b573;
}
.x-btn {
  background: #ffeaea;
  color: #e74c3c;
}
.quiz-ox-btn.selected {
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.13);
  border: 2px solid #3730a3;
  background: #e0e7ff;
  color: #3730a3;
}
.quiz-ox-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.quiz-submit {
  background: #3730a3;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.quiz-submit:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
.quiz-feedback {
  margin: 10px 0 0 0;
  font-size: 1.05rem;
  font-weight: bold;
}
.quiz-correct {
  color: #059669;
  font-weight: bold;
  margin-bottom: 12px;
}

.credit-awarded {
  color: #dc2626;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.quiz-wrong {
  color: #e74c3c;
}
.quiz-explain {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 10px 14px;
  margin-top: 14px;
  color: #444;
  font-size: 0.98rem;
}
.quiz-ex-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #bfa700;
}
.quiz-explain-toggle {
  background: #f3f4f6;
  color: #3730a3;
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}
.quiz-explain-toggle:hover {
  background: #e0e7ff;
}
.video-wrap {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 18px auto;
}
.youtube-player {
  width: 100%;
  height: 220px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
}
@media (max-width: 600px) {
  .detail-content,
  .quiz-card {
    margin: 14px 4px 0 4px;
    padding: 16px 6px 14px 10px;
  }
  .detail-thumb {
    max-width: 100vw;
  }
}
.complete-button-wrap {
  width: 100%;
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.complete-btn {
  background: #3730a3;
  color: #fff;
  font-size: 1.05rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s ease;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
}

.complete-btn:hover {
  background: #4b39b0;
}
</style>
