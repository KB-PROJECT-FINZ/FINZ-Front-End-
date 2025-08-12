<template>
  <div class="space-y-4">
    <!-- 분석 결과 제목 -->
    <div class="bg-gray-100 rounded-2xl px-4 py-3">
      <p class="text-sm text-gray-700 font-medium">종목 분석 결과입니다</p>
    </div>

    <!-- 종목 분석 카드들 -->
    <div class="space-y-4">
      <div
        v-for="stock in stocks"
        :key="stock.ticker"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
      >
        <!-- 헤더 -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-semibold text-gray-900 text-lg">{{ stock.name }}</h4>
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

        <!-- 분석 이유 -->
        <div class="mb-3">
          <p class="text-sm text-gray-700 leading-relaxed">{{ stock.reason }}</p>
        </div>

        <!-- AI 분석 Tip -->
        <div class="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <h5 class="text-sm font-medium text-blue-800 mb-1 flex items-center">
            <span class="mr-2">💡</span>AI 분석 Tip
          </h5>
          <p class="text-sm text-blue-700">{{ stock.timingComment }}</p>
        </div>

        <!-- 향후 전망 -->
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <h5 class="text-sm font-medium text-gray-800 mb-1 flex items-center">
            <span class="mr-2">🔮</span>향후 전망
          </h5>
          <p class="text-sm text-gray-600">{{ stock.futureOutlook }}</p>
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

// 종목 데이터 파싱
const stocks = computed(() => {
  try {
    // "🔍 종목 분석 결과입니다." 부분을 제거하고 JSON만 파싱
    const jsonStart = props.content.indexOf('[')
    if (jsonStart === -1) return []

    const jsonContent = props.content.substring(jsonStart)
    const parsed = JSON.parse(jsonContent)

    if (Array.isArray(parsed)) {
      return parsed.map((stock) => ({
        name: extractStockName(stock.reason) || stock.ticker, // reason에서 종목명 추출
        code: stock.ticker,
        reason: stock.reason || '',
        riskLevel: stock.riskLevel || '중간',
        timingComment: stock.timingComment || '추가 분석 필요',
        futureOutlook: stock.futureOutlook || '추가 분석 필요',
      }))
    } else if (typeof parsed === 'object') {
      return [
        {
          name: extractStockName(parsed.reason) || parsed.ticker,
          code: parsed.ticker,
          reason: parsed.reason || '',
          riskLevel: parsed.riskLevel || '중간',
          timingComment: parsed.timingComment || '추가 분석 필요',
          futureOutlook: parsed.futureOutlook || '추가 분석 필요',
        },
      ]
    }
    return []
  } catch (error) {
    console.error('종목 분석 JSON 파싱 실패:', error)
    return []
  }
})

// reason 텍스트에서 종목 이름 추출
const extractStockName = (reason) => {
  if (!reason) return ''

  // "종목명은" 또는 "종목명이" 패턴에서 종목명 추출
  const match = reason.match(/^([가-힣A-Za-z]+)(은|는|이|가)/)
  if (match) {
    return match[1]
  }

  return ''
}

// 이유 텍스트 포맷팅 (강조 부분을 볼드 처리)
const formatReason = (reason) => {
  if (!reason) return ''
  return reason.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600">$1</strong>')
}
</script>
