<template>
  <div class="w-full bg-white rounded-2xl p-4 shadow-md text-black">
    <div class="flex justify-between items-center mb-3">
      <p class="text-sm font-semibold">내 투자 현황</p>
      <span class="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
        {{ trait }}
      </span>
    </div>

    <div class="flex justify-around text-center">
      <div>
        <p class="text-2xl font-bold text-blue-600">{{ rank }}위</p>
        <p class="text-sm text-gray-500">전체 순위</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-green-600">+{{ gainRate }}%</p>
        <p class="text-sm text-gray-500">총 수익률</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-blue-600">상위 {{ topPercent }}%</p>
        <p class="text-sm text-gray-500">백분위</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rank: Number,
    gainRate: Number,
    topPercent: Number,
    trait: String,
  },
}
</script>
