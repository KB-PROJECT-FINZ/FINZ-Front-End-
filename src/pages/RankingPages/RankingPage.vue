<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4">
    <!-- 1. 헤더 -->
    <div class="flex items-center justify-between py-4">
      <button @click="goBack" class="text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>
      <h1 class="text-lg font-bold text-center flex-1 -ml-6">랭킹</h1>
      <div class="w-6"></div>
    </div>

    <!-- 2. 상단 탭 -->
    <TabSwitcher
      :tabs="['투자 랭킹 보기', '종목 분석']"
      :currentTab="currentMainTab"
      @updateTab="updateMainTab"
    />

    <!-- 3. 투자 랭킹 보기 탭 -->
    <div v-if="currentMainTab === '투자 랭킹 보기'">
      <MyRankingCard :rank="15" :gainRate="12.45" :topPercent="25" trait="균형형" />
      <Top5StockList class="my-8" :stocks="popularStocks" />

      <!-- 4. 주간/성향별 버튼 -->
      <div class="flex gap-3 max-w-md mx-auto mt-6 mb-4">
        <button
          v-for="tab in mainRankingTabs"
          :key="tab"
          @click="selectMainRankingTab(tab)"
          :class="[
            'flex-1 py-2 rounded-md text-sm font-semibold transition',
            currentRankingType === tab
              ? 'bg-blue-600 text-white shadow'
              : 'bg-white text-gray-800 border border-gray-300 hover:bg-blue-100',
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- 5. 성향별 버튼 (성향별 선택 시만 표시) -->
      <div v-if="currentRankingType === '성향별'" class="flex gap-2 max-w-md mx-auto mb-4">
        <button
          v-for="trait in traitTypes"
          :key="trait"
          @click="selectTraitType(trait)"
          :class="[
            'flex-1 py-1.5 rounded-full text-xs font-medium transition',
            currentTraitType === trait
              ? 'bg-blue-600 text-white shadow'
              : userTraitType === trait
                ? 'border border-blue-500 text-blue-500 bg-white'
                : 'bg-gray-100 text-gray-800 hover:bg-blue-100',
          ]"
        >
          {{ trait }}
        </button>
      </div>

      <!-- 6. 투자자 랭킹 리스트 -->
      <div class="space-y-3">
        <UserRankingCard
          v-for="(user, index) in limitedUsers"
          :key="user.id"
          :nickname="user.nickname"
          :gainRate="user.gainRate"
          :trait="user.trait"
          :originalTrait="user.originalTrait"
          :image="user.image"
        />
      </div>

      <!-- 7. 더보기 버튼 -->
      <button
        v-if="visibleCount < 100 && visibleCount < filteredUsers.length"
        @click="visibleCount += 10"
        class="mt-4 w-full text-sm text-blue-600 hover:underline"
      >
        더보기
      </button>
    </div>

    <!-- 8. 종목 분석 탭 -->
    <div v-else-if="currentMainTab === '종목 분석'">
      <p class="mt-6 text-center text-gray-600">종목 분석 화면 준비 중입니다.</p>
    </div>

    <!-- 9. 하단 내비게이션 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import MyRankingCard from '@/components/MyRankingCard.vue'
import Top5StockList from '@/components/Top5StockList.vue'
import UserRankingCard from '@/components/UserRankingCard.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'

const goBack = () => {
  history.back()
}

const currentMainTab = ref('투자 랭킹 보기')
const updateMainTab = (tab) => {
  currentMainTab.value = tab
}

const mainRankingTabs = ['주간', '성향별']
const currentRankingType = ref('주간')
const traitTypes = ['보수형', '균형형', '공격형', '특수형']
const currentTraitType = ref(traitTypes[0])
const userTraitType = ref('보수형')

function selectMainRankingTab(tab) {
  currentRankingType.value = tab
  if (tab === '성향별') {
    currentTraitType.value = traitTypes[0]
  }
}

function selectTraitType(trait) {
  currentTraitType.value = trait
}

const popularStocks = [
  { name: '삼성전자', gain: -15.3, image: '/images/samsung.png' },
  { name: 'NVIDIA', gain: 28.7, image: '/images/nvidia.png' },
  { name: '카카오', gain: 12.5, image: '/images/kakao.png' },
  { name: '애플', gain: 7.2, image: '/images/apple.png' },
  { name: '테슬라', gain: -5.8, image: '/images/tesla.png' },
]

const users = ref(
  Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    nickname: `투자자${i + 1}`,
    gainRate: (Math.random() * 50).toFixed(2),
    trait: traitTypes[i % traitTypes.length],
    originalTrait: ['신중한 안정형', '균형 잡힌 수익 추구형', '적극적 성장형', '사회 책임형'][
      i % 4
    ],
    image: `/images/profile${(i % 5) + 1}.png`,
  })),
)

const filteredUsers = computed(() => {
  if (currentRankingType.value === '주간') return users.value
  return users.value.filter((u) => u.trait === currentTraitType.value)
})

const visibleCount = ref(10)
const limitedUsers = computed(() => filteredUsers.value.slice(0, visibleCount.value))
</script>

<style scoped></style>
