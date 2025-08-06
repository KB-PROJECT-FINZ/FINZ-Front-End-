<template>
  <div class="flex flex-col h-full">
    <!-- 대화 내용 -->
    <div class="flex-1 overflow-y-auto space-y-4 p-4 pb-24">
      <!-- 챗봇 아바타와 인사말 (첫 로드 시) -->
      <div v-if="chatStore.messages.length === 0" class="flex items-start space-x-3">
        <div class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-100 rounded-2xl p-4 max-w-xs">
            <p class="font-semibold text-gray-800">안녕하세요 {{ userStore.name || '사용자' }}님!</p>
            <p class="text-gray-600 text-sm mt-1">무엇을 도와드릴까요?</p>
          </div>
        </div>
      </div>

      <!-- 로딩 메시지 -->
      <div v-if="loading" class="flex items-start space-x-3">
        <div class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="bg-gray-100 rounded-2xl p-4">
          <p class="text-sm text-gray-500 italic">⏳ 답변을 불러오고 있어요...</p>
        </div>
      </div>

      <!-- 메시지들 -->
      <div
        v-for="(msg, i) in chatStore.messages"
        :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : 'flex items-start space-x-3'"
      >
        <!-- 사용자 메시지 -->
        <div v-if="msg.role === 'user'" class="bg-blue-500 text-white rounded-2xl p-4 max-w-xs">
          <p>{{ msg.content }}</p>
        </div>

        <!-- 봇 메시지 -->
        <template v-else>
          <div class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
            <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1">
            <!-- 일반 메시지 -->
            <div v-if="!msg.type" class="bg-gray-100 rounded-2xl p-4 max-w-xs">
              <p>{{ msg.content }}</p>
            </div>

            <!-- 버튼 메시지 -->
            <div v-else-if="msg.type === 'buttons'" class="space-y-3">
              <div v-if="msg.text" class="bg-gray-100 rounded-2xl p-4 max-w-xs">
                <p>{{ msg.text }}</p>
              </div>
              <div class="space-y-2">
                <button
                  v-for="(btn, idx) in msg.buttons"
                  :key="idx"
                  @click="handleButtonIntent(btn)"
                  class="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span class="text-gray-800 font-medium">{{ btn.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="border-t border-gray-200 p-4 bg-white fixed bottom-2 left-0 right-0 max-w-[430px] mx-auto">
      <form @submit.prevent="submit" class="flex gap-2">
        <input
          v-model="input"
          placeholder="궁금한 종목이나 투자 질문을 입력해보세요"
          class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          전송
        </button>
      </form>
    </div>
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
      chatStore.setUserId(res.data.userId)

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
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE' },
      ],
    })
  }
})

async function fetchGPT(prompt, explicitIntent = null) {
  loading.value = true
  chatStore.messages.push({ role: 'user', content: prompt })

  console.log('📤 서버로 보낼 userId:', userId.value)

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
  }
  try {
    console.log('🧾 최종 intentType 전송값:', intentType)

    const res = await axios.post('/api/chatbot/message', {
      userId: userId.value,
      sessionId: chatStore.sessionId,
      message: prompt,
      intentType: intentType, // null이면 GPT가 분류함
    })

    if (res?.data?.content) {
      chatStore.messages.push({ role: 'bot', content: res.data.content })
      chatStore.sessionId = res.data.sessionId
      chatStore.intentType = res.data.intentType
    } else {
      chatStore.messages.push({ role: 'bot', content: '❌ GPT 응답이 비어 있습니다.' })
    }
  } catch (error) {
    console.log(userId)
    chatStore.messages.push({ role: 'bot', content: '⚠️ 서버 오류가 발생했어요.' })
    console.error('❌ GPT fetch 실패:', error)
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
  console.log('👆 버튼 클릭됨:', btn) // 이게 콘솔에 안 찍히면 렌더링 문제

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

  if (btn.intent === 'PORTFOLIO_ANALYZE') {
    if (!btn.message) {
      console.log('⚠️ PORTFOLIO_ANALYZE 초기 안내 단계') // ← 여기는 안내만
      chatStore.clearMessages()
      chatStore.messages.push({
        role: 'bot',
        type: 'buttons',
        text: '모의투자 내역 기반 피드백을 드릴게요.\n확인하려면 아래 버튼을 눌러주세요.',
        buttons: [
          {
            label: '🧠 피드백 요청하기',
            intent: 'PORTFOLIO_ANALYZE',
            message: '내 포트폴리오 피드백 줘',
          },
          { label: '🔙 뒤로가기', intent: 'BACK_TO_MAIN' },
        ],
      })
      return
    }
    console.log('🚀 피드백 요청 버튼 클릭됨', btn)
    // 🔥 여기서 메시지가 없으면 보내지지 않음 → 방어 코드 추가
    const message = btn.message ?? '내 포트폴리오 피드백 줘'
    await chatStore.sendMessage(message, btn.intent, chatStore.userId)
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
        { label: '🧠 포트폴리오', intent: 'PORTFOLIO_ANALYZE' },
      ],
    })
    return
  }

  loading.value = true
  await chatStore.sendMessage(btn.message, btn.intent)
  loading.value = false
}
</script>
