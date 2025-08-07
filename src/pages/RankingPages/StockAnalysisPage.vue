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
              :name="stock.name"
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
              :name="stock.name"
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

import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import TraitStockCard from '@/components/ranking/TraitStockCard.vue'
import MyStockChart from '@/components/ranking/MyStockChart.vue'
import PopularStockItem from '@/components/ranking/PopularStockItem.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
import NoInvestmentGuide from '@/components/ranking/NoInvestmentGuide.vue'

import {
  fetchTraitStockAnalysis,
  fetchMyStockDistribution,
  fetchPopularStocksByTrait,
} from '@/services/rankingService'

// Pinia store
const userStore = useUserStore()

// 유저 ID 반응형 참조
const userId = computed(() => userStore.userId)
console.log('🚩🚩 userId:', userId.value)

// 데이터 상태
const traitStocks = ref([])
const myStocks = ref([])
const popularStocks = ref([])

// 수익률 분포 더보기
const visibleMyStockCount = ref(3)
const displayedMyStocks = computed(() => myStocks.value.slice(0, visibleMyStockCount.value))
function loadMoreMyStocks() {
  visibleMyStockCount.value += 3
}

// 인기 종목 더보기
const visiblePopularCount = ref(5)
const displayedPopularStocks = computed(() =>
  popularStocks.value.slice(0, visiblePopularCount.value),
)
function loadMorePopular() {
  visiblePopularCount.value += 5
}

// 투자 데이터 유무 판단
const hasInvestmentData = computed(() => {
  return traitStocks.value.length > 0 || myStocks.value.length > 0 || popularStocks.value.length > 0
})

// 성향 비율 추출
function getTraitRatio(stock) {
  return {
    보수형: stock.traitRatio?.보수형 ?? 0,
    균형형: stock.traitRatio?.균형형 ?? 0,
    공격형: stock.traitRatio?.공격형 ?? 0,
    특수형: stock.traitRatio?.특수형 ?? 0,
  }
}

// 분석 데이터 비동기 호출
async function fetchAnalysisData() {
  const uid = userStore.userId
  let traitGroup = userStore.riskType || userStore.traitGroup

  if (!uid) {
    console.error('[ERROR] userId 없음! Pinia에 유저 정보가 아직 세팅되지 않았을 수 있음')
    return
  }

  if (!traitGroup) {
    traitGroup = localStorage.getItem('userTraitType') || 'SPECIAL'
    console.warn('[WARN] traitGroup 없음 → localStorage fallback:', traitGroup)
  }

  // 특수 케이스 보정
  if (traitGroup === 'ANALYTICAL' || traitGroup === 'EMOTIONAL') {
    traitGroup = 'SPECIAL'
  }

  try {
    const [traitRes, myRes, popRes] = await Promise.all([
      fetchTraitStockAnalysis(uid),
      fetchMyStockDistribution(uid),
      fetchPopularStocksByTrait(traitGroup),
    ])
    console.log('✅ 분석 API 결과:', { traitRes, myRes, popRes }) // <-- 이 로그 꼭 넣기
    traitStocks.value = traitRes
    myStocks.value = myRes
    popularStocks.value = popRes
  } catch (err) {
    console.error('분석 데이터 로드 실패:', err)
  }
}

// ✅ userId가 존재할 때만 fetchAnalysisData 실행 (초기 mount 시점 포함)
watch(
  () => userStore.userId,
  (newUserId) => {
    if (newUserId) {
      console.log('✅ userId 감지됨:', newUserId)
      fetchAnalysisData()
    }
  },
  { immediate: true },
)
</script>
