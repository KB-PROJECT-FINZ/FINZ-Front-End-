<template>
  <div class="w-full bg-white rounded-xl p-4 shadow flex items-center gap-4">
    <!-- 프로필 이미지 -->
    <img :src="image" alt="profile" class="w-10 h-10 rounded-full object-cover" />

    <!-- 닉네임 + 원래 성향 -->
    <div class="flex-1">
      <p class="text-sm font-bold">
        {{ nickname }}
        <span class="text-xs text-gray-500 ml-1">({{ originalTrait }})</span>
      </p>
      <span class="text-xs text-white px-2 py-0.5 rounded bg-purple-500">
        {{ trait }}
      </span>
    </div>

    <!-- 수익률 -->
    <p class="text-red-500 font-semibold text-lg">+{{ gainRate }}%</p>
  </div>
</template>

<script>
export default {
  props: {
    nickname: String,
    gainRate: Number,
    trait: String, // 대분류 (보수형 등)
    originalTrait: String, // 실제 성향 (신중한 안정형 등)
    image: String,
  },
}
</script>
