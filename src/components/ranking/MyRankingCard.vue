<template>
  <!-- 연한 파란색 배경 카드 -->
  <div class="w-full bg-blue-50 rounded-2xl p-4 shadow">
    <!-- 헤더: 제목 + 성향 pill -->
    <div class="flex items-start justify-between">
      <p class="text-sm text-gray-700">내 투자 현황</p>
      <span
        class="px-2 py-1 text-xs font-semibold rounded-md border border-blue-100 bg-white text-blue-700"
      >
        {{ trait || '미지정' }}
      </span>
    </div>

    <!-- 본문: 3칸 -->
    <div class="mt-4 grid grid-cols-3 gap-2 text-center">
      <!-- 전체 순위 -->
      <div class="bg-white rounded-xl p-3">
        <div class="text-[11px] text-gray-500">전체 순위</div>
        <div class="mt-1 text-lg font-bold text-gray-900 leading-tight">{{ rank ?? '-' }}위</div>
      </div>

      <!-- 총 수익률 -->
      <div class="bg-white rounded-xl p-3">
        <div class="text-[11px] text-gray-500">총 수익률</div>
        <div :class="rateClass" class="mt-1 text-lg font-bold leading-tight">
          {{ signedPercent(gainRate) }}
        </div>
      </div>

      <!-- 백분위 -->
      <div class="bg-white rounded-xl p-3">
        <div class="text-[11px] text-gray-500">백분위</div>
        <div class="mt-1 text-lg font-bold text-gray-900 leading-tight">
          상위 {{ topPercent ?? 0 }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rank: Number,
  gainRate: Number,
  topPercent: Number,
  trait: String,
})

const rateClass = computed(() => ((props.gainRate ?? 0) >= 0 ? 'text-red-500' : 'text-blue-600'))

function signedPercent(v) {
  if (v === null || v === undefined) return '-'
  const n = Number(v)
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
</script>
