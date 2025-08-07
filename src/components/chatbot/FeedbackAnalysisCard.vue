<template>
  <div class="space-y-4">
    <!-- 분석 기간 표시 -->
    <div v-if="analysisPeriod" class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-4 border border-blue-200/30">
      <p class="text-base text-gray-700 font-semibold flex items-center">
        <span class="mr-2">📅</span>
        사용자 지정 분석 기간: {{ analysisPeriod }}일
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
        <div v-for="(feature, index) in investmentFeatures" :key="index" class="flex items-start">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ feature }}</p>
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
        <div v-for="(risk, index) in riskPoints" :key="index" class="flex items-start">
          <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ risk }}</p>
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
        <div v-for="(advice, index) in personalAdvice" :key="index" class="flex items-start">
          <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p class="text-gray-700 leading-relaxed">{{ advice }}</p>
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

// 분석 기간 추출
const analysisPeriod = computed(() => {
  const match = props.content.match(/사용자 지정 분석 기간: (\d+)일/)
  return match ? match[1] : null
})

// 투자 전략 특징 추출
const investmentFeatures = computed(() => {
  const features = []
  const lines = props.content.split('\n')
  let inFeatures = false
  
  for (const line of lines) {
    if (line.includes('1. 투자 전략의 특징:')) {
      inFeatures = true
      continue
    }
    if (line.includes('2. 리스크 및 개선점:')) {
      break
    }
    if (inFeatures && line.trim() && line.includes('-')) {
      features.push(line.trim().replace(/^-\s*/, ''))
    }
  }
  
  return features
})

// 리스크 및 개선점 추출
const riskPoints = computed(() => {
  const risks = []
  const lines = props.content.split('\n')
  let inRisks = false
  
  for (const line of lines) {
    if (line.includes('2. 리스크 및 개선점:')) {
      inRisks = true
      continue
    }
    if (line.includes('3. 개인 맞춤 조언:')) {
      break
    }
    if (inRisks && line.trim() && line.includes('-')) {
      risks.push(line.trim().replace(/^-\s*/, ''))
    }
  }
  
  return risks
})

// 개인 맞춤 조언 추출
const personalAdvice = computed(() => {
  const advice = []
  const lines = props.content.split('\n')
  let inAdvice = false
  
  for (const line of lines) {
    if (line.includes('3. 개인 맞춤 조언:')) {
      inAdvice = true
      continue
    }
    if (inAdvice && line.trim() && line.includes('-')) {
      advice.push(line.trim().replace(/^-\s*/, ''))
    }
  }
  
  return advice
})
</script>
