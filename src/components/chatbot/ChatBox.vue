<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 대화 내용 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto space-y-6 p-4 pb-80">
      <!-- 챗봇 아바타와 인사말 (첫 로드 시) -->
      <div v-if="chatStore.messages.length === 0" class="flex items-start space-x-3">
        <div
          class="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden"
        >
          <img src="@/assets/finz-robot.png" alt="finz" class="w-10 h-10 object-cover ml-2" />
        </div>
        <div class="flex-1 max-w-xs">
          <div class="bg-gray-200 rounded-3xl px-4 py-3 shadow-sm">
            <p class="text-gray-700 text-sm font-normal leading-relaxed">
              안녕하세요! 무엇을 도와드릴까요?
            </p>
          </div>
          <p class="text-xs text-gray-500 mt-1 ml-2">
            {{ formatMessageTime(new Date().toISOString()) }}
          </p>
        </div>
      </div>

      <!-- 메시지들 -->
      <div
        v-for="(msg, i) in filteredMessages"
        :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : 'flex items-start space-x-3'"
      >
        <!-- 사용자 메시지 -->
        <div v-if="msg.role === 'user'" class="flex flex-col items-end">
          <div class="bg-blue-500 text-white rounded-3xl px-4 py-3 max-w-xs shadow-sm">
            <div
              class="text-sm font-normal leading-relaxed"
              v-html="parseMarkdown(msg.content)"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1 mr-2">{{ formatMessageTime(msg.timestamp) }}</p>
        </div>

        <!-- 봇 메시지 -->
        <template v-else>
          <div
            class="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden"
          >
            <img src="@/assets/finz-robot.png" alt="finz" class="w-10 h-10 object-cover" />
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

            <!-- 투자 성향 기반 추천 카드 (메시지 내용으로 직접 확인) -->
            <div
              v-else-if="msg.content && msg.content.startsWith('🧠 투자 성향 기반 추천드릴게요!')"
            >
              <StockRecommendationCards :content="msg.content" />
            </div>

            <!-- 키워드 기반 주식 추천 카드 (메시지 내용으로 직접 확인) -->
            <div v-else-if="msg.content && msg.content.startsWith('🎯 키워드 기반 추천드릴게요!')">
              <StockRecommendationCards :content="msg.content" />
            </div>

            <div v-else-if="isFeedbackAnalysisResponse(msg.content)">
              <FeedbackAnalysisCard :content="msg.content" />
            </div>

            <!-- 일반 메시지 -->
            <div v-else-if="!msg.type" class="bg-gray-200 rounded-3xl px-4 py-3 shadow-sm">
              <!-- 분석 기간 표시 -->
              <div
                v-if="msg.requestedPeriod && msg.intentType === 'PORTFOLIO_ANALYZE'"
                class="text-xs text-purple-600 font-medium mb-2 bg-purple-100 px-2 py-1 rounded-full inline-block"
              >
                사용자 지정 분석 기간: {{ msg.requestedPeriod }}일
              </div>
              <div class="text-gray-700 text-sm" v-html="parseMarkdown(msg.content)"></div>
            </div>

            <!-- 버튼 메시지 -->
            <div v-else-if="msg.type === 'buttons'" class="space-y-3">
              <!-- 메시지 텍스트 -->
              <div v-if="msg.text" class="bg-gray-200 rounded-3xl px-4 py-3 shadow-sm">
                <p class="text-gray-700 text-sm font-normal leading-relaxed">{{ msg.text }}</p>
              </div>

              <!-- 버튼 그리드 -->
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="(btn, idx) in msg.buttons"
                  :key="idx"
                  @click="handleButtonIntent(btn)"
                  class="bg-white border border-gray-200 rounded-xl px-3 py-2 text-center hover:bg-gray-50 transition-all duration-200 text-xs font-medium text-gray-700"
                >
                  {{ btn.label.replace(/[🎯🔍🔙🧠🧪📊📅🗓📈]/g, '').trim() }}
                </button>
              </div>
            </div>

            <!-- 로딩 메시지 -->
            <div
              v-else-if="msg.type === 'loading'"
              class="bg-gray-200 rounded-3xl px-4 py-3 shadow-sm"
            >
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.1s"
                  ></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.2s"
                  ></div>
                </div>
                <p class="text-gray-600 text-sm">{{ msg.content }}</p>
              </div>
            </div>

            <!-- 봇 메시지 시간 표시 -->
            <p class="text-xs text-gray-500 mt-1 ml-2">{{ formatMessageTime(msg.timestamp) }}</p>
          </div>
        </template>
      </div>

      <!-- 로딩 메시지 (마지막에 표시) -->
      <div v-if="loading && chatStore.messages.length > 0" class="flex items-start space-x-3">
        <div
          class="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden"
        >
          <img src="@/assets/finz-robot.png" alt="finz" class="w-10 h-10 object-cover" />
        </div>
        <div class="max-w-xs">
          <div class="bg-gray-200 rounded-2xl px-4 py-3">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                ></div>
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                ></div>
              </div>
              <p class="text-gray-600 text-sm">답변을 준비하고 있어요...</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1 ml-2">
            {{ formatMessageTime(new Date().toISOString()) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 고정 버튼 영역 -->
    <div class="fixed bottom-20 left-0 right-0 bg-blue-500 p-4 shadow-lg">
      <div class="max-w-md mx-auto">
        <div class="grid grid-cols-3 gap-3">
          <!-- 첫 번째 행 -->
          <button
            @click="handleButtonIntent({ intent: 'RECOMMEND_KEYWORD' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span class="text-white text-xs font-medium">키워드로 추천</span>
          </button>

          <button
            @click="handleButtonIntent({ intent: 'BACK_TO_MAIN' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span class="text-white text-xs font-medium">처음으로</span>
          </button>

          <button
            @click="handleButtonIntent({ intent: 'RECOMMEND_PROFILE' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span class="text-white text-xs font-medium">투자 성향으로 추천</span>
          </button>

          <!-- 두 번째 행 -->
          <button
            @click="handleButtonIntent({ intent: 'TERM_EXPLAIN' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5c1.747 0 3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253"
              />
            </svg>
            <span class="text-white text-xs font-medium">용어 설명</span>
          </button>

          <button
            @click="handleButtonIntent({ intent: 'STOCK_ANALYZE' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span class="text-white text-xs font-medium">종목 분석</span>
          </button>

          <button
            @click="handleButtonIntent({ intent: 'PORTFOLIO_ANALYZE' })"
            class="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span class="text-white text-xs font-medium">포트폴리오</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div class="max-w-md mx-auto flex items-center space-x-3">
        <input
          v-model="input"
          @keyup.enter="submit"
          type="text"
          placeholder="Type your message..."
          class="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 font-normal"
        />
        <button
          @click="submit"
          class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import { useChatStore } from '@/stores/counter.js'
import { useUserStore } from '@/stores/user.js'
import { marked } from 'marked'
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

// 메시지 시간을 포맷팅하는 함수
const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${ampm}`
  } catch (error) {
    console.error('시간 포맷팅 오류:', error)
    return ''
  }
}

// 마크다운을 HTML로 변환하는 함수
const parseMarkdown = (text) => {
  try {
    // **굵은 글씨** 패턴을 <strong> 태그로 변환
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // 줄바꿈을 <br> 태그로 변환
    html = html.replace(/\n/g, '<br>')

    return html
  } catch (error) {
    console.error('마크다운 파싱 오류:', error)
    return text
  }
}

// 하위 버튼이 있는지 감지 (더 이상 사용하지 않음)
const hasSubButtons = computed(() => {
  return false
})

// 용어 설명 응답 감지 함수
const isTermExplanationResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  try {
    const parsed = JSON.parse(content)
    if (parsed && parsed.term && parsed.definition && parsed.meaning && parsed.beginnerTip) {
      return true
    }
  } catch (error) {
    // JSON 파싱 실패
  }

  return false
}

// 투자 성향 기반 추천 응답 감지 함수
const isProfileBasedRecommendationResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  // 투자 성향 기반 추천인지 확인
  if (content.startsWith('🧠 투자 성향 기반 추천드릴게요!')) {
    return true
  }

  return false
}

// 키워드 기반 주식 추천 응답 감지 함수
const isStockRecommendationResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  // 투자 성향 기반 추천인지 먼저 확인 (이것은 키워드 기반 추천이 아님)
  if (content.startsWith('🧠 투자 성향 기반 추천드릴게요!')) {
    return false
  }

  // 키워드 기반 추천인지 확인
  if (content.startsWith('🎯 키워드 기반 추천드릴게요!')) {
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
      return true
    }
  } catch (error) {
    // JSON 파싱 실패
  }

  return false
}

// 종목 분석 응답 감지 함수
const isStockAnalysisResponse = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }

  // 투자 성향 기반 추천이나 키워드 기반 추천인지 먼저 확인
  if (
    content.startsWith('🧠 투자 성향 기반 추천드릴게요!') ||
    content.startsWith('🎯 키워드 기반 추천드릴게요!')
  ) {
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
    return true
  }

  // 종목 분석 응답의 다른 패턴들도 확인
  if (content.includes('위험도:') && content.includes('AI 분석 Tip')) {
    return true
  }

  // 종목 분석 응답의 다른 패턴들도 확인
  if (content.includes('위험도:') && content.includes('향후 전망')) {
    return true
  }

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
        return true
      }
    }

    // 텍스트와 JSON이 섞여있는 경우 JSON 부분만 확인
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0])
      if (jsonData.strategySummary && jsonData.riskPoint && jsonData.suggestion) {
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

// 자동 스크롤 함수
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTo({
        top: messageContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  })
}

// 메시지 필터링 및 최적화
const filteredMessages = computed(() => {
  return chatStore.messages.filter((msg) => !msg.isLoading)
})

// 메시지 변경 감지하여 자동 스크롤 (최적화)
watch(
  () => filteredMessages.value.length,
  () => {
    scrollToBottom()
  },
  { flush: 'post' }, // DOM 업데이트 후 실행
)

// 로딩 상태 변경 감지하여 자동 스크롤 (최적화)
watch(
  loading,
  (newLoading) => {
    if (newLoading) {
      scrollToBottom()
    }
  },
  { flush: 'post' },
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
    } catch (err) {
      console.error('사용자 정보 조회 실패:', err)
    }
  }
})

async function fetchGPT(prompt, explicitIntent = null) {
  loading.value = true

  // 사용자 메시지 즉시 추가
  const userMessage = {
    role: 'user',
    content: prompt,
    timestamp: new Date().toISOString(),
  }
  chatStore.messages.push(userMessage)
  scrollToBottom() // 즉시 스크롤

  // 로딩 메시지 즉시 표시 (즉시 응답 느낌)
  const loadingMessageId = Date.now()
  const loadingMessage = {
    id: loadingMessageId,
    role: 'bot',
    content: '답변을 준비하고 있어요...',
    timestamp: new Date().toISOString(),
    isLoading: true,
    type: 'loading', // 로딩 타입 추가
  }
  chatStore.messages.push(loadingMessage)
  scrollToBottom() // 즉시 스크롤

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
    const requestData = {
      userId: userId.value,
      sessionId: chatStore.sessionId,
      message: prompt,
      intentType: intentType,
    }

    const res = await axios.post('/api/chatbot/message', requestData)

    if (res?.data?.content) {
      // 로딩 메시지 제거하고 실제 응답으로 교체
      const messageIndex = chatStore.messages.findIndex((msg) => msg.id === loadingMessageId)
      if (messageIndex !== -1) {
        chatStore.messages[messageIndex] = {
          role: 'bot',
          content: res.data.content,
          requestedPeriod: res.data.requestedPeriod,
          intentType: intentType || res.data.intentType,
          timestamp: new Date().toISOString(),
        }
      }

      if (intentType === 'PORTFOLIO_ANALYZE') {
        chatStore.messages.push({
          role: 'bot',
          type: 'buttons',
          text: '분석이 완료되었습니다.\n다시 분석해보시겠어요?',
          buttons: [
            { label: '다시 분석하기', intent: 'REANALYZE_OPTIONS' },
            { label: '뒤로가기', intent: 'BACK_TO_MAIN' },
          ],
          timestamp: new Date().toISOString(),
        })
      }

      chatStore.sessionId = res.data.sessionId
      chatStore.intentType = res.data.intentType

      // 응답 완료 후 스크롤
      scrollToBottom()
    } else {
      // 로딩 메시지를 에러 메시지로 교체
      const messageIndex = chatStore.messages.findIndex((msg) => msg.id === loadingMessageId)
      if (messageIndex !== -1) {
        chatStore.messages[messageIndex] = {
          role: 'bot',
          content: '❌ GPT 응답이 비어 있습니다.',
          timestamp: new Date().toISOString(),
        }
      }
    }
  } catch (error) {
    // 로딩 메시지를 에러 메시지로 교체
    const messageIndex = chatStore.messages.findIndex((msg) => msg.id === loadingMessageId)
    if (messageIndex !== -1) {
      chatStore.messages[messageIndex] = {
        role: 'bot',
        content: '⚠️ 서버 오류가 발생했어요.',
        timestamp: new Date().toISOString(),
      }
    }
    console.error('GPT fetch 실패:', error)

    // 에러 발생 후 스크롤
    scrollToBottom()
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
            label: '🧠 내 성향 기반 추천 받아보기',
            intent: 'RECOMMEND_PROFILE',
            message: '내 투자 성향으로 종목 추천해줘',
          },
          { label: '🔙 뒤로가기', intent: 'RECOMMEND_SELECT' },
        ],
      })
      return
    }

    // 투자 성향 확인
    const risk = userStore.riskType
    if (!risk) {
      chatStore.messages.push({
        role: 'bot',
        content: '⚠️ 투자 성향 정보가 없습니다. 먼저 테스트를 진행해주세요.',
      })
      return
    }

    // 투자 성향 기반 추천 요청 - 더 명확한 메시지로
    const message = `나의 투자 성향인 ${risk}에 맞는 종목을 추천해줘`

    // 명시적으로 RECOMMEND_PROFILE 전달
    await fetchGPT(message, 'RECOMMEND_PROFILE')
    return
  }

  if (btn.intent === 'RECOMMEND_KEYWORD') {
    awaitingKeyword.value = true
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '추천을 원하는 키워드를 입력해주세요. 예: AI, 전기차, 반도체 등',
      buttons: [],
    })
    return
  }

  if (btn.intent === 'STOCK_ANALYZE') {
    awaitingStockAnalyze.value = true
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: '분석할 종목명을 입력해주세요. 예: 삼성전자, 네이버 등',
      buttons: [],
    })
    return
  }

  if (btn.intent === 'PORTFOLIO_ANALYZE') {
    if (!btn.message) {
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
    const message = btn.message ?? '내 포트폴리오 피드백 줘'
    await fetchGPT(message, btn.intent)
    return
  }

  if (btn.intent === 'REANALYZE_OPTIONS') {
    chatStore.clearMessages()
    chatStore.messages.push({
      role: 'bot',
      type: 'buttons',
      text: ' 다시 분석할 기간을 선택해주세요:',
      buttons: [
        {
          label: '1개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 1개월간의 포트폴리오 피드백 줘',
        },
        {
          label: ' 3개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 3개월간의 포트폴리오 피드백 줘',
        },
        {
          label: ' 6개월',
          intent: 'PORTFOLIO_ANALYZE',
          message: '최근 6개월간의 포트폴리오 피드백 줘',
        },
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
      buttons: [],
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
