<template>
  <div class="max-w-screen-md mx-auto px-5 py-8">
    <!-- Progress Bar -->
    <div class="mb-6">
      <p class="text-sm font-medium text-gray-600 mb-1">
        단계 {{ currentStep }} / {{ totalSteps }}
      </p>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: (currentStep / totalSteps) * 100 + '%' }"
        ></div>
      </div>
    </div>

    <!-- Content -->
    <div
      key="step-content"
      class="bg-white rounded-2xl shadow p-6 md:p-4 transition-all duration-500"
    >
      <h2 class="text-2xl font-bold mb-4">{{ currentContent.title }}</h2>
      <div class="prose prose-sm md:prose-lg max-w-none" v-html="currentContent.body"></div>
    </div>

    <!-- 퀴즈 버튼 -->
    <div class="mt-6">
      <button
        v-if="!isCurrentStepCompleted"
        class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
        @click="openQuiz()"
      >
        퀴즈 풀기
      </button>
      <button
        v-else
        class="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-lg shadow cursor-not-allowed"
        @click="openQuiz(true)"
        title="이미 완료된 문제입니다. 해설만 확인할 수 있어요."
      >
        완료됨 · 해설 보기
      </button>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-8">
      <!-- 첫 단계에서는 '홈으로' 버튼 -->
      <button
        v-if="currentStep === 1"
        class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        @click="goHome"
      >
        홈으로
      </button>

      <!-- 첫 단계 아닐 때는 '이전' 버튼 -->
      <button
        v-else
        class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        @click="prevStep"
      >
        이전
      </button>

      <button
        v-if="currentStep < totalSteps"
        class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        @click="nextStep"
      >
        다음
      </button>

      <button
        v-else
        class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        @click="end()"
      >
        종료
      </button>
    </div>

    <!-- 퀴즈 모달 -->
    <div v-if="showQuizModal" class="fixed inset-0 z-50 flex items-center" @click="closeQuizModal">
      <div class="absolute inset-0 bg-gray-900/60"></div>

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

        <!-- 문제 -->
        <template v-if="result === null">
          <div class="text-base font-bold text-gray-900 mb-4 text-center">
            {{ removeOX(currentQuiz.question) }}
          </div>
          <div class="flex gap-4 w-full justify-center mb-3">
            <button
              class="flex flex-col items-center justify-center aspect-square max-w-[110px] flex-1 rounded-lg shadow border-2 border-transparent transition bg-blue-50 hover:bg-blue-100"
              :class="{ 'bg-blue-100 border-blue-700': selected === 'O' }"
              @click="selectOX('O')"
            >
              <svg class="w-8 h-8 mb-1" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="16" stroke="#2563eb" stroke-width="6" fill="none" />
              </svg>
              <span class="text-blue-700 font-bold text-base">그렇다</span>
            </button>
            <button
              class="flex flex-col items-center justify-center aspect-square max-w-[110px] flex-1 rounded-lg shadow border-2 border-transparent transition bg-red-50 hover:bg-red-100"
              :class="{ 'bg-red-100 border-red-700': selected === 'X' }"
              @click="selectOX('X')"
            >
              <svg class="w-12 h-12 mb-1" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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

        <!-- 결과/해설 -->
        <template v-else>
          <div class="flex flex-col items-center justify-center py-8">
            <div v-if="result" class="text-blue-600 font-extrabold text-2xl mb-3">
              정답입니다! 🎉
            </div>
            <div v-else class="text-red-500 font-extrabold text-2xl mb-3">❌ 오답입니다</div>

            <div
              class="bg-[#f7f8fa] rounded-lg px-4 py-4 mt-2 w-full text-gray-700 text-base text-center"
            >
              <div class="font-bold mb-2 text-yellow-700">💡 해설</div>
              <div>{{ currentQuiz.explanation }}</div>
            </div>

            <div class="mt-6 w-full flex gap-3">
              <button
                class="flex-1 bg-gray-200 text-gray-700 font-bold rounded-lg py-3 hover:bg-gray-300 transition"
                @click="closeQuizModal"
              >
                닫기
              </button>
              <button
                v-if="!result && !isCurrentStepCompleted"
                class="flex-1 bg-indigo-600 text-white font-bold rounded-lg py-3 hover:bg-indigo-700 transition"
                @click="retryQuiz"
              >
                재도전
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- /퀴즈 모달 -->
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import guideContents from '@/guideContent.json'
import { useRouter } from 'vue-router'
const router = useRouter()
/* === 기본 설정 === */
const MODULE_ID = 'learning-basic-001'
const REQUIRED_COUNT = 4

const user = ref(null)
const userId = ref(0)
const claimed = ref(false) // 이미 보상 수령 여부
const showNotice = ref(true) // 공지 노출 여부

const STORAGE_KEY_PROGRESS = computed(() => `quizProgress:${MODULE_ID}:user:${userId.value}`)
const STORAGE_KEY_CLAIMED = computed(() => `quizClaimed:${MODULE_ID}:user:${userId.value}`)

