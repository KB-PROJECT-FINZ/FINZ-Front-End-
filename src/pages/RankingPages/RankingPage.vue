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
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="h-[3px]"></div>

    <!-- 3. 나의 랭킹 카드 -->
    <MyRankingCard
      v-if="myRanking"
      :rank="myRanking.rank"
      :gainRate="myRanking.gainRate"
      :topPercent="myRanking.topPercent"
      :trait="myRanking.trait"
    />

    <!-- 4. 인기 종목 Top5 -->
    <Top5StockList v-if="popularStocks.length" class="my-8" :stocks="popularStocks" />

    <!-- 5. 주간/성향별 탭 -->
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

    <!-- 6. 성향 버튼 (성향별일 때만) -->
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

    <!-- 7. 투자자 랭킹 리스트 -->
    <div class="space-y-3">
      <UserRankingCard
        v-for="(user, index) in limitedUsers"
        :key="user.userId"
        :rank="index + 1"
        :nickname="user.nickname"
        :gainRate="user.gainRate"
        :trait="user.trait || currentTraitType"
        :originalTrait="user.originalTrait || ''"
        :image="user.image || '/images/profile1.png'"
      />
    </div>

    <!-- 8. 더보기 버튼 -->
    <button
      v-if="visibleCount < 100 && visibleCount < filteredUsers.length"
      @click="visibleCount += 10"
      class="mt-4 w-full text-sm text-blue-600 hover:underline"
    >
      더보기
    </button>

    <!-- 9. 하단 내비게이션 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import MyRankingCard from '@/components/ranking/MyRankingCard.vue'
import Top5StockList from '@/components/ranking/Top5StockList.vue'
import UserRankingCard from '@/components/ranking/UserRankingCard.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'

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
const traitTypes = ['보수형', '균형형', '공격형', '특수형']
const currentTraitType = ref('')

// 월요일 계산 함수
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d
}

function formatDateToYYYYMMDD(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const today = new Date()
const monday = getMonday(today)
const recordDate = formatDateToYYYYMMDD(monday)

function selectMainRankingTab(tab) {
  currentRankingType.value = tab
  if (tab === '성향별') {
    currentTraitType.value = userTraitType.value
  }
}

function selectTraitType(trait) {
  currentTraitType.value = trait
}

const goBack = () => history.back()

onMounted(async () => {
  // 1. 내 랭킹 불러오기
  myRanking.value = await fetchMyRanking(recordDate)
  console.log('[디버그] 내 랭킹 응답:', myRanking.value)

  // ✅ 2. 성향 정보 localStorage에 무조건 저장 (기존 값 덮어쓰기)
  localStorage.setItem('userTraitType', myRanking.value?.trait || '미지정')

  // 3. 현재 성향 타입 초기화
  userTraitType.value = localStorage.getItem('userTraitType') || '미지정'
  currentTraitType.value = userTraitType.value

  // 4. 인기 종목 Top5 불러오기
  popularStocks.value = await fetchTop5Stocks(recordDate)

  // 5. 주간 랭킹 불러오기
  allUsers.value = await fetchWeeklyRanking()
})

// 성향별 탭 선택 시 다시 fetch
watch(currentRankingType, async (newType) => {
  if (newType === '성향별') {
    const groupRankings = await fetchGroupedWeeklyRanking()
    allUsers.value = groupRankings[currentTraitType.value] || []
  } else {
    allUsers.value = await fetchWeeklyRanking()
  }
})

// 성향 필터 바뀔 때도 다시 fetch
watch(currentTraitType, async (newTrait) => {
  if (currentRankingType.value === '성향별') {
    const groupRankings = await fetchGroupedWeeklyRanking()
    allUsers.value = groupRankings[newTrait] || []
  }
})

const filteredUsers = computed(() => allUsers.value)
const limitedUsers = computed(() => filteredUsers.value.slice(0, visibleCount.value))
</script>
