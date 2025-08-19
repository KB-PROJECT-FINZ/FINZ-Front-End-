<template>
  <div
    class="w-full bg-white rounded-xl p-4 shadow flex items-center gap-3 relative overflow-visible"
  >
    <!-- 순위 + 왕관 -->
    <div class="relative w-12 text-center">
      <img
        v-if="rank === 1"
        :src="crownIcon"
        alt="crown"
        class="absolute -top-6 left-4 w-10 h-10 z-10"
      />
      <div class="text-lg font-bold text-gray-700 whitespace-nowrap">
        {{ rank !== null && rank !== undefined ? rank + '위' : '' }}
      </div>
    </div>

    <!-- 프로필 -->
    <div
      class="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-white ring-1 ring-gray-200 shadow-sm ml-[-2px]"
    >
      <img
        v-if="hasValidImage"
        :src="imgSrc"
        alt="profile"
        class="w-full h-full object-contain p-1.5"
        @error="onImageError"
      />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.6"
        class="w-6 h-6 stroke-gray-500"
        aria-label="기본 아이콘"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </div>

    <!-- 닉네임/성향 -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold truncate">
        {{ nickname }}
        <span v-if="originalTrait" class="text-gray-500">
          ( {{ originalTraitToKor[originalTrait] || originalTrait }} )
        </span>
      </p>
      <!-- 배경은 연한 성향 색상, 테두리 없음 -->
      <span class="text-xs px-2 py-0.5 rounded mt-0.5 inline-block" :class="traitBadgeClass">
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

import img1 from '@/assets/finz.png'
import img2 from '@/assets/ProfilePage/FINZ_고양이.png'
import img3 from '@/assets/ProfilePage/FINZ_곰.png'
import img4 from '@/assets/ProfilePage/FINZ_병아리.png'
import img5 from '@/assets/ProfilePage/FINZ_원숭이.png'
import img6 from '@/assets/ProfilePage/FINZ_코끼리.png'
import img7 from '@/assets/ProfilePage/FINZ_토끼.png'

const PROFILE_IMAGES = [img1, img2, img3, img4, img5, img6, img7]
function resolveProfileImage(idOrStr) {
  if (idOrStr === null || idOrStr === undefined) return null
  const num = typeof idOrStr === 'string' ? parseInt(idOrStr, 10) : idOrStr
  if (!Number.isNaN(num) && num >= 1 && num <= PROFILE_IMAGES.length) return PROFILE_IMAGES[num - 1]
  return null
}

export default {
  props: {
    rank: Number,
    nickname: String,
    gainRate: Number,
    trait: String,
    originalTrait: { type: String, default: '' },
    profileImage: { type: [Number, String, null], default: null },
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
    imgSrc() {
      return resolveProfileImage(this.profileImage)
    },
    hasValidImage() {
      return !!this.imgSrc && !this.imageError
    },
    traitBadgeClass() {
      switch (this.trait) {
        case '보수형':
          return 'bg-blue-100 text-blue-700'
        case '균형형':
          return 'bg-green-100 text-green-700'
        case '공격형':
          return 'bg-red-100 text-red-700'
        case '특수형':
          return 'bg-purple-100 text-purple-700'
        default:
          return 'bg-gray-100 text-gray-700'
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
