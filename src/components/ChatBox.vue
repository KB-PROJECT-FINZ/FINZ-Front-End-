<template>
  <div class="flex flex-col h-full">
    <!-- 대화 내용 -->
    <div class="flex-1 overflow-y-auto space-y-6 p-4 pb-28">
      <!-- 챗봇 아바타와 인사말 (첫 로드 시) -->
      <div v-if="chatStore.messages.length === 0" class="flex items-start space-x-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1">
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-xs shadow-lg border border-white/30">
            <p class="font-bold text-gray-800 text-lg">
              안녕하세요 {{ userStore.name || '사용자' }}님! 👋
            </p>
            <p class="text-gray-600 text-sm mt-2">무엇을 도와드릴까요?</p>
          </div>
        </div>
      </div>



      <!-- 메시지들 -->
      <div
        v-for="(msg, i) in chatStore.messages"
        :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : 'flex items-start space-x-4'"
      >
        <!-- 사용자 메시지 -->
        <div v-if="msg.role === 'user'" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-4 max-w-xs shadow-lg">
          <p class="font-medium">{{ msg.content }}</p>
        </div>

        <!-- 봇 메시지 -->
        <template v-else>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1">
            <!-- 🆕 키워드 기반 주식 추천 카드 -->
            <div v-if="isStockRecommendationResponse(msg.content)">
              <StockRecommendationCards :content="msg.content" />
            </div>

            <!-- 일반 메시지 -->
            <div v-else-if="!msg.type" class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-xs shadow-lg border border-white/30">
              <p class="text-gray-800">{{ msg.content }}</p>
            </div>

            <!-- 버튼 메시지 -->
            <div v-else-if="msg.type === 'buttons'" class="space-y-4">
              <div v-if="msg.text" class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-xs shadow-lg border border-white/30">
                <p class="text-gray-800">{{ msg.text }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="(btn, idx) in msg.buttons"
                  :key="idx"
                  @click="handleButtonIntent(btn)"
                  class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-4 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span class="text-gray-800 font-semibold text-sm">{{ btn.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 로딩 메시지 (마지막에 표시) -->
      <div v-if="loading" class="flex items-start space-x-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <p class="text-sm text-gray-600">답변을 준비하고 있어요...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-white/30">
      <form @submit.prevent="submit" class="flex gap-3">
        <input
          v-model="input"
          placeholder="궁금한 종목이나 투자 질문을 입력해보세요"
          class="flex-1 bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg"
        />
        <button
          type="submit"
          class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
import StockRecommendationCards from './StockRecommendationCards.vue'

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

// 🆕 키워드 기반 주식 추천 응답 감지 함수 (개선된 버전)
const isStockRecommendationResponse = (content) => {
  // content가 없거나 문자열이 아닌 경우 false 반환
  if (!content || typeof content !== 'string') {
    return false
  }

  // 1. JSON 형태 응답 감지 (백엔드에서 구조화된 데이터 제공)
  try {
    const parsed = JSON.parse(content)
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (item) =>
          item.ticker && item.reason && item.riskLevel && item.timingComment && item.futureOutlook,
      )
    ) {
      console.log('✅ JSON 형태 키워드 기반 추천 감지됨:', parsed)
      return true
    }
  } catch (error) {
    console.log('❌ JSON 파싱 실패:', error)
  }

  // 2. 텍스트 형태 주식 추천 감지 (기존 방식 유지)
  const stockKeywords = [
    'CJ제일제당', '삼양식품', '오뚜기', '롯데제과', '농심',
    '삼성전자', 'SK하이닉스', 'NAVER', '카카오', '넵튠', '한국정보인증',
    '현대차', '기아', '삼성바이오로직스', '셀트리온',
    'LG화학', 'POSCO', 'SK이노베이션', '포스코'
  ]
  
  const foundStocks = stockKeywords.filter(keyword => content.includes(keyword))
  const hasMultipleStocks = foundStocks.length >= 2
  const hasRecommendationText = content.includes('투자') && (
    content.includes('추천') || 
    content.includes('매력') || 
    content.includes('가능성') ||
    content.includes('고려') ||
    content.includes('가치') ||
    content.includes('적합') ||
    content.includes('어울리는')
  )
  
  if (hasMultipleStocks && hasRecommendationText) {
    console.log('✅ 텍스트 형태 키워드 기반 추천 감지됨:', { foundStocks, content: content.substring(0, 100) })
    return true
  }

  return false
}

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
      text: '원하시는 기능을 선택해주세요',
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
      intentType: intentType ?? chatStore.intentType,
    })

    if (res?.data?.content) {
      chatStore.messages.push({ role: 'bot', content: res.data.content })
      chatStore.sessionId = res.data.sessionId
      chatStore.intentType = res.data.intentType
    } else {
      chatStore.messages.push({ role: 'bot', content: '❌ GPT 응답이 비어 있습니다.' })
    }
  } catch (err) {
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
