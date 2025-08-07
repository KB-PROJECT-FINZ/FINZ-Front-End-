<template>
  <div class="w-full bg-white rounded-xl p-4 shadow flex items-center gap-4">
    <!-- 순위 표시 -->
    <div class="text-lg font-bold w-10 text-center text-gray-700 whitespace-nowrap">
      {{ rank !== null && rank !== undefined ? rank + '위' : '' }}
    </div>

    <!-- 프로필 이미지 또는 SVG 아이콘 -->
    <div
      class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
    >
      <img
        v-if="hasValidImage"
        :src="image"
        alt="profile"
        class="w-full h-full object-cover"
        @error="onImageError"
      />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        :class="['w-6 h-6', traitStrokeClass]"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </div>

    <!-- 닉네임 + 원래 성향 -->
    <div class="flex-1">
      <p class="text-sm font-bold">
        {{ nickname }}
        <span v-if="originalTrait" class="text-xs text-gray-500 ml-1">({{ originalTrait }})</span>
      </p>
      <span class="text-xs text-white px-2 py-0.5 rounded" :class="traitBgClass">
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
    rank: Number,
    nickname: String,
    gainRate: Number,
    trait: String,
    originalTrait: String,
    image: String,
  },
  data() {
    return {
      imageError: false, // 이미지 로드 실패 여부
    }
  },
  computed: {
    hasValidImage() {
      // 이미지가 없거나 에러가 난 경우 false 반환해서 SVG 보이도록
      return (
        this.image &&
        this.image !== 'null' &&
        this.image !== 'undefined' &&
        this.image.trim() !== '' &&
        !this.imageError
      )
    },
    traitStrokeClass() {
      switch (this.trait) {
        case '보수형':
          return 'stroke-blue-500'
        case '균형형':
          return 'stroke-green-500'
        case '공격형':
          return 'stroke-red-500'
        case '특수형':
          return 'stroke-purple-500'
        default:
          return 'stroke-gray-400'
      }
    },
    traitBgClass() {
      switch (this.trait) {
        case '보수형':
          return 'bg-blue-500'
        case '균형형':
          return 'bg-green-500'
        case '공격형':
          return 'bg-red-500'
        case '특수형':
          return 'bg-purple-500'
        default:
          return 'bg-gray-400'
      }
    },
  },
  methods: {
    onImageError() {
      this.imageError = true // 이미지 로딩 실패하면 에러 플래그 설정해서 fallback 보여줌
    },
  },
}
</script>
