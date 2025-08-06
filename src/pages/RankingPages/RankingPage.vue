<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4">
    <!-- 1. 헤더 -->
    <div class="py-4 text-center">
      <h1 class="text-lg font-bold">랭킹</h1>
    </div>

    <!-- 2. 상단 탭 -->
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="h-[3px]"></div>

    <!-- 3. 인기 종목 Top5 -->
    <Top5StockList
      v-if="!isNoRankingData && popularStocks.length"
      class="my-6"
      :stocks="popularStocks"
    />

    <!-- 4. 주간 라벨 -->
    <div v-if="!isNoRankingData" class="text-center my-4">
      <p class="text-sm text-gray-500">🔥 {{ rankingDateRangeText }}</p>
      <p class="text-lg font-bold">나의 투자 성과는?</p>
    </div>

    <!-- 5. 랭킹 데이터 없을 때 안내 -->
    <!-- <NoRankingData v-if="isNoRankingData" /> -->

    <!-- 6. 나의 랭킹 카드 -->
    <MyRankingCard
      v-if="!isNoRankingData && myRanking"
      :rank="myRanking.rank"
      :gainRate="myRanking.gainRate"
      :topPercent="myRanking.topPercent"
      :trait="myRanking.trait"
    />

    <!-- 7. 주간/성향별 탭 -->
    <div v-if="!isNoRankingData" class="flex gap-3 max-w-md mx-auto mt-6 mb-4">
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

    <!-- 8. 성향 버튼 (성향별일 때만) -->
    <div
      v-if="!isNoRankingData && currentRankingType === '성향별'"
      class="flex gap-2 max-w-md mx-auto mb-4"
    >
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

    <!-- 9. 투자자 랭킹 리스트 -->
    <div v-if="!isNoRankingData" class="space-y-3">
      <UserRankingCard
        v-for="(user, index) in limitedUsers"
        :key="user.userId"
        :rank="user.ranking ?? index + 1"
        :nickname="user.nickname"
        :gainRate="user.gainRate"
        :trait="user.trait || currentTraitType"
        :originalTrait="user.originalTrait || ''"
        :image="user.image"
      />
    </div>

    <!-- 10. 더보기 버튼 -->
    <button
      v-if="!isNoRankingData && visibleCount < 100 && visibleCount < filteredUsers.length"
      @click="visibleCount += 10"
      class="mt-4 w-full text-sm text-blue-600 hover:underline"
    >
      더보기
    </button>

    <!-- 11. 하단 내비게이션 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import MyRankingCard from '@/components/ranking/MyRankingCard.vue'
import Top5StockList from '@/components/ranking/Top5StockList.vue'
import UserRankingCard from '@/components/ranking/UserRankingCard.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
// import NoRankingData from '@/components/ranking/NoRankingData.vue'
import {
  fetchMyRanking,
  fetchTop5Stocks,
  fetchWeeklyRanking,
  fetchGroupedWeeklyRanking,
} from '@/services/rankingService'

const userTraitType = ref(null)
const myRanking = ref(null)
const popularStocks = ref([])
const allUsers = ref([])
const visibleCount = ref(10)

const mainRankingTabs = ['주간', '성향별']
const currentRankingType = ref('주간')
const traitTypes = ['보수형', '균형형', '공격형', '특수형', '기타']
const currentTraitType = ref('')
const selectedBaseDate = ref('')

const isNoRankingData = computed(() => {
  return (
    !myRanking.value ||
    Object.keys(myRanking.value).length === 0 ||
    !allUsers.value ||
    allUsers.value.length === 0
  )
})

const rankingDateRangeText = computed(() => {
  if (!selectedBaseDate.value) return ''
  return fetchGroupedWeeklyRanking(selectedBaseDate.value)
})

async function loadRankingByDate(baseDate) {
  selectedBaseDate.value = baseDate
  myRanking.value = await fetchMyRanking(baseDate)
  popularStocks.value = await fetchTop5Stocks(baseDate)
  allUsers.value = []

  if (currentRankingType.value === '주간') {
    allUsers.value = await fetchWeeklyRanking(baseDate)
  } else if (currentRankingType.value === '성향별') {
    await loadGroupedRanking()
  }

  visibleCount.value = 10
  currentTraitType.value = userTraitType.value
}

async function loadGroupedRanking() {
  const groupRankings = await fetchGroupedWeeklyRanking(selectedBaseDate.value)
  allUsers.value = groupRankings[currentTraitType.value] || []
  visibleCount.value = 10
}

async function selectMainRankingTab(tab) {
  currentRankingType.value = tab
  if (tab === '성향별') {
    currentTraitType.value = userTraitType.value
    await loadGroupedRanking()
  } else {
    await loadRankingByDate(selectedBaseDate.value)
  }
}

async function selectTraitType(trait) {
  currentTraitType.value = trait
  await loadGroupedRanking()
}

onMounted(async () => {
  const initial = await fetchMyRanking()
  const baseDate = initial?.baseDate || ''
  selectedBaseDate.value = baseDate
  myRanking.value = initial
  localStorage.setItem('userTraitType', myRanking.value?.trait || '미지정')
  userTraitType.value = localStorage.getItem('userTraitType') || '미지정'
  currentTraitType.value = userTraitType.value
  await loadRankingByDate(baseDate)
})

const filteredUsers = computed(() => allUsers.value)
const limitedUsers = computed(() => filteredUsers.value.slice(0, visibleCount.value))
</script>
