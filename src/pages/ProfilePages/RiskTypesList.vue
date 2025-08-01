<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">투자 성향 목록</h1>
  </header>
  <div class="px-4 py-6">
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="type in riskTypes"
        :key="type.code"
        class="bg-white rounded-xl shadow flex flex-col items-center justify-center p-4 aspect-square cursor-pointer hover:bg-indigo-50 transition"
        @click="goToProfile(type.code, type.icon)"
      >
        <div class="text-3xl mb-2">{{ type.icon }}</div>
        <div class="font-bold text-indigo-700 text-lg mb-1">{{ type.code }}</div>
        <div class="text-gray-800 text-base">{{ type.nameKr }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const riskTypes = [
  { code: 'AGR', nameKr: '적극적 성장형', icon: '🚀' },
  { code: 'AID', nameKr: '적극적 안정형', icon: '🛡️' },
  { code: 'BGT', nameKr: '균형 잡힌 도전형', icon: '⚖️' },
  { code: 'BSS', nameKr: '균형 잡힌 수익 추구형', icon: '💰' },
  { code: 'CAG', nameKr: '신중한 성장형', icon: '🌱' },
  { code: 'CSD', nameKr: '신중한 안정형', icon: '🏡' },
  { code: 'DTA', nameKr: '단타 추구형', icon: '💨' },
  { code: 'EXP', nameKr: '실험적 모험가형', icon: '🧪' },
  { code: 'IND', nameKr: '인덱스 수동형', icon: '📊' },
  { code: 'INF', nameKr: '정보 수집형', icon: '🔎' },
  { code: 'SOC', nameKr: '사회 책임형', icon: '🌍' },
  { code: 'SYS', nameKr: '시스템 트레이더형', icon: '🖥️' },
  { code: 'TEC', nameKr: '기술적 분석형', icon: '📈' },
  { code: 'THE', nameKr: '테마 투자형', icon: '🎯' },
  { code: 'VAL', nameKr: '가치 투자형', icon: '🏆' },
]
function goBack() {
  router.back()
}
function goToProfile(code, icon) {
  router.push({
    name: 'RiskProfile',
    query: { code, icon },
  })
}
</script>
