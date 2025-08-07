<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-4 border border-blue-200/30">
      <p class="text-base text-gray-700 font-semibold">📈 키워드 기반 주식을 추천드릴게요!</p>
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
              'bg-gradient-to-r from-green-400 to-emerald-500 text-white': stock.riskLevel === '낮음',
              'bg-gradient-to-r from-yellow-400 to-orange-500 text-white': stock.riskLevel === '중간',
              'bg-gradient-to-r from-red-400 to-pink-500 text-white': stock.riskLevel === '높음'
            }"
            class="px-3 py-1 text-xs rounded-full font-semibold shadow-sm"
          >
            위험도: {{ stock.riskLevel }}
          </span>
        </div>

        <!-- 추천 이유 -->
        <div class="mb-4">
          <p class="text-sm text-gray-700 leading-relaxed" v-html="formatReason(stock.description)"></p>
        </div>

        <!-- 매수 타이밍 -->
        <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30">
          <h5 class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <span class="mr-2">💡</span>매수 타이밍
          </h5>
          <p class="text-sm text-blue-700">{{ stock.timingComment }}</p>
        </div>

        <!-- 향후 전망 -->
        <div class="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200/30">
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
    required: true
  }
})

// JSON 파싱 및 카드 데이터 변환 (개선된 버전)
const stocks = computed(() => {
  // 1. JSON 형태 처리
  try {
    const analysisData = JSON.parse(props.content)
    console.log('📊 JSON 파싱된 종목 데이터:', analysisData)
    
    // 백엔드에서 제공하는 구조화된 데이터 사용
    return analysisData.map(stock => ({
      name: stock.name || stock.ticker, // 백엔드에서 name 제공
      code: stock.ticker,
      description: stock.reason,
      riskLevel: stock.riskLevel || '중간',
      timingComment: stock.timingComment || '추가 분석 필요',
      futureOutlook: stock.futureOutlook || '추가 분석 필요'
    }))
  } catch (error) {
    console.log('📝 JSON 파싱 실패, 텍스트 파싱 시도:', error)
  }

  // 2. 텍스트 형태 처리 (기존 방식 유지)
  try {
    return parseTextToStocks(props.content)
  } catch (error) {
    console.error('텍스트 파싱 실패:', error)
    return []
  }
})

// 텍스트를 파싱해서 주식 카드 데이터로 변환
const parseTextToStocks = (text) => {
  if (!text || typeof text !== 'string') {
    return []
  }

  const stocks = []
  
  // 종목별로 텍스트 분할
  const stockEntries = [
    // 식품
    { name: 'CJ제일제당', code: '097950' },
    { name: '삼양식품', code: '003230' },
    { name: '오뚜기', code: '007310' },
    { name: '롯데제과', code: '280360' },
    { name: '농심', code: '004370' },
    // IT/반도체
    { name: '삼성전자', code: '005930' },
    { name: 'SK하이닉스', code: '000660' },
    { name: 'NAVER', code: '035420' },
    { name: '카카오', code: '035720' },
    { name: '넵튠', code: '217270' },
    { name: '한국정보인증', code: '053300' },
    // 자동차
    { name: '현대차', code: '005380' },
    { name: '기아', code: '000270' },
    // 바이오
    { name: '삼성바이오로직스', code: '207940' },
    { name: '셀트리온', code: '068270' },
    // 기타
    { name: 'LG화학', code: '051910' },
    { name: 'POSCO', code: '005490' },
    { name: 'SK이노베이션', code: '096770' },
    { name: '포스코', code: '005490' }
  ]
  
  stockEntries.forEach(stock => {
    if (text.includes(stock.name)) {
      // 해당 종목 관련 텍스트 추출
      const sentences = text.split(/[.。]/);
      const relatedSentences = sentences.filter(sentence => 
        sentence && sentence.includes(stock.name)
      ).join('. ').trim()
      
      if (relatedSentences) {
        stocks.push({
          name: stock.name,
          code: stock.code,
          description: relatedSentences,
          riskLevel: extractRiskLevel(relatedSentences),
          timingComment: '텍스트 기반 분석으로 구체적인 타이밍 정보는 제공되지 않습니다.',
          futureOutlook: '추가적인 분석이 필요합니다.'
        })
      }
    }
  })
  
  return stocks
}

// 텍스트에서 위험도 추출 (간단한 키워드 기반)
const extractRiskLevel = (text) => {
  if (!text || typeof text !== 'string') return '중간'
  
  if (text.includes('안정적') && text.includes('성장')) return '낮음'
  if (text.includes('성장 가능성') || text.includes('투자 매력')) return '중간'
  if (text.includes('고위험') || text.includes('변동성')) return '높음'
  return '중간' // 기본값
}

// 추천 이유에서 **텍스트** 를 굵게 표시
const formatReason = (reason) => {
  if (!reason) return ''
  return reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
}
</script>