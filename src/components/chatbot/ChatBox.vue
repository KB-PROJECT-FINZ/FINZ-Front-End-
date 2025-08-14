<template>
  <div class="flex flex-col h-full">
    <!-- 상단 고정 버튼들 -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/30 p-4">
      <!-- 토글 버튼 -->
      <div v-show="!hasSubButtons" class="flex justify-center mb-3">
        <button
          @click="toggleButtons"
          class="w-6 h-6 rounded-2xl bg-white/60 hover:bg-white/80 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md backdrop-blur-sm"
        >
          <div v-if="showButtons" class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
          <div v-else class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        </button>
      </div>

      <!-- 버튼 그리드 -->
      <div v-show="showButtons && !hasSubButtons" class="grid grid-cols-2 gap-2">
        <button
          @click="handleButtonIntent({ intent: 'RECOMMEND_SELECT' })"
          class="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-2 text-center hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-1">
            <div
              class="w-6 h-6 bg-blue-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <RecommendIcon class="text-blue-600 w-3 h-3" />
            </div>
            <span class="text-gray-700 font-medium text-xs">종목 추천</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'STOCK_ANALYZE' })"
          class="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-2 text-center hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-1">
            <div
              class="w-6 h-6 bg-green-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <AnalyzeIcon class="text-green-600 w-3 h-3" />
            </div>
            <span class="text-gray-700 font-medium text-xs">종목 분석</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'TERM_EXPLAIN' })"
          class="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-2 text-center hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-1">
            <div
              class="w-6 h-6 bg-orange-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <TermIcon class="text-orange-600 w-3 h-3" />
            </div>
            <span class="text-gray-700 font-medium text-xs">용어 설명</span>
          </div>
        </button>
        <button
          @click="handleButtonIntent({ intent: 'PORTFOLIO_ANALYZE' })"
          class="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-2 text-center hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
        >
          <div class="flex flex-col items-center space-y-1">
            <div
              class="w-6 h-6 bg-purple-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <PortfolioIcon class="text-purple-600 w-3 h-3" />
            </div>
            <span class="text-gray-700 font-medium text-xs">포트폴리오</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 대화 내용 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto space-y-6 p-4 pb-28">
      <!-- 챗봇 아바타와 인사말 (첫 로드 시) -->
      <div v-if="chatStore.messages.length === 0" class="flex items-start space-x-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400/90 to-purple-500/90 shadow-lg border-2 border-white/40 backdrop-blur-sm"
        >
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 max-w-xs">
          <div
            class="bg-white/90 backdrop-blur-md rounded-3xl p-4 max-w-sm shadow-lg border border-white/40"
          >
            <p class="text-gray-600 text-sm">원하는 기능을 선택해주세요</p>
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
          class="bg-gradient-to-r from-blue-400/90 to-purple-500/90 text-white rounded-3xl p-4 max-w-sm shadow-lg backdrop-blur-sm"
        >
          <p class="font-medium">{{ msg.content }}</p>
        </div>

        <!-- 봇 메시지 -->
        <template v-else>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400/90 to-purple-500/90 shadow-lg border-2 border-white/40 backdrop-blur-sm"
          >
            <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
          </div>

          <div class="flex-1 max-w-xs">
            <!-- 용어 설명 카드 -->
            <div v-if="isTermExplanationResponse(msg.content)">
              <TermExplanationCard :content="msg.content" />
            </div>

            <!-- 종목 분석 응답 (카드 형식으로 표시) -->
            <div
              v-else-if="isStockAnalysisResponse(msg.content) || msg.intentType === 'STOCK_ANALYZE'"
            >
              <StockAnalysisCard :content="msg.content" />
            </div>

            <!-- 키워드 기반 주식 추천 카드 -->
            <div v-else-if="isStockRecommendationResponse(msg.content)">
              <StockRecommendationCards :content="msg.content" />
            </div>

            <!-- 피드백 분석 카드 -->
            <div v-else-if="isFeedbackAnalysisResponse(msg.content)">
              <FeedbackAnalysisCard :content="msg.content" />
            </div>

            <!-- 일반 메시지 (PORTFOLIO_ANALYZE 등 포함) -->
            <div
              v-else-if="!msg.type"
              class="bg-white/90 backdrop-blur-md rounded-3xl p-4 max-w-sm shadow-lg border border-white/40"
            >
              <p
                v-if="msg.requestedPeriod && msg.intentType === 'PORTFOLIO_ANALYZE'"
                class="text-xs text-purple-600 font-medium mb-2 bg-purple-50/80 px-2 py-1 rounded-full inline-block backdrop-blur-sm"
              >
                📅 사용자 지정 분석 기간: {{ msg.requestedPeriod }}일
              </p>
              <p class="text-gray-700 text-sm">{{ msg.content }}</p>
            </div>

            <!-- 버튼 메시지 -->
            <div v-else-if="msg.type === 'buttons'" class="space-y-3">
              <div
                v-if="msg.text"
                class="bg-white/90 backdrop-blur-md rounded-3xl p-4 max-w-sm shadow-lg border border-white/40"
              >
                <p class="text-gray-700 text-sm">{{ msg.text }}</p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="(btn, idx) in msg.buttons"
                  :key="idx"
                  @click="handleButtonIntent(btn)"
                  class="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-3 text-center hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                >
                  <div class="flex flex-col items-center space-y-2">
                    <div
                      class="w-6 h-6 bg-blue-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <component :is="getButtonIcon(btn.intent)" class="text-blue-600 w-3 h-3" />
                    </div>
                    <span class="text-gray-700 font-medium text-xs">{{
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
          class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400/90 to-purple-500/90 shadow-lg border-2 border-white/40 backdrop-blur-sm"
        >
          <img src="@/assets/finz-robot.png" alt="FINZ" class="w-full h-full object-cover" />
        </div>
        <div class="max-w-xs">
          <div
            class="bg-white/90 backdrop-blur-md rounded-3xl p-4 max-w-sm shadow-lg border border-white/40"
          >
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-400/80 rounded-full animate-bounce"></div>
                <div
                  class="w-2 h-2 bg-purple-400/80 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                ></div>
                <div
                  class="w-2 h-2 bg-blue-400/80 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                ></div>
              </div>
              <p class="text-gray-600 text-sm">답변을 준비하고 있어요...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div
      class="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-white/40"
    >
      <form @submit.prevent="submit" class="flex gap-3">
        <input
          v-model="input"
          placeholder="궁금한 종목이나 투자 질문을 입력해보세요"
          class="flex-1 bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent shadow-sm transition-all duration-300"
        />
        <button
          type="submit"
          class="bg-gradient-to-r from-blue-400/90 to-purple-500/90 text-white px-5 py-3 rounded-2xl font-medium hover:from-blue-500/90 hover:to-purple-600/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 backdrop-blur-sm"
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
import FeedbackAnalysisCard from './FeedbackAnalysisCard.vue'
import RecommendIcon from '../icons/RecommendIcon.vue'
import AnalyzeIcon from '../icons/AnalyzeIcon.vue'
import TermIcon from '../icons/TermIcon.vue'
import PortfolioIcon from '../icons/PortfolioIcon.vue'
import ProfileIcon from '../icons/ProfileIcon.vue'
import KeywordIcon from '../icons/KeywordIcon.vue'
import BackIcon from '../icons/BackIcon.vue'
import ExternalLinkIcon from '../icons/ExternalLinkIcon.vue'
import AnalysisIcon from '../icons/AnalysisIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import StockAnalysisCard from './StockAnalysisCard.vue'

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
  return chatStore.messages.some(
    (msg) =>
      msg.type === 'buttons' &&
      msg.buttons &&
      msg.buttons.some(
        (btn) =>
          btn.intent === 'RECOMMEND_PROFILE' ||
          btn.intent === 'RECOMMEND_KEYWORD' ||
          btn.intent === 'RECOMMEND_SELECT' ||
          btn.intent === 'BACK_TO_MAIN',
      ),
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

  console.log('🎯 isStockRecommendationResponse 호출됨:', content.substring(0, 100) + '...')

  // 투자 성향 기반 추천이나 키워드 기반 추천인지 확인
  if (
    content.startsWith('🧠 투자 성향 기반 추천드릴게요!') ||
    content.startsWith('🎯 키워드 기반 추천드릴게요!')
  ) {
    console.log('✅ 투자 성향/키워드 기반 추천 감지됨')
    return true
  }

  // 종목 분석 응답인지 먼저 확인 (종목명이 포함된 경우)
  if (
    content.includes('위험도:') &&
    content.includes('AI 분석 Tip') &&
    content.includes('향후 전망')
  ) {
    // 종목 분석 응답은 키워드 기반 추천이 아님
    return false
  }

  // 종목 분석 응답의 다른 패턴들도 확인
  if (
    content.includes('테슬라') ||
    content.includes('삼성전자') ||
    content.includes('SK하이닉스')
  ) {
    if (
      content.includes('위험도:') ||
      content.includes('AI 분석 Tip') ||
      content.includes('향후 전망')
    ) {
      return false
    }
  }

  // 종목 분석 응답의 다른 패턴들도 확인 (더 구체적으로)
  if (
    content.includes('위험도:') &&
    (content.includes('테슬라') ||
      content.includes('TSLA') ||
      content.includes('삼성전자') ||
      content.includes('005930'))
  ) {
    return false
  }

  // 종목 분석 응답의 특징적인 패턴들 확인
  const stockAnalysisPatterns = ['위험도:', 'AI 분석 Tip', '향후 전망']

  const hasStockAnalysisPatterns = stockAnalysisPatterns.some((pattern) =>
    content.includes(pattern),
  )
  if (hasStockAnalysisPatterns) {
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

  console.log('❌ 키워드 기반 추천이 아님')
  return false
}

// 종목 분석 응답 감지 함수
const isStockAnalysisResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  console.log('🔍 isStockAnalysisResponse 호출됨:', content.substring(0, 100) + '...')

  // 투자 성향 기반 추천이나 키워드 기반 추천인지 먼저 확인
  if (
    content.startsWith('🧠 투자 성향 기반 추천드릴게요!') ||
    content.startsWith('🎯 키워드 기반 추천드릴게요!')
  ) {
    console.log('❌ 투자 성향/키워드 기반 추천이므로 종목 분석이 아님')
    return false
  }

  // JSON 형태의 종목 분석 응답인지 확인
  try {
    const jsonStart = content.indexOf('[')
    if (jsonStart !== -1) {
      const jsonContent = content.substring(jsonStart)
      const parsed = JSON.parse(jsonContent)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0]
        if (
          firstItem.ticker &&
          firstItem.reason &&
          firstItem.riskLevel &&
          firstItem.timingComment &&
          firstItem.futureOutlook
        ) {
          console.log('✅ JSON 형태 종목 분석 응답 감지됨')
          return true
        }
      }
    }
  } catch (error) {
    // JSON 파싱 실패 시 텍스트 패턴으로 확인
  }

  // 종목 분석 응답의 특징적인 패턴들 확인
  if (
    content.includes('위험도:') &&
    content.includes('AI 분석 Tip') &&
    content.includes('향후 전망')
  ) {
    console.log('✅ 종목 분석 응답 감지됨')
    return true
  }

  // 종목명이 포함되어 있고 위험도가 포함된 경우
  if (
    content.includes('위험도:') &&
    (content.includes('테슬라') ||
      content.includes('TSLA') ||
      content.includes('삼성전자') ||
      content.includes('005930'))
  ) {
    console.log('✅ 종목 분석 응답 감지됨 (종목명 + 위험도)')
    return true
  }

  // 종목 분석 응답의 다른 패턴들도 확인
  if (content.includes('위험도:') && content.includes('AI 분석 Tip')) {
    console.log('✅ 종목 분석 응답 감지됨 (위험도 + AI 분석 Tip)')
    return true
  }

  // 종목 분석 응답의 다른 패턴들도 확인
  if (content.includes('위험도:') && content.includes('향후 전망')) {
    console.log('✅ 종목 분석 응답 감지됨 (위험도 + 향후 전망)')
    return true
  }

  console.log('❌ 종목 분석 응답이 아님')
  return false
}

