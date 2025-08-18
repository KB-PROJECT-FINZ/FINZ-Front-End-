<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4 overflow-x-hidden">
    <div class="mt-6"></div>
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="mt-3"></div>

    <div class="mt-3 mb-6">
      <div class="w-full max-w-[480px] mx-auto">
        <Top10StockList v-if="stocks.length" :stocks="stocks" :isRealtime="true" />
      </div>
    </div>

    <div class="text-center my-4">
      <p class="text-sm font-bold text-gray-500">{{ rankingDateRangeText }}</p>

      <p class="text-lg font-bold">투자 성과는?</p>
    </div>

    <MyRankingCard
      v-if="myRanking && myRanking.rank !== undefined"
      :rank="myRanking.rank"
      :gainRate="myRanking.gainRate"
      :topPercent="myRanking.topPercent"
      :trait="myRanking.trait"
    />

    <!-- 주간/성향별 탭 -->
    <div class="relative w-full max-w-[480px] mx-auto mt-6 mb-2">
      <div class="grid grid-cols-2 text-center text-sm font-semibold">
        <button
          v-for="tab in mainRankingTabs"
          :key="tab"
          @click="selectMainRankingTab(tab)"
          class="py-2 transition-colors"
          :class="
            currentRankingType === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          "
        >
          {{ tab }}
        </button>
      </div>
      <div class="border-b border-gray-200"></div>
      <div
        class="absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-transform duration-300"
        :style="{
          width: 100 / mainRankingTabs.length + '%',
          transform: `translateX(${activeMainIndex * 100}%)`,
        }"
      />
    </div>

    <!-- 성향별 버튼 -->
    <div
      v-if="currentRankingType === '성향별'"
      class="flex gap-2 w-full max-w-[480px] mx-auto mb-4"
    >
      <button
        v-for="trait in traitTypes"
        :key="trait"
        @click="selectTraitType(trait)"
        :class="[
          'flex-1 py-1.5 rounded-full text-xs font-medium transition',
          currentTraitType === trait
            ? 'bg-blue-600 text-white shadow'
            : 'bg-gray-100 text-gray-800 hover:bg-blue-100',
        ]"
      >
        {{ trait }}
      </button>
    </div>

    <!-- 랭킹 리스트 -->
    <div class="space-y-3">
      <UserRankingCard
        v-for="(user, index) in limitedUsers"
        :key="user.userId"
        :rank="user.ranking ?? index + 1"
        :nickname="user.nickname"
        :gainRate="user.gainRate"
        :trait="user.trait"
        :originalTrait="user.originalTrait || ''"
        :profileImage="user.profileImage"
      />
    </div>

    <button
      v-if="visibleCount < 100 && visibleCount < filteredUsers.length"
      @click="visibleCount += 10"
      class="mt-4 w-full text-sm text-blue-600 hover:underline"
    >
      더보기
    </button>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

/** 그룹코드 → 한글 라벨 */
const traitGroupToKor = {
  AGGRESSIVE: '공격형',
  BALANCED: '균형형',
  CONSERVATIVE: '보수형',
  ANALYTICAL: '특수형',
  EMOTIONAL: '기타',
}
/** 세부 코드 → 한글 라벨 */
const originalTraitKo = {
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
}
const originalToGroupKey = {
  AGR: 'AGGRESSIVE',
  DTA: 'AGGRESSIVE',
  EXP: 'AGGRESSIVE',
  THE: 'AGGRESSIVE',
  AID: 'BALANCED',
  BGT: 'BALANCED',
  BSS: 'BALANCED',
  CAG: 'CONSERVATIVE',
  CSD: 'CONSERVATIVE',
  IND: 'CONSERVATIVE',
  VAL: 'CONSERVATIVE',
  INF: 'ANALYTICAL',
  SYS: 'ANALYTICAL',
  TEC: 'ANALYTICAL',
  SOC: 'EMOTIONAL',
}
const traitCodeMap = {
  보수형: 'CONSERVATIVE',
  균형형: 'BALANCED',
  공격형: 'AGGRESSIVE',
  특수형: 'ANALYTICAL',
  기타: 'EMOTIONAL',
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

const activeMainIndex = computed(() =>
  Math.max(0, mainRankingTabs.indexOf(currentRankingType.value)),
)

const fallbackDate = (() => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1 - 7)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().substring(0, 10)
})()

