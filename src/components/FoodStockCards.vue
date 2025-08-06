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
    console.error('JSON 파싱 실패:', error)
    return []
  }
})

// 추천 이유에서 **텍스트** 를 굵게 표시
const formatReason = (reason) => {
  return reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
}
</script>