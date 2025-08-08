<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4">
    <!-- 1. 헤더 -->
    <div class="py-4 text-center">
      <h1 class="text-lg font-bold">랭킹</h1>
    </div>

    <!-- 탭 -->
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <!-- 조건부 분석 or 안내 -->
    <div class="mt-4">
      <NoInvestmentGuide v-if="!hasInvestmentData" />
      <template v-else>
        <!-- 성향별 보유 비중 -->
        <section class="mt-4">
          <h2 class="text-base font-semibold mb-2">성향별 보유 비중 분석</h2>
          <div class="flex space-x-4 overflow-x-auto py-2">
            <TraitStockCard
              v-for="(stock, idx) in traitStocks.slice(0, 5)"
              :key="idx"
              :name="stock.name"
              :gain="stock.gain"
              :traitRatio="getTraitRatio(stock)"
              :logo="stock.logo"
              class="flex-shrink-0"
            />
          </div>
        </section>

        <!-- 내 수익률 분포 위치 -->
        <section class="mt-6">
          <h2 class="text-base font-semibold mb-2">내 수익률 분포 위치</h2>
          <div class="flex flex-col space-y-4">
            <MyStockChart
              v-for="(stock, idx) in displayedMyStocks"
              :key="idx"
              :name="stock.stockName"
              :gain="stock.gain"
              :positionIndex="stock.positionIndex"
              :positionLabel="stock.positionLabel"
              :distribution="stock.distribution"
              :color="'#60a5fa'"
            />
          </div>
          <button
            v-if="visibleMyStockCount < myStocks.length"
            @click="loadMoreMyStocks"
            class="mt-2 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            더보기
          </button>
        </section>

        <!-- 유사 성향 인기 종목 -->
        <section class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-base font-semibold">유사 성향 투자자 인기 종목</h2>
          </div>
          <div class="space-y-2">
            <PopularStockItem
              v-for="(stock, idx) in displayedPopularStocks"
              :key="idx"
              :name="stock.stockName"
              :trait="stock.trait"
              :gain="stock.gain"
              :logo="stock.logo"
            />
          </div>
          <button
            v-if="visiblePopularCount < Math.min(popularStocks.length, 50)"
            @click="loadMorePopular"
            class="mt-2 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            더보기
          </button>
        </section>
      </template>
    </div>

    <!-- Footer Navigation 항상 표시 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import debounce from 'lodash.debounce'

import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import TraitStockCard from '@/components/ranking/TraitStockCard.vue'
import MyStockChart from '@/components/ranking/MyStockChart.vue'
import PopularStockItem from '@/components/ranking/PopularStockItem.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
import NoInvestmentGuide from '@/components/ranking/NoInvestmentGuide.vue'

import {
  fetchTraitStockAnalysis,
  fetchPopularStocksByTrait,
  saveMyStockDistribution,
  fetchMyRealTimeStockDistribution,
} from '@/services/stockAnalysisService'

// 파니아 store
const userStore = useUserStore()

// 유저 ID 반응형 참조
const userId = computed(() => userStore.userId)

// 데이터 상태
const traitStocks = ref([])
const myStocks = ref([])
const popularStocks = ref([])

// 더보기 관련 상태
const visibleMyStockCount = ref(3)
const visiblePopularCount = ref(5)

const displayedMyStocks = computed(() => myStocks.value.slice(0, visibleMyStockCount.value))
const displayedPopularStocks = computed(() =>
  popularStocks.value.slice(0, visiblePopularCount.value),
)

function loadMoreMyStocks() {
  visibleMyStockCount.value += 3
}
function loadMorePopular() {
  visiblePopularCount.value += 5
}

// 유저 투자 데이터 존재 여부
const hasInvestmentData = computed(() => {
  return traitStocks.value.length > 0 || myStocks.value.length > 0 || popularStocks.value.length > 0
})

// 성향 비율 추출
function getTraitRatio(stock) {
  return {
    보수형: stock.traitRatio?.보수형 ?? 0,
    규합형: stock.traitRatio?.규합형 ?? 0,
    공격형: stock.traitRatio?.공격형 ?? 0,
    특수형: stock.traitRatio?.특수형 ?? 0,
  }
}

// 분석 데이터 비디오 호출
async function fetchAnalysisData() {
  const uid = userId.value
  let traitGroup = userStore.riskType || userStore.traitGroup

  if (!uid) {
    console.error('[ERROR] userId 없음! Pinia에 유저 정보가 아직 세팅되지 않았을 수 있음')
    return
  }

  if (!traitGroup) {
    traitGroup = localStorage.getItem('userTraitType') || 'SPECIAL'
    console.warn('[WARN] traitGroup 없음 → localStorage fallback:', traitGroup)
  }

  if (traitGroup === 'ANALYTICAL' || traitGroup === 'EMOTIONAL') {
    traitGroup = 'SPECIAL'
  }

  try {
    const [traitRes, myRes, popRes] = await Promise.all([
      fetchTraitStockAnalysis(uid),
      fetchMyRealTimeStockDistribution(uid),
      fetchPopularStocksByTrait(traitGroup),
    ])
    traitStocks.value = traitRes
    myStocks.value = myRes
    popularStocks.value = popRes
  } catch (err) {
    console.error('분석 데이터 로드 실패:', err)
  }
}

const debouncedSave = debounce(async (uid, stocks) => {
  if (!uid || stocks.length === 0) return

  const payload = stocks.map((stock) => ({
    stockCode: stock.stockCode,
    stockName: stock.stockName,
    gainRate: stock.gainRate,
    positionIndex: stock.positionIndex,
    positionLabel: stock.positionLabel,
    distributionBins: stock.distribution,
    color: stock.color || '#3b82f6',
  }))

  try {
    await saveMyStockDistribution(uid, payload)
  } catch (err) {
    console.error('❌ 자동 저장 실패:', err)
  }
}, 1000)

watch(
  myStocks,
  (newVal) => {
    if (userId.value && newVal && newVal.length > 0) {
      debouncedSave(userId.value, newVal)
    }
  },
  { deep: true },
)

watch(
  () => userStore.userId,
  (newUserId) => {
    if (newUserId && typeof newUserId === 'number' && newUserId > 0) {
      fetchAnalysisData()
    } else {
      console.warn('⛔ userId가 유효하지 않음:', newUserId)
    }
  },
  { immediate: true },
)
</script>
