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
          :src="`https://www.youtube.com/embed/${extractYoutubeId(content.youtubeUrl)}?rel=0&modestbranding=1`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="youtube-player"
          loading="lazy"
        ></iframe>
      </div>
      <img v-else-if="content?.imageUrl" :src="content.imageUrl" class="detail-thumb" />
      <h2 class="detail-title">{{ content?.title }}</h2>
      <div class="detail-body" v-html="formattedBody"></div>
    </div>
    <!-- 퀴즈 카드 -->
    <div v-if="quiz" class="quiz-card">
      <div class="quiz-credit">{{ quiz.creditReward }}크레딧</div>
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
          <span v-if="creditAwarded" class="credit-awarded"
            >+{{ quiz.creditReward }}크레딧 획득!</span
          >
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
        <button class="complete-btn" :disabled="isCompleted" @click="handleComplete">
          {{ isCompleted ? '✅ 완료됨' : '학습 완료' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchLearningContentById,
  fetchLearningQuizById,
  giveCredit,
  checkQuiz,
} from '../../services/learning'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const content = ref(null)
const quiz = ref(null)
const selected = ref('')
const result = ref(null)
const showExplainBtnClicked = ref(false)
const userId = ref(null) // 세션에서 가져올 예정
const user = ref(null)
const isCompleted = ref(false) // 학습 완료 여부 상태
const creditAwarded = ref(false) // 크레딧 지급 여부

onMounted(async () => {
  try {
    // 세션에서 사용자 정보 가져오기
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    userId.value = res.data.userId || res.data.id

    if (!userId.value) {
      console.error('사용자 ID를 가져올 수 없습니다.')
      return
    }

    console.log('현재 사용자 ID:', userId.value)
  } catch (e) {
    console.error('세션 정보 로딩 실패:', e)
    // 세션 실패 시 로컬스토리지 fallback
    userId.value = Number(localStorage.getItem('userId') || 1)
  }

  const contentId = Number(route.params.id)
  content.value = await fetchLearningContentById(contentId)
  quiz.value = await fetchLearningQuizById(contentId)

  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    user.value = res.data

    const userId = user.value.userId // 세션 기반 userId
    const contentId = Number(route.params.id)

    // 콘텐츠 로드
    content.value = await fetchLearningContentById(contentId)
    quiz.value = await fetchLearningQuizById(contentId)

    // 완료 여부 체크
    const completeRes = await axios.get('/api/learning/history/complete', {
      params: {
        userId: userId.value,
        contentId: Number(route.params.id),
      },
    })
    isCompleted.value = completeRes.data === true
  } catch (e) {
    console.error('초기 로딩 실패', e)
  }

  // 퀴즈 결과 확인
  try {
    const hasResult = await checkQuiz(userId.value, Number(route.params.id))
    if (hasResult) {
      // 실제 퀴즈 결과 가져오기
      const resultRes = await axios.get('/api/learning/quiz/result/detail', {
        params: {
          userId: userId.value,
          quizId: Number(route.params.id),
        },
      })

      if (resultRes.data) {
        const quizResult = resultRes.data
        selected.value = quizResult.selectedAnswer
        result.value = quizResult.isCorrect
        creditAwarded.value = quizResult.creditEarned > 0
      }
    }
  } catch (e) {
    console.warn('퀴즈 결과 확인 실패', e)
  }
})

function goBack() {
  router.back()
}

function selectOX(val) {
  if (result.value !== null) return
  selected.value = val
  result.value = selected.value === quiz.value.answer
  showExplainBtnClicked.value = false // 선택 시 해설은 다시 숨김

  // 퀴즈 결과 처리 (정답이든 오답이든)
  if (!creditAwarded.value) {
    awardQuizCreditLocal()
  }
}

async function awardQuizCreditLocal() {
  try {
    // 이미 퀴즈를 풀었는지 확인
    const hasResult = await checkQuiz(userId.value, Number(route.params.id))
    if (hasResult) {
      alert('이미 퀴즈를 푸신 콘텐츠입니다.')
      return
    }

    if (result.value) {
      // 정답일 때만 크레딧 지급
      console.log('크레딧 지급 시도:', {
        userId: userId.value,
        quizId: quiz.value?.quizId,
        selectedAnswer: selected.value
      })
      const response = await giveCredit(userId.value, quiz.value.quizId, selected.value)
      creditAwarded.value = true
      alert(`정답입니다! ${quiz.value.creditReward}크레딧이 지급되었습니다!`)
    } else {
      // 오답일 때는 결과만 저장 (크레딧 지급 안함)
      console.log('퀴즈 결과 저장:', {
        userId: userId.value,
        quizId: quiz.value?.quizId,
        selectedAnswer: selected.value
      })
      await axios.post('/api/learning/quiz/result/save', {
        userId: userId.value,
        quizId: quiz.value.quizId,
        selectedAnswer: selected.value,
        isCorrect: false,
      })
      alert('오답입니다. 다시 시도해보세요!')
    }
  } catch (e) {
    console.error('크레딧 지급 실패:', e)
    if (e.response?.data) {
      alert(e.response.data)
    }
  }
}

function extractYoutubeId(url) {
  if (!url) return ''

  // 다양한 YouTube URL 형식 지원
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  console.warn('YouTube URL 파싱 실패:', url)
  return ''
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
    await axios.post('/api/learning/history', {
      userId: user.value.userId,
      contentId: Number(route.params.id),
    })
    isCompleted.value = true
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
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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

