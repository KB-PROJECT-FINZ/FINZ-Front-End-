<template>
  <div class="space-y-4">
    <!-- 추천 타입 표시 -->
    <div class="bg-gray-100 rounded-2xl px-4 py-3">
      <p class="text-sm text-gray-700 font-medium">
        {{ getRecommendationType()
        }}{{ getRecommendationType() === '키워드 기반 추천' ? '드릴게요!' : '을 드릴게요!' }}
      </p>
    </div>

    <!-- 종목 카드들 -->
    <div class="space-y-4">
      <div
        v-for="stock in stocks"
        :key="stock.code"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
      >
        <!-- 헤더 -->
        <div class="flex justify-between items-start mb-3 gap-3">
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 text-lg break-words">{{ stock.name }}</h4>
            <span class="text-sm text-gray-500">{{ stock.code }}</span>
          </div>
          <span
            :class="{
              'bg-green-100 text-green-800': stock.riskLevel === '낮음',
              'bg-yellow-100 text-yellow-800': stock.riskLevel === '중간',
              'bg-red-100 text-red-800': stock.riskLevel === '높음',
            }"
            class="px-2 py-1 text-xs rounded-full font-medium min-w-[60px] text-center flex-shrink-0"
          >
            위험도: {{ stock.riskLevel }}
          </span>
        </div>

        <!-- 추천 이유 -->
        <div class="mb-3">
          <div
            class="text-sm text-gray-700 leading-relaxed"
            v-html="parseMarkdown(stock.description)"
          ></div>
        </div>

        <!-- AI 분석 Tip -->
        <div class="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <h5 class="text-sm font-medium text-blue-800 mb-1 flex items-center">
            <span class="mr-2">💡</span>AI 분석 Tip
          </h5>
          <div class="text-sm text-blue-700" v-html="parseMarkdown(stock.timingComment)"></div>
        </div>

        <!-- 향후 전망 -->
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <h5 class="text-sm font-medium text-gray-800 mb-1 flex items-center">
            <span class="mr-2">🔮</span>향후 전망
          </h5>
          <div class="text-sm text-gray-600" v-html="parseMarkdown(stock.futureOutlook)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

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

// 추천 타입 감지
const getRecommendationType = () => {
  // 메시지 앞부분의 안내 메시지를 기반으로 추천 타입 감지 (이모지 포함)
  if (props.content.startsWith('🧠 투자 성향 기반 추천드릴게요!')) {
    return '투자 성향 기반 추천'
  } else if (props.content.startsWith('🎯 키워드 기반 추천드릴게요!')) {
    return '키워드 기반 추천'
  }

  // 종목 분석 응답인지 먼저 확인
  if (
    props.content.includes('위험도:') &&
    props.content.includes('AI 분석 Tip') &&
    props.content.includes('향후 전망')
  ) {
    return '' // 종목 분석 응답은 추천 타입이 아님
  }

  // 종목명이 포함되어 있고 위험도가 포함된 경우도 확인
  if (
    props.content.includes('위험도:') &&
    (props.content.includes('테슬라') ||
      props.content.includes('TSLA') ||
      props.content.includes('삼성전자') ||
      props.content.includes('005930'))
  ) {
    return '' // 종목 분석 응답은 추천 타입이 아님
  }

  try {
    // 메시지 앞부분의 안내 메시지 제거
    let jsonContent = props.content

    // "🧠 투자 성향 기반 추천드릴게요!" 또는 "🎯 키워드 기반 추천드릴게요!" 제거
    if (jsonContent.startsWith('🧠 투자 성향 기반 추천드릴게요!')) {
      jsonContent = jsonContent.replace('🧠 투자 성향 기반 추천드릴게요!\n\n', '')
    } else if (jsonContent.startsWith('🎯 키워드 기반 추천드릴게요!')) {
      jsonContent = jsonContent.replace('🎯 키워드 기반 추천드릴게요!\n\n', '')
    }

    const analysisData = JSON.parse(jsonContent)
    // JSON 형태에서 추천 타입 감지
    if (analysisData && analysisData.length > 0) {
      const firstStock = analysisData[0]
      // reason 텍스트에 "투자 성향"이 포함되어 있으면 투자 성향 기반, 아니면 키워드 기반
      if (firstStock.reason && firstStock.reason.includes('투자 성향')) {
        return '투자 성향 기반 추천'
      } else {
        return '키워드 기반 추천'
      }
    }
  } catch (error) {
    // 텍스트 형태에서 추천 타입 감지
    if (props.content.includes('투자 성향') || props.content.includes('성향')) {
      return '투자 성향 기반 추천'
    } else {
      return '키워드 기반 추천'
    }
  }

  return '주식 추천'
}

// // reason 텍스트에서 종목 이름 추출
// const extractStockName = (reason) => {
//   if (!reason) return ''
//
//   // "종목명은" 또는 "종목명이" 패턴에서 종목명 추출
//   const match = reason.match(/^([가-힣A-Za-z]+)(은|는|이|가)/)
//   if (match) {
//     return match[1]
//   }
//
//   return ''
// }

// JSON 파싱 및 카드 데이터 변환
const stocks = computed(() => {
  try {
    // 메시지 앞부분의 안내 메시지 제거
    let jsonContent = props.content

    // "🧠 투자 성향 기반 추천드릴게요!" 또는 "🎯 키워드 기반 추천드릴게요!" 제거
    if (jsonContent.startsWith('🧠 투자 성향 기반 추천드릴게요!')) {
      jsonContent = jsonContent.replace('🧠 투자 성향 기반 추천드릴게요!\n\n', '')
    } else if (jsonContent.startsWith('🎯 키워드 기반 추천드릴게요!')) {
      jsonContent = jsonContent.replace('🎯 키워드 기반 추천드릴게요!\n\n', '')
    }

    const analysisData = JSON.parse(jsonContent)
    console.log('📊 JSON 파싱된 종목 데이터:', analysisData)
    return analysisData.map((stock) => ({
      name: stock.name || stock.ticker, // reason에서 종목명 추출
      code: stock.ticker,
      description: stock.reason || '',
      riskLevel: stock.riskLevel || '중간',
      timingComment: stock.timingComment || '추가 분석 필요',
      futureOutlook: stock.futureOutlook || '추가 분석 필요',
    }))
  } catch (error) {
    console.error('JSON 파싱 실패:', error)
    return []
  }
})

// 추천 이유에서 **텍스트** 를 굵게 표시
const formatReason = (reason) => {
  if (!reason) return ''
  return reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
}
</script>
