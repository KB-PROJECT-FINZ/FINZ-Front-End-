<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-700 mb-3 font-medium">📈 키워드 기반 주식을 추천드릴게요!</p>
    <div class="grid gap-3">
      <div 
        v-for="stock in stocks" 
        :key="stock.code"
        class="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- 헤더 -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-gray-900 text-lg">{{ stock.name }}</h4>
            <span class="text-xs text-gray-500">{{ stock.code }}</span>
          </div>
          <span 
            :class="{
              'bg-green-100 text-green-800': stock.riskLevel === '낮음',
              'bg-yellow-100 text-yellow-800': stock.riskLevel === '중간',
              'bg-red-100 text-red-800': stock.riskLevel === '높음'
            }"
            class="px-2 py-1 text-xs rounded-full font-medium"
          >
            위험도: {{ stock.riskLevel }}
          </span>
        </div>

        <!-- 추천 이유 -->
        <div class="mb-3">
          <p class="text-sm text-gray-700" v-html="formatReason(stock.description)"></p>
        </div>

        <!-- 매수 타이밍 -->
        <div class="mb-3 p-3 bg-blue-50 rounded-lg">
          <h5 class="text-xs font-semibold text-blue-800 mb-1">💡 매수 타이밍</h5>
          <p class="text-xs text-blue-700">{{ stock.timingComment }}</p>
        </div>

        <!-- 향후 전망 -->
        <div class="p-3 bg-gray-50 rounded-lg">
          <h5 class="text-xs font-semibold text-gray-800 mb-1">🔮 향후 전망</h5>
          <p class="text-xs text-gray-600">{{ stock.futureOutlook }}</p>
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

// 종목명 매핑 (확장 가능)
const stockNames = {
  // 식품
  '097950': 'CJ제일제당',
  '280360': '롯데제과', 
  '004370': '농심',
  '007310': '오뚜기',
  // IT/반도체
  '005930': '삼성전자',
  '000660': 'SK하이닉스',
  '035420': 'NAVER',
  '035720': '카카오',
  // 자동차
  '005380': '현대차',
  '000270': '기아',
  // 바이오
  '207940': '삼성바이오로직스',
  '068270': '셀트리온',
  // 기타 - 종목코드가 매핑에 없으면 ticker 그대로 사용
}

// JSON 파싱 및 카드 데이터 변환
const stocks = computed(() => {
  // 1. JSON 형태 처리
  try {
    const analysisData = JSON.parse(props.content)
    
    return analysisData.map(stock => ({
      name: stockNames[stock.ticker] || stock.ticker,
      code: stock.ticker,
      description: stock.reason,
      riskLevel: stock.riskLevel,
      timingComment: stock.timingComment,
      futureOutlook: stock.futureOutlook
    }))
  } catch (error) {
    // JSON이 아닌 경우 텍스트 파싱 시도
  }

  // 2. 텍스트 형태 처리
  try {
    return parseTextToStocks(props.content)
  } catch (error) {
    console.error('텍스트 파싱 실패:', error)
    return []
  }
})

// 텍스트를 파싱해서 주식 카드 데이터로 변환
const parseTextToStocks = (text) => {
  // 텍스트가 유효하지 않으면 빈 배열 반환
  if (!text || typeof text !== 'string') {
    return []
  }

  const stocks = []
  
  // 종목별로 텍스트 분할
  const stockEntries = [
    { name: 'CJ제일제당', code: '097950' },
    { name: '삼양식품', code: '003230' },
    { name: '오뚜기', code: '007310' },
    { name: '롯데제과', code: '280360' },
    { name: '농심', code: '004370' },
    { name: '삼성전자', code: '005930' },
    { name: 'SK하이닉스', code: '000660' },
    { name: 'NAVER', code: '035420' },
    { name: '카카오', code: '035720' },
    { name: '현대차', code: '005380' },
    { name: '기아', code: '000270' }
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
  return reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
}
</script>