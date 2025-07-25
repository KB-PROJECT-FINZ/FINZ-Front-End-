<template>
  <div class="flex flex-col gap-3">
    <!-- 대화 내용 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3" ref="chatContainer">
      <div
        v-for="(msg, i) in chatStore.messages"
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
    <form class="flex gap-2 items-center" @submit.prevent="submit">
      <input
        v-model="input"
        placeholder="메시지를 입력하세요"
        class="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring focus:border-purple-300"
      />
      <button
        type="submit"
        class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700"
      >
        전송
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/counter.js'

const props = defineProps({
  fixedIntent: { type: String, default: 'MESSAGE' },
  sessionId: { type: Number, default: null },
  userId: { type: Number, default: 1 },
})

const input = ref('')
const awaitingKeyword = ref(false)
const chatStore = useChatStore()

async function submit() {
  if (!input.value.trim()) return

  const text = input.value.trim()
  input.value = ''

  if (awaitingKeyword.value) {
    awaitingKeyword.value = false
    await chatStore.sendMessage(`${text} 관련 종목 추천해줘`, 'RECOMMEND_KEYWORD')
    return
  }

  await chatStore.sendMessage(text, props.fixedIntent)
}

async function handleButtonIntent(btn) {
  if (btn.intent === 'EXTERNAL_LINK' && btn.href) {
    window.location.href = btn.href
    return
  }

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

  if (btn.intent === 'RECOMMEND_KEYWORD_INPUT') {
    awaitingKeyword.value = true
    chatStore.messages.push({
      role: 'bot',
      content: '추천을 원하는 키워드를 입력해주세요. 예: AI, 전기차, 반도체 등',
    })
    return
  }

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
