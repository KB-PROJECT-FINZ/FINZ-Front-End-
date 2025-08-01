<template>
  <div class="bg-[#f7f8fa] min-h-screen pb-6">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-center relative bg-white py-4 shadow-sm mb-2">
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
        @click="goBack"
      >
        &#8592;
      </button>
      <h1 class="text-xl font-bold text-gray-800 tracking-tight">개념 학습</h1>
    </header>

    <div class="bg-white rounded-2xl mx-4 mt-5 p-6 shadow flex flex-col items-start">
      <div v-if="content?.youtubeUrl" class="w-full max-w-[420px] mx-auto mb-5">
        <iframe
          :src="`https://www.youtube.com/embed/${extractYoutubeId(content.youtubeUrl)}?rel=0&modestbranding=1`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full h-[220px] rounded-xl shadow"
          loading="lazy"
        ></iframe>
      </div>
      <img
        v-else-if="content?.imageUrl"
        :src="content.imageUrl"
        class="w-full max-w-[420px] rounded-xl mb-5 mx-auto shadow"
      />
      <h2 class="text-lg font-bold text-gray-900 mb-3">{{ content?.title }}</h2>
      <div class="text-gray-700 text-base leading-7" v-html="formattedBody"></div>
    </div>

    <!-- 퀴즈 카드 -->
    <div v-if="quiz" class="bg-white rounded-2xl mx-4 mt-5 p-6 shadow flex flex-col items-start">
      <div class="text-[0.92rem] text-yellow-700 bg-yellow-50 rounded px-3 py-1 mb-2 font-bold">
        {{ quiz.creditReward }}크레딧
      </div>
      <div class="text-base font-bold text-gray-900 mb-4">{{ removeOX(quiz.question) }}</div>
      <div class="flex gap-4 w-full justify-center mb-3">
        <button
          class="flex-1 text-lg font-bold rounded-lg py-3 bg-green-50 text-green-600 shadow hover:bg-indigo-100 transition border-2 border-transparent"
          :class="{
            'border-indigo-700 bg-indigo-100 text-indigo-700': selected === 'O',
            'opacity-60 cursor-not-allowed': result !== null,
          }"
          :disabled="result !== null"
          @click="selectOX('O')"
        >
          O (맞음)
        </button>
        <button
          class="flex-1 text-lg font-bold rounded-lg py-3 bg-red-50 text-red-500 shadow hover:bg-indigo-100 transition border-2 border-transparent"
          :class="{
            'border-indigo-700 bg-indigo-100 text-indigo-700': selected === 'X',
            'opacity-60 cursor-not-allowed': result !== null,
          }"
          :disabled="result !== null"
          @click="selectOX('X')"
        >
          X (틀림)
        </button>
      </div>
      <div v-if="result !== null" class="mt-2 w-full">
        <div v-if="result" class="text-green-600 font-bold mb-2 flex items-center gap-2">
          ✅ 정답입니다!
          <span v-if="creditAwarded" class="text-red-500 font-bold animate-pulse"
            >+{{ quiz.creditReward }}크레딧 획득!</span
          >
        </div>
        <div v-else class="text-red-500 font-bold mb-2">❌ 오답입니다.</div>
      </div>
      <div v-if="result !== null && !showExplainBtnClicked" class="w-full">
        <button
          class="bg-gray-100 text-indigo-700 font-bold rounded-lg px-5 py-2 mt-2 hover:bg-indigo-100 transition"
          @click="showExplainBtnClicked = true"
        >
          해설 보기
        </button>
      </div>
      <div
        v-if="result !== null && showExplainBtnClicked"
        class="bg-[#f7f8fa] rounded-lg px-4 py-3 mt-3 w-full text-gray-700 text-[0.98rem]"
      >
        <div class="font-bold mb-1 text-yellow-700">💡 해설</div>
        <div>{{ quiz.comment }}</div>
      </div>
      <div v-if="result !== null" class="w-full flex justify-center mt-5">
        <button
          class="bg-indigo-700 text-white text-base font-bold rounded-lg px-8 py-3 shadow hover:bg-indigo-800 transition"
          :disabled="isCompleted"
          :class="{ 'bg-gray-400 cursor-not-allowed': isCompleted }"
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
const isCompleted = ref(false) // 학습 완료 여부 상태
const creditAwarded = ref(false) // 크레딧 지급 여부

onMounted(async () => {
  const contentId = Number(route.params.id)
  content.value = await fetchLearningContentById(contentId)
  quiz.value = await fetchLearningQuizById(contentId)

  // 완료 여부 체크
  try {
    const completeRes = await axios.get('/api/learning/history/complete', {
      withCredentials: true,
      params: {
        contentId: contentId,
      },
    })
    isCompleted.value = completeRes.data === true
  } catch (e) {
    console.error('완료 여부 확인 실패:', e)
  }

  // 퀴즈 결과 확인
  try {
    const hasResult = await checkQuiz(contentId)
    if (hasResult) {
      const resultRes = await axios.get('/api/learning/quiz/result/detail', {
        withCredentials: true,
        params: {
          quizId: contentId,
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
    console.error('퀴즈 결과 확인 실패:', e)
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
    const hasResult = await checkQuiz(Number(route.params.id))
    if (hasResult) {
      alert('이미 퀴즈를 푸신 콘텐츠입니다.')
      return
    }

    if (result.value) {
      // 정답일 때만 크레딧 지급
      const response = await giveCredit(Number(route.params.id), selected.value)
      creditAwarded.value = true
      alert(`정답입니다! ${quiz.value.creditReward}크레딧이 지급되었습니다!`)
    } else {
      // 오답일 때는 결과만 저장 (크레딧 지급 안함)
      await axios.post(
        '/api/learning/quiz/result/save',
        {
          quizId: Number(route.params.id),
          selectedAnswer: selected.value,
          isCorrect: false,
        },
        { withCredentials: true },
      )
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
    await axios.post(
      '/api/learning/history',
      {
        contentId: Number(route.params.id),
      },
      { withCredentials: true },
    )
    isCompleted.value = true
  } catch (e) {
    console.error('기록 실패:', e)
    alert('기록에 실패했습니다.')
  }
}
</script>
