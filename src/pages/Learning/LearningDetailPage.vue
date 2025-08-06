<template>
  <div class="bg-gray-50 min-h-screen pb-6">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-center relative bg-white py-4 px-4 shadow-sm mb-2">
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-none border-none text-2xl text-gray-800 cursor-pointer"
        @click="goBack"
      >
        &#8592;
      </button>
      <h1 class="text-xl font-bold text-gray-800 tracking-tight">개념 학습</h1>
    </header>

    <div class="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm">
      <div v-if="content?.youtubeUrl" class="w-full max-w-md mx-auto mb-4">
        <iframe
          :src="`https://www.youtube.com/embed/${extractYoutubeId(content.youtubeUrl)}?rel=0&modestbranding=1`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full h-56 rounded-xl shadow-md"
          loading="lazy"
        ></iframe>
      </div>
      <img
        v-else-if="content?.imageUrl"
        :src="content.imageUrl"
        class="w-full max-w-md h-auto rounded-xl mx-auto mb-4 shadow-md"
      />
      <h2 class="text-xl font-bold text-gray-800 mb-3">{{ content?.title }}</h2>
      <div class="text-gray-600 text-base leading-relaxed" v-html="formattedBody"></div>
    </div>

    <!-- 퀴즈 카드 -->
    <div v-if="quiz" class="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm">
      <div
        class="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1 mb-3 font-bold inline-block"
      >
        {{ quiz.creditReward }}크레딧
      </div>
      <div class="text-lg font-bold text-gray-800 mb-4">{{ removeOX(quiz.question) }}</div>

      <div class="flex gap-4 mb-3 justify-center">
        <button
          class="flex-1 text-lg font-bold border-none rounded-lg py-3 cursor-pointer transition-all duration-150 shadow-sm"
          :class="[
            selected === 'O'
              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-700 shadow-md'
              : 'bg-green-50 text-green-600',
            result !== null ? 'opacity-60 cursor-not-allowed' : '',
          ]"
          :disabled="result !== null"
          @click="selectOX('O')"
        >
          O (맞음)
        </button>
        <button
          class="flex-1 text-lg font-bold border-none rounded-lg py-3 cursor-pointer transition-all duration-150 shadow-sm"
          :class="[
            selected === 'X'
              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-700 shadow-md'
              : 'bg-red-50 text-red-600',
            result !== null ? 'opacity-60 cursor-not-allowed' : '',
          ]"
          :disabled="result !== null"
          @click="selectOX('X')"
        >
          X (틀림)
        </button>
      </div>

      <div v-if="result !== null" class="mt-3">
        <div v-if="result" class="text-green-600 font-bold text-lg mb-3">
          ✅ 정답입니다!
          <span v-if="creditAwarded" class="text-red-600 font-bold animate-pulse"
            >+{{ quiz.creditReward }}크레딧 획득!</span
          >
        </div>
        <div v-else class="text-red-600 font-bold text-lg mb-3">❌ 오답입니다.</div>
      </div>

      <div v-if="result !== null && !showExplainBtnClicked">
        <button
          class="bg-gray-100 text-indigo-700 border-none rounded-lg px-4 py-2 text-base font-bold mt-3 cursor-pointer transition-all duration-150 hover:bg-indigo-50"
          @click="showExplainBtnClicked = true"
        >
          해설 보기
        </button>
      </div>

      <div
        v-if="result !== null && showExplainBtnClicked"
        class="bg-gray-50 rounded-xl p-4 mt-4 text-gray-600"
      >
        <div class="font-bold mb-2 text-amber-700">💡 해설</div>
        <div class="text-sm">{{ quiz.comment }}</div>
      </div>

      <div v-if="result !== null" class="w-full mt-4 flex justify-center">
        <button
          class="bg-indigo-700 text-white text-lg font-bold border-none rounded-lg py-3 px-6 cursor-pointer transition-all duration-200 shadow-md hover:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="isCompleted"
          @click="handleComplete"
        >
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
        selectedAnswer: selected.value,
      })
      const response = await giveCredit(userId.value, quiz.value.quizId, selected.value)
      creditAwarded.value = true
      alert(`정답입니다! ${quiz.value.creditReward}크레딧이 지급되었습니다!`)
    } else {
      // 오답일 때는 결과만 저장 (크레딧 지급 안함)
      console.log('퀴즈 결과 저장:', {
        userId: userId.value,
        quizId: quiz.value?.quizId,
        selectedAnswer: selected.value,
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
