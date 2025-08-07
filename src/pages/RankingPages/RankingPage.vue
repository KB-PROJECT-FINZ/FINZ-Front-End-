<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4">
    <!-- 헤더 -->
    <div class="py-4 text-center">
      <h1 class="text-lg font-bold">랭킹</h1>
    </div>

    <!-- 상단 탭 -->
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="h-[3px]"></div>

    <!-- 인기 종목 Top10 -->
    <div class="mb-6">
      <Top10StockList v-if="stocks.length" :stocks="stocks" :isRealtime="true" />
    </div>

    <!-- 랭킹 날짜 및 내 성과 -->
    <div class="text-center my-4">
      <p class="text-sm text-gray-500">🔥 {{ rankingDateRangeText }}</p>
      <p class="text-lg font-bold">나의 투자 성과는?</p>
    </div>

    <!-- 내 랭킹 카드 -->
    <MyRankingCard
      v-if="myRanking && myRanking.rank !== undefined"
      :rank="myRanking.rank"
      :gainRate="myRanking.gainRate"
      :topPercent="myRanking.topPercent"
      :trait="myRanking.trait"
    />

    <!-- 주간/성향별 탭 -->
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

    <!-- 성향별 버튼 -->
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

    <!-- 투자자 랭킹 리스트 -->
    <div class="space-y-3">
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

    <!-- 더보기 -->
    <button
      v-if="visibleCount < 100 && visibleCount < filteredUsers.length"
      @click="visibleCount += 10"
      class="mt-4 w-full text-sm text-blue-600 hover:underline"
    >
      더보기
    </button>

    <!-- 하단 내비게이션 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'
import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import MyRankingCard from '@/components/ranking/MyRankingCard.vue'
import Top10StockList from '@/components/ranking/Top10StockList.vue'
import UserRankingCard from '@/components/ranking/UserRankingCard.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
import {
  fetchMyRanking,
  fetchTop10Stocks,
  fetchTop10StocksRealtime,
  fetchWeeklyRanking,
  fetchGroupedWeeklyRanking,
  getRankingWeekLabel,
} from '@/services/rankingService'

const traitGroupToKor = {
  AGGRESSIVE: '공격형',
  BALANCED: '균형형',
  CONSERVATIVE: '보수형',
  ANALYTICAL: '특수형',
  EMOTIONAL: '기타',
}
const originalTraitToGroup = {
  '적극적 성장형': 'AGGRESSIVE',
  '적극적 안정형': 'BALANCED',
  '균형 잡힌 도전형': 'BALANCED',
  '균형 잡힌 수익 추구형': 'BALANCED',
  '신중한 성장형': 'CONSERVATIVE',
  '신중한 안정형': 'CONSERVATIVE',
  '단타 추구형': 'AGGRESSIVE',
  '실험적 모험가형': 'AGGRESSIVE',
  '인덱스 수동형': 'CONSERVATIVE',
  '정보 수집형': 'ANALYTICAL',
  '사회 책임형': 'EMOTIONAL',
  '시스템 트레이더형': 'ANALYTICAL',
  '기술적 분석형': 'ANALYTICAL',
  '테마 투자형': 'AGGRESSIVE',
  '가치 투자형': 'CONSERVATIVE',
}

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const userTraitType = ref(null)
const myRanking = ref(null)
const selectedBaseDate = ref('')
const popularStocksRealtime = ref([])
const popularStocksLastWeek = ref([])
const allUsers = ref([])
const visibleCount = ref(10)
const mainRankingTabs = ['주간', '성향별']
const currentRankingType = ref('주간')
const traitTypes = ['보수형', '균형형', '공격형', '특수형', '기타']
const currentTraitType = ref('')

const traitCodeMap = {
  보수형: 'CONSERVATIVE',
  균형형: 'BALANCED',
  공격형: 'AGGRESSIVE',
  특수형: 'ANALYTICAL',
  기타: 'EMOTIONAL',
}

const stocks = computed(() =>
  popularStocksRealtime.value.length > 0
    ? popularStocksRealtime.value
    : popularStocksLastWeek.value,
)

const rankingDateRangeText = computed(() => {
  if (!selectedBaseDate.value) return ''
  return getRankingWeekLabel(selectedBaseDate.value)
})

const filteredUsers = computed(() => allUsers.value)
const limitedUsers = computed(() => filteredUsers.value.slice(0, visibleCount.value))

async function loadRankingByDate(baseDate) {
  selectedBaseDate.value = baseDate
  popularStocksLastWeek.value = await fetchTop10Stocks(baseDate)

  if (currentRankingType.value === '주간') {
    const users = await fetchWeeklyRanking(baseDate)
    allUsers.value = users.map((user) => {
      let traitCode = user.trait
      if (!traitCode && user.originalTrait) {
        traitCode = originalTraitToGroup[user.originalTrait] || 'EMOTIONAL'
      }
      const traitKor = traitGroupToKor[traitCode] || '기타'
      return { ...user, trait: traitKor }
    })
  } else {
    await loadGroupedRanking()
  }
  visibleCount.value = 10
}

async function loadGroupedRanking() {
  const grouped = await fetchGroupedWeeklyRanking(selectedBaseDate.value)
  const groupKey = traitCodeMap[currentTraitType.value] || 'EMOTIONAL'
  allUsers.value = (grouped[groupKey] || []).map((user) => {
    const traitCode = user.trait || originalTraitToGroup[user.originalTrait] || 'EMOTIONAL'
    const traitKor = traitGroupToKor[traitCode] || '기타'
    return { ...user, trait: traitKor }
  })
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

;(async () => {
  try {
    const my = await fetchMyRanking(userId.value, null)
    if (!my) return
    selectedBaseDate.value = my.baseDate
    myRanking.value = my
    userTraitType.value = my.trait

    popularStocksRealtime.value = await fetchTop10StocksRealtime()
    popularStocksLastWeek.value = await fetchTop10Stocks(my.baseDate)

    await loadRankingByDate(my.baseDate)
    currentTraitType.value = userTraitType.value || traitTypes[0]
  } catch (error) {
    console.error('❌ 초기 데이터 로딩 에러:', error)
  }
})()
</script>