// 피드백 분석 응답 감지 함수
const isFeedbackAnalysisResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  // JSON 형태의 피드백 응답인지 확인
  try {
    if (content.trim().startsWith('{')) {
      const jsonData = JSON.parse(content)
      if (jsonData.strategySummary && jsonData.riskPoint && jsonData.suggestion) {
        console.log('✅ JSON 형태 피드백 분석 응답 감지됨')
        return true
      }
    }

    // 텍스트와 JSON이 섞여있는 경우 JSON 부분만 확인
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0])
      if (jsonData.strategySummary && jsonData.riskPoint && jsonData.suggestion) {
        console.log('✅ 혼합 형태 피드백 분석 응답 감지됨')
        return true
      }
    }
  } catch (error) {
    // JSON 파싱 실패 시 텍스트 패턴으로 확인
  }

  // 기존 텍스트 형태 피드백 분석 응답의 특징적인 패턴들 확인
  const feedbackPatterns = [
    '투자 전략의 특징:',
    '리스크 및 개선점:',
    '개인 맞춤 조언:',
    '사용자 지정 분석 기간:',
  ]

  const hasFeedbackPatterns = feedbackPatterns.some((pattern) => content.includes(pattern))

  if (hasFeedbackPatterns) {
    console.log('✅ 텍스트 형태 피드백 분석 응답 감지됨')
    return true
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
    case 'REANALYZE_OPTIONS':
      return RefreshIcon
    case 'ANALYSIS_COMPLETE':
      return AnalysisIcon
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
watch(
  () => chatStore.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength && oldLength === 0) {
      showButtons.value = false
    }
  },
)

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
const props = defineProps({ risk: String })