const stocks = computed(() =>
  popularStocksRealtime.value.length > 0
    ? popularStocksRealtime.value
    : popularStocksLastWeek.value,
)

const rankingDateRangeText = computed(() =>
  selectedBaseDate.value ? getRankingWeekLabel(selectedBaseDate.value) : '',
)

const filteredUsers = computed(() => allUsers.value)
const limitedUsers = computed(() => filteredUsers.value.slice(0, visibleCount.value))

function sortUsers(list) {
  return [...list].sort((a, b) => {
    const ra = a.ranking ?? Infinity
    const rb = b.ranking ?? Infinity
    if (ra !== rb) return ra - rb
    const ga = Number(a.gainRate ?? 0)
    const gb = Number(b.gainRate ?? 0)
    return gb - ga
  })
}

/** 주간 랭킹 */
async function loadRankingByDate(baseDate) {
  selectedBaseDate.value = baseDate
  popularStocksLastWeek.value = await fetchTop10Stocks(baseDate)

  if (currentRankingType.value === '주간') {
    const users = await fetchWeeklyRanking(baseDate)
    const mapped = users.map((u) => {
      const groupCode =
        (u.trait || '').toUpperCase() ||
        (u.originalTrait ? originalToGroupKey[u.originalTrait] : '')
      return {
        ...u,
        trait: traitGroupToKor[groupCode] || '기타',
        originalTrait: u.originalTrait ? originalTraitKo[u.originalTrait] || u.originalTrait : '',
      }
    })
    allUsers.value = sortUsers(mapped)
  } else {
    await loadGroupedRanking()
  }
  visibleCount.value = 10
}

/** 성향별 랭킹 (선택 그룹만) */
async function loadGroupedRanking() {
  const grouped = await fetchGroupedWeeklyRanking(selectedBaseDate.value)
  const groupKey = traitCodeMap[currentTraitType.value] || 'EMOTIONAL'

  const list = (grouped[groupKey] || []).map((u) => {
    const deducedGroupKey =
      (u.trait || '').toUpperCase() ||
      (u.originalTrait ? originalToGroupKey[u.originalTrait] : groupKey)
    return {
      ...u,
      trait: traitGroupToKor[deducedGroupKey] || currentTraitType.value,
      originalTrait: u.originalTrait ? originalTraitKo[u.originalTrait] || u.originalTrait : '',
    }
  })

  allUsers.value = sortUsers(list)
  visibleCount.value = 10
}

/** 탭 전환 */
async function selectMainRankingTab(tab) {
  currentRankingType.value = tab
  if (tab === '성향별') {
    currentTraitType.value = '보수형'
    await loadGroupedRanking()
  } else {
    await loadRankingByDate(selectedBaseDate.value || fallbackDate)
  }
}

/** 성향 버튼 전환 */
async function selectTraitType(trait) {
  currentTraitType.value = trait
  await loadGroupedRanking()
}

/** 최초 로드 */
watch(
  userId,
  async (newUserId) => {
    if (!newUserId) return
    try {
      const my = await fetchMyRanking(newUserId, fallbackDate)
      if (!my) return

      const groupKor = traitGroupToKor[(my.trait || '').toUpperCase()] || '미지정'
      const detailed = my.originalTrait
        ? originalTraitKo[my.originalTrait] || my.originalTrait
        : groupKor

      selectedBaseDate.value = my.baseDate || fallbackDate
      myRanking.value = { ...my, trait: detailed }
      userTraitType.value = groupKor

      popularStocksRealtime.value = await fetchTop10StocksRealtime()
      popularStocksLastWeek.value = await fetchTop10Stocks(selectedBaseDate.value)

      await loadRankingByDate(selectedBaseDate.value)
      currentTraitType.value = userTraitType.value || traitTypes[0]
    } catch (e) {
      console.error('❌ 초기 데이터 로딩 에러:', e)
    }
  },
  { immediate: true },
)
</script>
