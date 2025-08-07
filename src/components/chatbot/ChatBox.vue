<template>
  <div class="flex flex-col h-full">
    <!-- 상단 고정 버튼들 -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/30 p-2">
      <!-- 토글 버튼 -->
      <div v-show="!hasSubButtons" class="flex justify-center mb-2">
        <button
          @click="toggleButtons"
          class="w-6 h-6 rounded-full bg-gray-200/60 hover:bg-gray-300/80 transition-all duration-200 flex items-center justify-center"
        >
          <div v-if="showButtons" class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
          <div v-else class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        </button>
      </div>
      
      <!-- 버튼 그리드 -->
      <div v-show="showButtons && !hasSubButtons" class="grid grid-cols-2 gap-2">
        <button
          @click="handleButtonIntent({ intent: 'RECOMMEND_SELECT' })"
          class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-3 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-2">
            <RecommendIcon class="text-blue-600" />
            <span class="text-gray-800 font-semibold text-sm">종목 추천</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'STOCK_ANALYZE' })"
          class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-3 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-2">
            <AnalyzeIcon class="text-blue-600" />
            <span class="text-gray-800 font-semibold text-sm">종목 분석</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'TERM_EXPLAIN' })"
          class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-3 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-2">
            <TermIcon class="text-blue-600" />
            <span class="text-gray-800 font-semibold text-sm">용어 설명</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'PORTFOLIO_ANALYZE' })"
          class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-3 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-2">
            <PortfolioIcon class="text-blue-600" />
            <span class="text-gray-800 font-semibold text-sm">포트폴리오</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 대화 내용 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto space-y-6 p-4 pb-28">
      <!-- 챗봇 아바타와 인사말 (첫 로드 시) -->
      <div v-if="chatStore.messages.length === 0" class="flex items-start space-x-4">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
        >
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 max-w-xs">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-sm shadow-lg border border-white/30"
          >
            <p class="text-sm text-gray-600">원하는 기능을 선택해주세요</p>
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
        <div
          v-if="msg.role === 'user'"
          class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-4 max-w-sm shadow-lg"
        >
          <p class="font-medium">{{ msg.content }}</p>
        </div>

        <!-- 봇 메시지 -->
        <template v-else>
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
          >
            <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 max-w-xs">
            <!-- 용어 설명 카드 -->
            <div v-if="isTermExplanationResponse(msg.content)">
              <TermExplanationCard :content="msg.content" />
            </div>

            <!-- 키워드 기반 주식 추천 카드 -->
            <div v-else-if="isStockRecommendationResponse(msg.content)">
              <StockRecommendationCards :content="msg.content" />
            </div>

            <!-- 일반 메시지 -->
            <div
              v-else-if="!msg.type"
              class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-sm shadow-lg border border-white/30"
            >
              <p class="text-gray-800">{{ msg.content }}</p>
            </div>

            <!-- 버튼 메시지 -->
            <div v-else-if="msg.type === 'buttons'" class="space-y-4">
              <div
                v-if="msg.text"
                class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-sm shadow-lg border border-white/30"
              >
                <p class="text-gray-800">{{ msg.text }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="(btn, idx) in msg.buttons"
                  :key="idx"
                  @click="handleButtonIntent(btn)"
                  class="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-4 text-center hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div class="flex flex-col items-center space-y-2">
                    <component :is="getButtonIcon(btn.intent)" class="text-blue-600" />
                    <span class="text-gray-800 font-semibold text-sm">{{
                      btn.label.replace(/[🎯🔍🔙🧠🧪📊]/g, '').trim()
                    }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 로딩 메시지 (마지막에 표시) -->
      <div v-if="loading" class="flex items-start space-x-4">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
        >
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="max-w-xs">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 max-w-sm shadow-lg border border-white/30"
          >
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                ></div>
                <div
                  class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                ></div>
              </div>
              <p class="text-sm text-gray-600">답변을 준비하고 있어요...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div
      class="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-white/30"
    >
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import { useChatStore } from '@/stores/counter.js'
import { useUserStore } from '@/stores/user.js'
import StockRecommendationCards from './StockRecommendationCards.vue'
import TermExplanationCard from './TermExplanationCard.vue'
import RecommendIcon from '../icons/RecommendIcon.vue'
import AnalyzeIcon from '../icons/AnalyzeIcon.vue'
import TermIcon from '../icons/TermIcon.vue'
import PortfolioIcon from '../icons/PortfolioIcon.vue'
import ProfileIcon from '../icons/ProfileIcon.vue'
import KeywordIcon from '../icons/KeywordIcon.vue'
import BackIcon from '../icons/BackIcon.vue'
import FeedbackIcon from '../icons/FeedbackIcon.vue'
import ExternalLinkIcon from '../icons/ExternalLinkIcon.vue'

const chatStore = useChatStore()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const input = ref('')
const loading = ref(false)
const awaitingKeyword = ref(false)
const awaitingStockAnalyze = ref(false)
const awaitingTermExplain = ref(false)
const messageContainer = ref(null)
const showButtons = ref(true)

// 하위 버튼이 있는지 감지
const hasSubButtons = computed(() => {
  return chatStore.messages.some(msg => 
    msg.type === 'buttons' && 
    msg.buttons && 
    msg.buttons.some(btn => 
      btn.intent === 'RECOMMEND_PROFILE' || 
      btn.intent === 'RECOMMEND_KEYWORD' || 
      btn.intent === 'RECOMMEND_SELECT' ||
      btn.intent === 'BACK_TO_MAIN'
    )
  )
})

// 용어 설명 응답 감지 함수
const isTermExplanationResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  try {
    const parsed = JSON.parse(content)
    if (parsed && parsed.term && parsed.definition && parsed.meaning && parsed.beginnerTip) {
      console.log('✅ 용어 설명 응답 감지됨:', parsed)
      return true
    }
  } catch (error) {
    console.log('❌ 용어 설명 JSON 파싱 실패:', error)
  }

  return false
}

// 키워드 기반 주식 추천 응답 감지 함수
const isStockRecommendationResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

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

  return false
}