onMounted(() => {
  if (props.risk) {
    fetchGPT(`나의 투자 성향인 ${props.risk}에 맞는 종목을 추천해줘`, 'RECOMMEND_PROFILE')
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
      console.log('📦 받은 응답 내용:', res.data.content)
      console.log('📦 받은 intentType:', res.data.intentType)

      chatStore.messages.push({
        role: 'bot',
        content: res.data.content,
        requestedPeriod: res.data.requestedPeriod,
        intentType: intentType || res.data.intentType, // intentType을 명시적으로 설정
      })
      console.log('📦 requestedPeriod in response:', res.data.requestedPeriod)

      if (intentType === 'PORTFOLIO_ANALYZE') {
        chatStore.messages.push({
          role: 'bot',
          type: 'buttons',
          text: '분석이 완료되었습니다.\n다시 분석해보시겠어요?',
          buttons: [
            { label: '다시 분석하기', intent: 'REANALYZE_OPTIONS' },
            { label: '뒤로가기', intent: 'BACK_TO_MAIN' },
          ],
        })
      }

      chatStore.sessionId = res.data.sessionId
      chatStore.intentType = res.data.intentType
      console.log('📦 응답 전체:', res.data)
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
            label: '   내 성향 기반 추천 받아보기',
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
      console.log('⚠️ PORTFOLIO_ANALYZE 초기 안내 단계') // ← 여기는 안내만
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
    await fetchGPT(message, btn.intent) // ✅ 변경됨
    return
  }

  if (btn.intent === 'REANALYZE_OPTIONS') {
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '📆 다시 분석할 기간을 선택해주세요:',
      buttons: [
        {
          label: '📅 1개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 1개월간의 포트폴리오 피드백 줘',
        },
        {
          label: '🗓 3개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 3개월간의 포트폴리오 피드백 줘',
        },
        {
          label: '📈 6개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 6개월간의 포트폴리오 피드백 줘',
        },
        { label: '🔙 뒤로가기', intent: 'BACK_TO_MAIN' },
      ],
    })
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
