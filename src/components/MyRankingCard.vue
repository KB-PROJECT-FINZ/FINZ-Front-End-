<template>
  <div
    class="w-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl p-4 shadow-md"
  >
    <!-- 상단: 타이틀과 성향 -->
    <div class="flex justify-between items-start">
      <p class="text-sm">내 투자 현황</p>
      <span class="bg-white text-blue-600 text-xs px-2 py-1 rounded-md font-semibold">
        {{ trait || '미지정' }}
      </span>
    </div>

    <!-- 본문 -->
    <div class="mt-4 flex justify-around text-center">
      <div>
        <div class="text-2xl font-bold">{{ rank ?? '-' }}위</div>
        <div class="text-sm">전체 순위</div>
      </div>
      <div>
        <div class="text-green-200 text-lg font-semibold">
          {{ gainRate >= 0 ? '+' : '' }}{{ gainRate ?? 0 }}%
        </div>
        <div class="text-sm">총 수익률</div>
      </div>
      <div>
        <div class="text-sm">상위 {{ topPercent ?? 0 }}%</div>
        <div class="text-sm">백분위</div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  rank: Number,
  gainRate: Number,
  topPercent: Number,
  trait: String,
})
</script>