// intent 상태 초기화 함수
function resetAwaitingState() {
  awaitingKeyword.value = false
  awaitingStockAnalyze.value = false
  awaitingTermExplain.value = false
}

// 버튼 아이콘 반환 함수
const getButtonIcon = (intent) => {
  switch (intent) {
    case 'RECOMMEND_SELECT':
      return RecommendIcon
    case 'STOCK_ANALYZE':
      return AnalyzeIcon
    case 'TERM_EXPLAIN':
      return TermIcon
    case 'PORTFOLIO_ANALYZE':
      return PortfolioIcon
    case 'RECOMMEND_PROFILE':
      return ProfileIcon
    case 'RECOMMEND_KEYWORD':
      return KeywordIcon
    case 'EXTERNAL_LINK':
      return ExternalLinkIcon
    case 'BACK_TO_MAIN':
      return BackIcon
    default:
      return null
  }
}



// 버튼 토글 함수
const toggleButtons = () => {
  showButtons.value = !showButtons.value
}

// 자동 스크롤 함수
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 메시지 변경 감지하여 자동 스크롤
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom()
  },
)

// 로딩 상태 변경 감지하여 자동 스크롤
watch(loading, (newLoading) => {
  if (newLoading) {
    scrollToBottom()
  }
})

// 대화 시작 시 버튼들 자동 숨김
watch(() => chatStore.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength && oldLength === 0) {
    showButtons.value = false
  }
})

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
  }

  try {
    console.log('🧾 최종 intentType 전송값:', intentType)

    const res = await axios.post('/api/chatbot/message', {
      userId: userId.value,
      sessionId: chatStore.sessionId,
      message: prompt,
      intentType: intentType,
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
  console.log('👆 버튼 클릭됨:', btn)

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
      console.log('⚠️ PORTFOLIO_ANALYZE 초기 안내 단계')
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
    const message = btn.message ?? '내 포트폴리오 피드백 줘'
    await chatStore.sendMessage(message, btn.intent, chatStore.userId)
    return
  }

  if (btn.intent === 'TERM_EXPLAIN') {
    awaitingTermExplain.value = true
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '설명을 원하는 용어를 입력해주세요. 예: PER, EPS, ROE 등',
      buttons: [{ label: '🔙 뒤로가기', intent: 'BACK_TO_MAIN' }],
    })
    return
  }

  if (btn.intent === 'BACK_TO_MAIN') {
    chatStore.messages = []
    return
  }

  // message가 있는 경우에만 sendMessage 호출
  if (btn.message) {
    loading.value = true
    await chatStore.sendMessage(btn.message, btn.intent)
    loading.value = false
  }
}
</script>
