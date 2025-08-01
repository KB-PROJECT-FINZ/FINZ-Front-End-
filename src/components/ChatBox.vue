<!-- chatbox.vue -->
<template>
  <div class="flex flex-col gap-3">
    <!-- 대화 내용 -->
    <div class="bg-gray-100 rounded-xl p-4 h-[400px] overflow-y-auto space-y-3" ref="chatContainer">
      <p v-if="loading" class="text-sm text-gray-500 italic text-left">
        ⏳ 답변을 보르고 있어요...
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

const chatStore = useChatStore()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const props = defineProps({
  fixedIntent: { type: String, default: null },
})

const input = ref('')
const loading = ref(false)
const awaitingKeyword = ref(false)
const awaitingStockAnalyze = ref(false)
const awaitingTermExplain = ref(false)

// ✅ intent 상태 초기화 함수
function resetAwaitingState() {
  awaitingKeyword.value = false
  awaitingStockAnalyze.value = false
  awaitingTermExplain.value = false
}

onMounted(async () => {
  if (!userStore.userId) {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true })
      userStore.setUser({
        userId: res.data.userId,
        username: res.data.username,
        name: res.data.name,
        riskType: res.data.riskType,
      })
      console.log('✅ 사용자 정보 동기화 완료:', userStore.$state)
    } catch (err) {
      console.error('❌ 사용자 정보 조회 실패:', err)
    }
  }

  if (chatStore.messages.length === 0) {
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      buttons: [
        { label: '📈 종목 추천', intent: 'RECOMMEND_SELECT' },
        { label: '📊 종목 분석', intent: 'STOCK_ANALYZE' },
        { label: '📚 용어 설명', intent: 'TERM_EXPLAIN' },
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE', message: '내 포트폴리오 피드백 줘' },
      ],
    })
  }
})

async function fetchGPT(prompt, explicitIntent = null) {
  loading.value = true
  chatStore.messages.push({ role: 'user', content: prompt })

  console.log('📤 서버로 보낼 userId:', userId.value)

  // 🔐 intentType을 안전하게 추출
  let intentType = null

  if (explicitIntent) {
    intentType = explicitIntent
  } else if (awaitingTermExplain.value) {
    intentType = 'TERM_EXPLAIN'
    awaitingTermExplain.value = false
  } else if (awaitingKeyword.value) {
    intentType = 'RECOMMEND_KEYWORD'
    awaitingKeyword.value = false
  } else if (awaitingStockAnalyze.value) {
    intentType = 'STOCK_ANALYZE'
    awaitingStockAnalyze.value = false
  } else if (props.fixedIntent) {
    intentType = props.fixedIntent
  } else if (typeof chatStore.intentType === 'string') {
    intentType = chatStore.intentType
  }

  try {
    console.log('🧾 최종 intentType 전송값:', intentType, typeof intentType)

    const res = await axios.post('/api/chatbot/message', {
      userId: userId.value,
      sessionId: chatStore.sessionId,
      message: prompt,
      intentType: intentType, // 명시적으로 string or null
    })

    if (res?.data?.content) {
      chatStore.messages.push({ role: 'bot', content: res.data.content })
      chatStore.sessionId = res.data.sessionId
      chatStore.intentType = res.data.intentType
    }
  } catch (error) {
    console.log(userId)
    chatStore.messages.push({ role: 'bot', content: '⚠️ 서버 오류가 발생했어요.' })
    console.error('❌ GPT fetch 실패:', err)
  } finally {
    loading.value = false
  }
}

function submit() {
  if (!input.value.trim()) return
  const text = input.value.trim()

  let explicitIntent = null
  if (awaitingKeyword.value) explicitIntent = 'RECOMMEND_KEYWORD'
  else if (awaitingStockAnalyze.value) explicitIntent = 'STOCK_ANALYZE'
  else if (awaitingTermExplain.value) explicitIntent = 'TERM_EXPLAIN'

  console.log('📥 submit 시 intent:', explicitIntent)

  fetchGPT(text, explicitIntent)
  input.value = ''
}

async function handleButtonIntent(btn) {
  resetAwaitingState()

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
    if (!btn.message) {
      chatStore.clearMessages()
      chatStore.messages.push({
        role: 'bot',
        type: 'buttons',
        text: '투자 성향 기반 추천을 위해 아래 옵션 중 하나를 선택해주세요:',
        buttons: [
          {
            label: '🧪 투자 성향 테스트 하러 가기',
            intent: 'EXTERNAL_LINK',
            href: '/investment-test/retest',
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

    const risk = userStore.riskType
    if (!risk) {
      chatStore.messages.push({
        role: 'bot',
        content: '⚠️ 투자 성향 정보가 없습니다. 먼저 테스트를 진행해주세요.',
      })
      return
    }

    const message = `나의 투자 성향인 ${risk}에 맞는 종목을 추천해줘`
    await fetchGPT(message, btn.intent)
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

  if (btn.intent === 'TERM_EXPLAIN') {
    awaitingTermExplain.value = true
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '설명을 원하는 용어를 입력해주세요. 예: PER, EPS, ROE 등',
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
        { label: '📊 종목 분석', intent: 'STOCK_ANALYZE' },
        { label: '📚 용어 설명', intent: 'TERM_EXPLAIN' },
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE', message: '내 포트폴리오 피드백 줘' },
      ],
    })
    return
  }

  loading.value = true
  await chatStore.sendMessage(btn.message, btn.intent)
  loading.value = false
}
</script>
