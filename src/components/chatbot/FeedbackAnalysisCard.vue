<template>
  <div class="space-y-4">
    <!-- 분석 기간 표시 -->
    <div v-if="feedbackData.periodDays" class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-4 border border-blue-200/30">
      <p class="text-base text-gray-700 font-semibold flex items-center">
        <span class="mr-2">📅</span>
        분석 기간: {{ feedbackData.startDate }} ~ {{ feedbackData.endDate }} ({{ feedbackData.periodDays }}일)
      </p>
    </div>

    <!-- 투자 전략 특징 -->
    <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40">
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
          <StrategyIcon class="text-white w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">투자 전략의 특징</h3>
      </div>
      <div class="space-y-3">
        <div class="flex items-start">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ feedbackData.strategySummary }}</p>
        </div>
      </div>
    </div>

    <!-- 리스크 및 개선점 -->
    <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40">
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-3">
          <RiskIcon class="text-white w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">리스크 및 개선점</h3>
      </div>
      <div class="space-y-3">
        <div class="flex items-start">
          <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ feedbackData.riskPoint }}</p>
        </div>
      </div>
    </div>

    <!-- 개인 맞춤 조언 -->
    <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40">
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
          <AdviceIcon class="text-white w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">개인 맞춤 조언</h3>
      </div>
      <div class="space-y-3">
        <div class="flex items-start">
          <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ feedbackData.suggestion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StrategyIcon from '../icons/StrategyIcon.vue'
import RiskIcon from '../icons/RiskIcon.vue'
import AdviceIcon from '../icons/AdviceIcon.vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

// JSON 데이터 파싱
const feedbackData = computed(() => {
  try {
    // JSON 형태인지 확인하고 파싱
    if (props.content.trim().startsWith('{')) {
      return JSON.parse(props.content)
    }
    
    // 텍스트와 JSON이 섞여있는 경우 JSON 부분만 추출
    const jsonMatch = props.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // 기존 텍스트 형태인 경우 fallback
    return {
      periodDays: null,
      startDate: null,
      endDate: null,
      strategySummary: '분석 데이터를 불러오는 중입니다.',
      riskPoint: '분석 데이터를 불러오는 중입니다.',
      suggestion: '분석 데이터를 불러오는 중입니다.'
    }
  } catch (error) {
    console.error('피드백 데이터 파싱 오류:', error)
    return {
      periodDays: null,
      startDate: null,
      endDate: null,
      strategySummary: '데이터 파싱 중 오류가 발생했습니다.',
      riskPoint: '데이터 파싱 중 오류가 발생했습니다.',
      suggestion: '데이터 파싱 중 오류가 발생했습니다.'
    }
  }
})
</script>
