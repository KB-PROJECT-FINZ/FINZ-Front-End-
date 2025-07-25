<template>
  <div class="p-4 border rounded">
    <div class="h-64 overflow-y-auto mb-2">
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
    <form @submit.prevent="handleSubmit">
      <input
        v-model="input"
        placeholder="메시지를 입력하세요..."
        class="w-full p-2 border rounded"
      />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/counter.js'

const input = ref('')
const awaitingKeyword = ref(false)
const chatStore = useChatStore()

async function handleSubmit() {
  if (!input.value.trim()) return

  // 키워드 입력 모드일 경우
  if (awaitingKeyword.value) {
    const keyword = input.value.trim()
    awaitingKeyword.value = false
    await chatStore.sendMessage(`${keyword} 관련 종목 추천해줘`, 'RECOMMEND_KEYWORD')
    input.value = ''
    return
  }

  await chatStore.sendMessage(input.value)
  input.value = ''
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
