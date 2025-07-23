<template>
  <div class="flex flex-col gap-3">
    <!-- 메시지 출력 영역 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'text-right' : 'text-left'"
      >
        <div
          :class="[
            'inline-block px-3 py-2 rounded-lg text-sm whitespace-pre-line',
            msg.role === 'user' ? 'bg-purple-100 text-purple-800' : 'bg-white border text-gray-800',
          ]"
        >
          {{ msg.text }}
        </div>
      </div>

      <!-- 로딩 중 -->
      <div v-if="loading" class="text-left text-sm text-gray-500 animate-pulse">
        GPT 응답 생성 중...
      </div>
    </div>

    <!-- 입력창 -->
    <div class="flex gap-2 mt-2">
      <input
        v-model="input"
        @keydown.enter="submit"
        placeholder="메시지를 입력하세요"
        class="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring focus:border-purple-300"
      />
      <button
        class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700"
        @click="submit"
      >
        전송
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 상태
const input = ref('')
const messages = ref([])
const loading = ref(false)

// GPT 호출 함수 (모의 구현)
async function fetchGPT(prompt) {
  loading.value = true
  // GPT 호출 → 실제 API 연동 부분으로 교체하세요
  const mockReply = `📊 [AI 응답 예시]\n"${prompt}"에 대해 분석 중입니다...`
  await new Promise((r) => setTimeout(r, 1000)) // mock 지연
  messages.value.push({ role: 'assistant', text: mockReply })
  loading.value = false
}

// 메시지 전송
function submit() {
  if (!input.value.trim()) return
  const userText = input.value
  messages.value.push({ role: 'user', text: userText })
  input.value = ''
  fetchGPT(userText)
}

// 외부에서 호출 가능한 함수 등록
function sendPrompt(text) {
  input.value = ''
  messages.value.push({ role: 'user', text })
  fetchGPT(text)
}

defineExpose({ sendPrompt })
</script>