/* === 진행/콘텐츠 상태 === */
const currentStep = ref(1)
const totalSteps = guideContents.length
const currentContent = computed(() => guideContents[currentStep.value - 1] || {})
const currentQuiz = computed(
  () => currentContent.value?.quiz || { question: '', answer: '', explanation: '' },
)

/* === 퀴즈/모달 상태 === */
const showQuizModal = ref(false)
const selected = ref('') // 'O' | 'X'
const result = ref(null) // true | false | null
const isModalDragging = ref(false)
const modalDragStartY = ref(0)
const modalDragOffset = ref(0)

/* === 유저별 진행도(로컬) === */
const progress = ref({
  steps: {}, // 예: { "1": true, "2": true }
})
const isCurrentStepCompleted = computed(() => !!progress.value.steps[currentStep.value])
const completedCount = computed(() => Object.values(progress.value.steps).filter(Boolean).length)
const isModuleCompleted = computed(
  () => completedCount.value >= Math.min(REQUIRED_COUNT, totalSteps),
)

/* === 스토리지 IO === */
function loadProgress() {
  if (!STORAGE_KEY_PROGRESS.value) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS.value)
    if (raw) {
      const parsed = JSON.parse(raw)
      progress.value = {
        steps: parsed?.steps ?? {},
      }
    }
  } catch {}
}
function saveProgress() {
  if (!STORAGE_KEY_PROGRESS.value) return
  localStorage.setItem(STORAGE_KEY_PROGRESS.value, JSON.stringify(progress.value))
}
function loadClaimed() {
  if (!STORAGE_KEY_CLAIMED.value) return
  claimed.value = localStorage.getItem(STORAGE_KEY_CLAIMED.value) === 'true'
}
function saveClaimed() {
  if (!STORAGE_KEY_CLAIMED.value) return
  localStorage.setItem(STORAGE_KEY_CLAIMED.value, String(claimed.value))
}

onMounted(async () => {
  const res = await axios.get('/api/auth/me', { withCredentials: true })
  user.value = res.data
  userId.value = Number(res.data.userId ?? res.data.id)

  loadProgress()
  loadClaimed()

  // 이미 수령한 유저면 공지 숨김
  showNotice.value = !claimed.value
})
watch(currentStep, resetQuizState)

function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

/* === 퀴즈 동작 === */
function openQuiz(readOnly = false) {
  if (!currentQuiz.value?.question) return

  // 이미 보상 수령(= 다시 못 풀기): 해설만 보기로 열어줌
  if (claimed.value) {
    selected.value = ''
    result.value = true // 해설만 보기
    showQuizModal.value = true
    return
  }

  if (readOnly || isCurrentStepCompleted.value) {
    selected.value = ''
    result.value = true // 완료 스텝: 해설만 보기
    showQuizModal.value = true
    return
  }

  showQuizModal.value = true
}

function selectOX(val) {
  if (!currentQuiz.value?.answer) return
  if (result.value !== null) return
  if (claimed.value) return // 안전장치: 이미 수령자는 선택 불가

  selected.value = val
  result.value = selected.value.toUpperCase() === currentQuiz.value.answer.toUpperCase()

  if (result.value === true) {
    progress.value.steps[currentStep.value] = true
    saveProgress()
  }
}

function retryQuiz() {
  if (result.value === false) {
    selected.value = ''
    result.value = null
  }
}

function closeQuizModal() {
  showQuizModal.value = false
}

/* === 유틸 === */
function removeOX(text) {
  return text ? text.replace(/\s*\(O\/X\)/gi, '') : ''
}
function resetQuizState() {
  showQuizModal.value = false
  selected.value = ''
  result.value = null
  isModalDragging.value = false
  modalDragStartY.value = 0
  modalDragOffset.value = 0
}

/* === 모달 드래그 === */
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
  setTimeout(() => (modalDragOffset.value = 0), 200)
}
function goHome() {
  router.push('/home')
}
async function end() {
  if (claimed.value) {
    alert('이미 이 학습의 보상을 수령하셨습니다. 다시 풀이할 수 없어요.')
    router.push('/home')
    return
  }
  if (!isModuleCompleted.value) {
    alert(`아직 완료되지 않았어요. (${completedCount.value}/${REQUIRED_COUNT})`)
    return
  }

  try {
    await axios.post('/api/learning/quiz/credit/once', {}, { withCredentials: true })

    // 성공 → 수령 상태 저장
    claimed.value = true
    saveClaimed()
    showNotice.value = false

    // 홈에 즉시 반영되도록 이벤트 발행
    window.dispatchEvent(new CustomEvent('quiz-claimed:learning-basic-001'))
  } catch (e) {
    const status = e?.response?.status
    if (status === 409 || status === 400) {
      // 이미 수령했다고 서버가 알려준 경우도 동기화
      claimed.value = true
      saveClaimed()
      showNotice.value = false
      window.dispatchEvent(new CustomEvent('quiz-claimed:learning-basic-001'))
      alert('이미 이 학습의 보상을 수령하셨습니다. 다시 풀이할 수 없어요.')
    } else {
      console.error('보상 지급 실패:', e)
      alert('보상 지급에 실패했어요. 잠시 후 다시 시도해 주세요.')
      return
    }
  }
  router.push('/learning-end')
}
</script>
