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

    <!-- 각 아티클 전용 퀴즈 버튼 -->
    <div class="mt-6">
      <button
        class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
        @click="openQuiz()"
      >
        퀴즈 풀기
      </button>
    </div>
    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-8">
      <button
        class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        :disabled="currentStep === 1"
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
      <!-- dim -->
      <div class="absolute inset-0 bg-gray-900/60"></div>

      <!-- modal -->
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

        <!-- 문제 영역 (정답/오답 결과가 아직 없을 때) -->
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

        <!-- 결과/해설 영역 (정답/오답 결정 후) -->
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
                v-if="!result"
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
import { ref, computed, watch } from 'vue'
import guideContents from '@/guideContent.json' // 질문에 주신 JSON 배열
import { useRouter } from 'vue-router'
/** 진행 상태 */
const currentStep = ref(1)
const totalSteps = guideContents.length
const currentContent = computed(() => guideContents[currentStep.value - 1] || {})
const router = useRouter()
/** 퀴즈 상태 */
const showQuizModal = ref(false)
const selected = ref('') // 'O' | 'X'
const result = ref(null) // true | false | null
const currentQuiz = computed(
  () =>
    currentContent.value?.quiz || { question: '', answer: '', explanation: '', creditReward: 0 },
)

/** 모달 드래그 닫기 UX */
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

/** 단계 이동 시 퀴즈 상태 초기화 */
watch(currentStep, () => resetQuizState())

function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

/** 퀴즈 로직 */
function openQuiz() {
  // 현재 단계에 퀴즈가 없으면 방어
  if (!currentQuiz.value?.question) return
  showQuizModal.value = true
}
function end() {
  router.push('/learning-end')
}
function selectOX(val) {
  if (!currentQuiz.value?.answer) return
  if (result.value !== null) return
  selected.value = val
  result.value = selected.value.toUpperCase() === currentQuiz.value.answer.toUpperCase()
  // 정답 시 크레딧 지급 등의 API가 있다면 여기서 호출
}
function retryQuiz() {
  // 오답일 때만 재도전 허용
  if (result.value === false) {
    selected.value = ''
    result.value = null
  }
}
function closeQuizModal() {
  showQuizModal.value = false
  // 닫을 때 상태 유지하고 싶으면 reset 제거
}

/** 유틸 */
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
</script>
