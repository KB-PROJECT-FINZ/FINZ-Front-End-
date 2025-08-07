<template>
  <div class="space-y-4">
    <div
      class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-4 border border-blue-200/30"
    >
      <p class="text-base text-gray-700 font-semibold">
        📈 {{ getRecommendationType() }}을 추천드릴게요!
      </p>
    </div>
    <div class="grid gap-4">
      <div
        v-for="stock in stocks"
        :key="stock.code"
        class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40 transform hover:-translate-y-1"
      >
        <!-- 헤더 -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-bold text-gray-900 text-xl">{{ stock.name }}</h4>
            <span class="text-sm text-gray-500 font-medium">{{ stock.code }}</span>
          </div>
          <span
            :class="{
              'bg-gradient-to-r from-green-400 to-emerald-500 text-white':
                stock.riskLevel === '낮음',
              'bg-gradient-to-r from-yellow-400 to-orange-500 text-white':
                stock.riskLevel === '중간',
              'bg-gradient-to-r from-red-400 to-pink-500 text-white': stock.riskLevel === '높음',
            }"
            class="px-3 py-1 text-xs rounded-full font-semibold shadow-sm"
          >
            위험도: {{ stock.riskLevel }}
          </span>
        </div>

        <!-- 추천 이유 -->
        <div class="mb-4">
          <p
            class="text-sm text-gray-700 leading-relaxed"
            v-html="formatReason(stock.description)"
          ></p>
        </div>

        <!-- 매수 타이밍 -->
        <div
          class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30"
        >
          <h5 class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <span class="mr-2">💡</span>AI 분석 Tip
          </h5>
          <p class="text-sm text-blue-700">{{ stock.timingComment }}</p>
        </div>

        <!-- 향후 전망 -->
        <div
          class="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200/30"
        >
          <h5 class="text-sm font-semibold text-gray-800 mb-2 flex items-center">
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

// 추천 타입 감지
const getRecommendationType = () => {
  try {
    const analysisData = JSON.parse(props.content)
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

// JSON 파싱 및 카드 데이터 변환
const stocks = computed(() => {
  try {
    const analysisData = JSON.parse(props.content)
    console.log('📊 JSON 파싱된 종목 데이터:', analysisData)

    return analysisData.map((stock) => ({
      name: extractStockName(stock.reason) || stock.ticker, // reason에서 종목명 추출
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
