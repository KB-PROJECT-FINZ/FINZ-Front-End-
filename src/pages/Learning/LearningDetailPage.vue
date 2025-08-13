<template>
  <div class="bg-[#f7f8fa] min-h-screen pb-6">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">개념학습</span>
    </header>

    <!-- 아티클 영역 -->
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
      <h2 class="text-lg font-bold text-gray-900 mb-3">{{ formattedTitle }}</h2>
      <div
        class="text-gray-700 text-base leading-7"
        v-html="formattedBody"
        style="word-break: keep-all; white-space: pre-line"
      ></div>
    </div>

    <!-- 퀴즈 풀러가기 버튼 -->
    <div v-if="quiz && !isCompleted && !showQuizModal" class="mx-4 mt-5">
      <button
        class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow hover:bg-indigo-700 transition"
        @click="showQuizModal = true"
      >
        퀴즈 풀러가기
      </button>
    </div>

    <!-- 이미 완료된 콘텐츠 -->
    <div
      v-else-if="isCompleted"
      class="mx-4 mt-5 text-center text-gray-600 font-semibold text-[0.95rem]"
    >
      ✅ 학습을 완료한 콘텐츠입니다.
    </div>

    <!-- 퀴즈 모달 -->
    <div v-if="showQuizModal" class="fixed inset-0 z-50 flex items-center" @click="closeQuizModal">
      <!-- 톤다운된 배경 -->
      <div class="absolute inset-0 bg-gray-900/60"></div>

      <!-- 모달 컨테이너 -->
      <div
        class="bg-white w-full max-w-[336px] mx-auto rounded-2xl p-6 relative z-10"
        :class="!isModalDragging ? 'transition-transform duration-200' : ''"
        :style="{ transform: `translateY(${modalDragOffset}px)` }"
        @click.stop
        @mousedown="onModalDragStart"
        @touchstart="onModalDragStart"
        @mousemove="onModalDragMove"
        @touchmove="onModalDragMove"
        @mouseup="onModalDragEnd"
        @mouseleave="onModalDragEnd"
        @touchend="onModalDragEnd"
      >
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"></div>
        <template v-if="result === null">
          <div
            class="text-[0.92rem] text-yellow-700 bg-yellow-50 rounded px-3 py-1 mb-2 font-bold text-center"
          >
            {{ quiz.creditReward }}크레딧
          </div>
          <div class="text-base font-bold text-gray-900 mb-4 text-center">
            {{ removeOX(quiz.question) }}
          </div>
          <div class="flex gap-4 w-full justify-center mb-3">
            <button
              class="flex flex-col items-center justify-center aspect-square max-w-[110px] flex-1 rounded-lg shadow border-2 border-transparent transition bg-blue-50 hover:bg-blue-100"
              :class="{
                'bg-blue-100 border-blue-700': selected === 'O',
                'opacity-60 cursor-not-allowed': result !== null,
              }"
              :disabled="result !== null"
              @click="selectOX('O')"
            >
              <svg class="w-8 h-8 mb-1" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="16" stroke="#2563eb" stroke-width="6" fill="none" />
              </svg>
              <span class="text-blue-700 font-bold text-base">그렇다</span>
            </button>
            <button
              class="flex flex-col items-center justify-center aspect-square max-w-[110px] flex-1 rounded-lg shadow border-2 border-transparent transition bg-red-50 hover:bg-red-100"
              :class="{
                'bg-red-100 border-red-700': selected === 'X',
                'opacity-60 cursor-not-allowed': result !== null,
              }"
              :disabled="result !== null"
              @click="selectOX('X')"
            >
              <svg class="w-12 h-12 mb-1" viewBox="0 0 40 40" fill="none">
                <line
                  x1="12"
                  y1="12"
                  x2="28"
                  y2="28"
                  stroke="#ef4444"
                  stroke-width="4"
                  stroke-linecap="round"
                />
                <line
                  x1="28"
                  y1="12"
                  x2="12"
                  y2="28"
                  stroke="#ef4444"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
              <span class="text-red-700 font-bold text-base">아니다</span>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center py-12">
            <div
              v-if="result"
              class="text-blue-600 font-extrabold text-2xl mb-4 flex flex-col items-center gap-2"
            >
              <span class="flex items-center gap-2">
                <svg class="w-6 h-6" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="#2563eb" stroke-width="8" fill="none" />
                </svg>
                정답이에요!
              </span>
              <span class="text-yellow-600 text-lg font-bold animate-pulse">
                +{{ quiz.creditReward }}크레딧 획득
              </span>
            </div>
            <div v-else class="text-red-500 font-extrabold text-2xl mb-4">❌ 오답이에요!</div>
            <div
              class="bg-[#f7f8fa] rounded-lg px-4 py-4 mt-2 w-full text-gray-700 text-base text-center"
            >
              <div class="font-bold mb-2 text-yellow-700">💡 해설</div>
              <div>{{ quiz.comment }}</div>
            </div>
            <button
              class="mt-8 w-full bg-gray-200 text-gray-700 font-bold rounded-lg py-3 hover:bg-gray-300 transition"
              @click="closeQuizModal"
            >
              닫기
            </button>
          </div>
        </template>
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
const userId = ref(null)
const user = ref(null)
const isCompleted = ref(false)
const creditAwarded = ref(false)
const showQuizModal = ref(false)
const isModalDragging = ref(false)
const modalDragStartY = ref(0)
const modalDragOffset = ref(0)

