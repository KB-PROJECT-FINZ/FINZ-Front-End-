<template>
  <div class="flex flex-col gap-3">
    <!-- 대화 내용 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3" ref="chatContainer">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'text-right' : 'text-left'"
      >

        <!-- 일반 메시지 -->
        <p
          v-if="!msg.type"
          :class="msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'"
          class="inline-block p-2 rounded m-1"
        >
          {{ msg.content }}
        </p>

        <!-- 버튼 메시지 -->
        <div v-else-if="msg.type === 'buttons'" class="mb-2 text-left">
          <p class="mb-2 text-sm text-gray-700">{{ msg.text }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(btn, idx) in msg.buttons"
              :key="idx"
              @click="handleButtonIntent(btn)"
              class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->

    <form @submit.prevent="handleSubmit">
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

import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/counter.js'

// Props: 외부에서 intent, sessionId, userId 전달
const props = defineProps({
  fixedIntent: { type: String, default: 'MESSAGE' },
  sessionId: { type: Number, default: null },
  userId: { type: Number, default: 1 },
})

// 상태
const input = ref('')

const awaitingKeyword = ref(false)
const chatStore = useChatStore()

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


  // 키워드 입력 모드일 경우
  if (awaitingKeyword.value) {
    const keyword = input.value.trim()
    awaitingKeyword.value = false
    await chatStore.sendMessage(`${keyword} 관련 종목 추천해줘`, 'RECOMMEND_KEYWORD')
    input.value = ''
    return
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


async function handleButtonIntent(btn) {
  // 외부 링크 이동
  if (btn.intent === 'EXTERNAL_LINK' && btn.href) {
    window.location.href = btn.href
    return
  }

  // 종목 추천 → 성향/키워드 분기
  if (btn.intent === 'RECOMMEND_SELECT') {
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '추천 방식을 선택해주세요:',
      buttons: [
        {
          label: '🎯 투자 성향 테스트',
          intent: 'EXTERNAL_LINK',
          href: '/chatbot/test',
        },
        {
          label: '🔍 키워드로 추천',
          intent: 'RECOMMEND_KEYWORD_INPUT',
        },
      ],
    })
    return
  }

  // 키워드 입력 요청
  if (btn.intent === 'RECOMMEND_KEYWORD_INPUT') {
    awaitingKeyword.value = true
    chatStore.messages.push({
      role: 'bot',
      content: '추천을 원하는 키워드를 입력해주세요. 예: AI, 전기차, 반도체 등',
    })
    return
  }

  // 그 외 일반 intent 처리
  await chatStore.sendMessage(btn.message, btn.intent)
}

onMounted(() => {
  if (chatStore.messages.length === 0) {
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '원하시는 기능을 선택해주세요:',
      buttons: [
        {
          label: '📈 종목 추천',
          intent: 'RECOMMEND_SELECT',
        },
        {
          label: '📊 종목 분석',
          intent: 'STOCK_ANALYZE',
          message: '종목 분석 해줘',
        },
        {
          label: '📚 용어 설명',
          intent: 'MESSAGE',
          message: 'PER가 뭐야?',
        },
        {
          label: '🧠 포트폴리오',
          intent: 'PORTFOLIO_ANALYZE',
          message: '내 포트폴리오 피드백 줘',
        },
      ],
    })
  }
})
</script>
