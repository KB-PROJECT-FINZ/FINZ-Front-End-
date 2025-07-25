<template>
  <div class="flex flex-col gap-3">
    <!-- 대화 내용 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3" ref="chatContainer">
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
      <!-- 로딩 상태 -->
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
import { ref, defineExpose, onUpdated } from 'vue'
import axios from 'axios'

// Props: 외부에서 intent, sessionId, userId 전달
const props = defineProps({
  fixedIntent: { type: String, default: 'MESSAGE' },
  sessionId: { type: Number, default: null },
  userId: { type: Number, default: 1 },
})

// 상태
const input = ref('')
const messages = ref([])
const loading = ref(false)
const chatContainer = ref(null)

// GPT 호출
async function fetchGPT(prompt) {
  loading.value = true
  try {
    // 사용자 메시지 출력
    messages.value.push({ role: 'user', text: prompt })

    const res = await axios.post('/api/chatbot/message', {
      userId: props.userId,
      sessionId: props.sessionId,
      message: prompt,
      intentType: props.fixedIntent,
    })

    const reply = res.data.content || '(응답 없음)'
    messages.value.push({ role: 'assistant', text: reply })
  } catch (err) {
    console.error(err)
    messages.value.push({ role: 'assistant', text: '❗ 서버 오류가 발생했습니다.' })
  } finally {
    loading.value = false
  }
}

// 전송
function submit() {
  if (!input.value.trim()) return
  const msg = input.value
  input.value = ''
  fetchGPT(msg)
}

// 외부에서 호출 가능한 메서드 등록
function sendPrompt(text) {
  if (!text) return
  fetchGPT(text)
}

defineExpose({ sendPrompt })

// 스크롤 자동 내리기
onUpdated(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
})
</script>