function onModalDragStart(e) {
  isModalDragging.value = true
  modalDragStartY.value = e.touches ? e.touches[0].clientY : e.clientY
}
function onModalDragMove(e) {
  if (!isModalDragging.value) return
  const currentY = e.touches ? e.touches[0].clientY : e.clientY
  const offset = currentY - modalDragStartY.value
  modalDragOffset.value = offset > 0 ? offset : 0
}
function onModalDragEnd() {
  if (modalDragOffset.value > 60) closeQuizModal()
  isModalDragging.value = false
  setTimeout(() => {
    modalDragOffset.value = 0
  }, 200)
}
function closeQuizModal() {
  showQuizModal.value = false
  isModalDragging.value = false
  modalDragOffset.value = 0
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    userId.value = res.data.userId || res.data.id
    user.value = res.data
  } catch (e) {
    console.error('세션 정보 로딩 실패:', e)
    userId.value = Number(localStorage.getItem('userId') || 1)
  }

  const contentId = Number(route.params.id)

  try {
    const completeRes = await axios.get('/api/learning/history/complete', {
      params: { userId: userId.value, contentId },
    })
    isCompleted.value = completeRes.data === true
  } catch (e) {
    console.warn('완료 여부 확인 실패:', e)
  }

  content.value = await fetchLearningContentById(contentId)
  quiz.value = await fetchLearningQuizById(contentId)

  try {
    const hasResult = await checkQuiz(userId.value, contentId)
    if (hasResult) {
      const resultRes = await axios.get('/api/learning/quiz/result/detail', {
        params: { userId: userId.value, quizId: contentId },
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

function selectOX(val) {
  if (result.value !== null) return
  selected.value = val
  result.value = selected.value === quiz.value.answer

  if (!creditAwarded.value) {
    awardQuizCreditLocal()
  }

  if (!isCompleted.value) {
    handleComplete()
  }
}

async function awardQuizCreditLocal() {
  try {
    const hasResult = await checkQuiz(userId.value, Number(route.params.id))
    if (hasResult) return

    if (result.value) {
      await giveCredit(userId.value, quiz.value.quizId, selected.value)
      creditAwarded.value = true
    } else {
      await axios.post('/api/learning/quiz/result/save', {
        userId: userId.value,
        quizId: quiz.value.quizId,
        selectedAnswer: selected.value,
        isCorrect: false,
      })
    }
  } catch (e) {
    console.error('퀴즈 처리 실패:', e)
  }
}

async function handleComplete() {
  try {
    await axios.post('/api/learning/history', {
      userId: user.value.userId,
      contentId: Number(route.params.id),
    })
    isCompleted.value = true
  } catch (e) {
    console.error('기록 실패:', e)
  }
}

function extractYoutubeId(url) {
  if (!url) return ''
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return ''
}

function removeOX(text) {
  return text ? text.replace(/\s*\(O\/X\)/gi, '') : ''
}

const formattedBody = computed(() => {
  if (!content.value?.body) return ''

  // 줄바꿈 통일: \n, \\\n, \r\n → \n
  let normalized = content.value.body.replace(/\\n|\\\\n|\r\n/g, '\n')

  // 문장 끝 마침표 뒤에 <br> 추가 (단, 이미 <br>이 있으면 중복 방지)
  normalized = normalized.replace(/([^.])\.\s*/g, '$1.<br>')

  // 문단 나누기: \n\n 이상 기준으로 분리
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const htmlParagraphs = paragraphs.map((paragraph) => {
    // 리스트가 포함되어 있으면 <li>로 감싸기
    const hasBullet = /[\u2022•]\s?/.test(paragraph)

    if (hasBullet) {
      const items = paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.startsWith('•') ||
            line.startsWith('∙') ||
            line.startsWith('・') ||
            line.startsWith('·') ||
            line.startsWith('\u2022'),
        )
        .map((line) => `<li>${line.replace(/^[\u2022•∙・·]\s?/, '')}</li>`)
        .join('')
      return `<ul>${items}</ul>`
    } else {
      // 일반 문단은 내부 줄바꿈은 <br>로 변환
      const withBreaks = paragraph.replace(/\n/g, '<br>')
      return `<p>${withBreaks}</p>`
    }
  })

  return htmlParagraphs.join('')
})

const formattedTitle = computed(() => {
  if (!content.value?.title) return ''
  return content.value.title.replace(/\\n|\n/g, '')
})

function goBack() {
  router.go(-1)
}
</script>
