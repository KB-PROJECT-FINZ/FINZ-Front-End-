<template>
  <div class="flex flex-col gap-3">
    <!-- 대화 내용 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3" ref="chatContainer">
      <p v-if="loading" class="text-sm text-gray-500 italic text-left">
        ⏳ 답변을 불러오고 있어요...
      </p>
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
    <form @submit.prevent="submit" class="flex gap-2 mt-2">
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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useChatStore } from '@/stores/counter.js'
import { useUserStore } from '@/stores/user.js'

// Props
const props = defineProps({
  fixedIntent: { type: String, default: null },
  sessionId: { type: Number, default: null },
})

// Pinia 스토어
const chatStore = useChatStore()
const userStore = useUserStore()

const userId = computed(() => userStore.userId)

const input = ref('')
const awaitingKeyword = ref(false)
const awaitingStockAnalyze = ref(false) // 종목 분석 상태
const loading = ref(false)

// 메시지 전송
async function fetchGPT(prompt, intent = props.fixedIntent) {
  loading.value = true
  chatStore.messages.push({ role: 'user', content: prompt })
  try {
    const res = await axios.post('/api/chatbot/message', {
      userId: userId.value,
      sessionId: props.sessionId,
      message: prompt,
      intentType: intent,
    })

    if (res?.data?.content) {
      chatStore.messages.push({ role: 'bot', content: res.data.content })
    }
  } catch (err) {
    chatStore.messages.push({ role: 'bot', content: '⚠️ 서버 오류가 발생했어요.' })
  } finally {
    loading.value = false
  }
}

// 전송 버튼
function submit() {
  if (!input.value.trim()) return
  const text = input.value.trim()

  if (awaitingKeyword.value) {
    awaitingKeyword.value = false
    fetchGPT(`${text} 관련 종목 추천해줘`, 'RECOMMEND_KEYWORD')
    input.value = ''
    return
  }

  if (awaitingStockAnalyze.value) {
    awaitingStockAnalyze.value = false
    fetchGPT(`${text} 종목 분석해줘`, 'STOCK_ANALYZE')
    input.value = ''
    return
  }

  fetchGPT(text)
  input.value = ''
}

// 버튼 intent 처리
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
        { label: '🎯 투자 성향으로 추천', intent: 'RECOMMEND_PROFILE' },
        { label: '🔍 키워드로 추천', intent: 'RECOMMEND_KEYWORD' },
        { label: '🔙 뒤로가기', intent: 'BACK_TO_MAIN' },
      ],
    })
    return
  }

  if (btn.intent === 'RECOMMEND_PROFILE') {
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '투자 성향 기반 추천을 위해 아래 옵션 중 하나를 선택해주세요:',
      buttons: [
        {
          label: '🧪 투자 성향 테스트 하러 가기',
          intent: 'EXTERNAL_LINK',
          href: '/investment-test',
        },
        {
          label: '📊 내 성향 기반 추천 받아보기',
          intent: 'RECOMMEND_PROFILE',
          message: '내 투자 성향으로 종목 추천해줘',
        },
        { label: '🔙 뒤로가기', intent: 'RECOMMEND_SELECT' },
      ],
    })
    return
  }

  if (btn.intent === 'RECOMMEND_PROFILE') {
    await fetchGPT(btn.message, btn.intent)
    return
  }

  if (btn.intent === 'RECOMMEND_KEYWORD') {
    awaitingKeyword.value = true
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '추천을 원하는 키워드를 입력해주세요. 예: AI, 전기차, 반도체 등',
      buttons: [{ label: '🔙 뒤로가기', intent: 'RECOMMEND_SELECT' }],
    })
    return
  }

  if (btn.intent === 'STOCK_ANALYZE') {
    awaitingStockAnalyze.value = true
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '분석할 종목명을 입력해주세요. 예: 삼성전자, 테슬라 등',
      buttons: [{ label: '🔙 뒤로가기', intent: 'BACK_TO_MAIN' }],
    })
    return
  }

  if (btn.intent === 'BACK_TO_MAIN') {
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      buttons: [
        { label: '📈 종목 추천', intent: 'RECOMMEND_SELECT' },
        { label: '📊 종목 분석', intent: 'STOCK_ANALYZE', message: '종목 분석 해줘' },
        { label: '📚 용어 설명', intent: 'MESSAGE', message: 'PER가 뭐야?' },
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE', message: '내 포트폴리오 피드백 줘' },
      ],
    })
    return
  }

  loading.value = true
  await chatStore.sendMessage(btn.message, btn.intent)
  loading.value = false
}

// 초기 메시지
onMounted(() => {
  if (chatStore.messages.length === 0) {
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      buttons: [
        { label: '📈 종목 추천', intent: 'RECOMMEND_SELECT' },
        { label: '📊 종목 분석', intent: 'STOCK_ANALYZE' },
        { label: '📚 용어 설명', intent: 'MESSAGE', message: 'PER가 뭐야?' },
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE', message: '내 포트폴리오 피드백 줘' },
      ],
    })
  }
})
</script>
