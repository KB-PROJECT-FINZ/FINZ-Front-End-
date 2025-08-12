<template>
  <!-- 왕관이 밖으로 나와도 보이도록 overflow-visible -->
  <div
    class="w-full bg-white rounded-xl p-4 shadow flex items-center gap-4 relative overflow-visible"
  >
    <!-- 순위 + 왕관 기준점 -->
    <div class="relative w-12 text-center">
      <!-- 👑 1위 왕관: '1위' 바로 위 중앙, 크게 -->
      <img
        v-if="rank === 1"
        :src="crownIcon"
        alt="crown"
        class="absolute -top-8 left-[18px] w-18 h-18 z-10"
      />
      <div class="text-lg font-bold text-gray-700 whitespace-nowrap">
        {{ rank !== null && rank !== undefined ? rank + '위' : '' }}
      </div>
    </div>

    <!-- 프로필 -->
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

    <!-- 닉네임 + 원래 성향 (그대로 유지) -->
    <div class="flex-1">
      <p class="text-sm font-bold">
        {{ nickname }}
        <span class="text-gray-500">
          ( {{ originalTraitToKor[originalTrait] || originalTrait }} )
        </span>
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
import crownIcon from '@/assets/crown.svg'

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
      crownIcon,
      imageError: false,
      originalTraitToKor: {
        AGR: '적극적 성장형',
        AID: '적극적 안정형',
        BGT: '균형 잡힌 도전형',
        BSS: '균형 잡힌 수익 추구형',
        CAG: '신중한 성장형',
        CSD: '신중한 안정형',
        DTA: '단타 추구형',
        EXP: '실험적 모험가형',
        IND: '인덱스 수동형',
        INF: '정보 수집형',
        SOC: '사회 책임형',
        SYS: '시스템 트레이더형',
        TEC: '기술적 분석형',
        THE: '테마 투자형',
        VAL: '가치 투자형',
      },
    }
  },
  computed: {
    hasValidImage() {
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
      this.imageError = true
    },
  },
}
</script>
