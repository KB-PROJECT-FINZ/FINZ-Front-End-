<template>
  <div class="w-full bg-white rounded-xl p-4 shadow flex items-center gap-4">
    <!-- 순위 표시 -->
    <div class="text-lg font-bold w-10 text-center text-gray-700 whitespace-nowrap">
      {{ rank }}위
    </div>

    <!-- 프로필 이미지 -->
    <img
      :src="image || '/images/profile1.png'"
      alt="profile"
      class="w-10 h-10 rounded-full object-cover"
    />

    <!-- 닉네임 + 원래 성향 -->
    <div class="flex-1">
      <p class="text-sm font-bold">
        {{ nickname }}
        <span v-if="originalTrait" class="text-xs text-gray-500 ml-1">({{ originalTrait }})</span>
      </p>
      <span class="text-xs text-white px-2 py-0.5 rounded bg-purple-500">
        {{ trait }}
      </span>
    </div>

    <!-- 수익률 -->
    <p :class="gainRate > 0 ? 'text-red-500' : 'text-blue-500'" class="font-semibold text-lg">
      {{ gainRate > 0 ? '+' : '' }}{{ gainRate }}%
    </p>
  </div>
</template>
<script>
export default {
  props: {
    rank: {
      type: Number,
      default: null,
    },
    nickname: String,
    gainRate: Number,
    trait: String,
    originalTrait: String,
    image: String,
  },
}
</script>
