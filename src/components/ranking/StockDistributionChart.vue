<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4">
    <div class="py-4 text-center">
      <h1 class="text-lg font-bold">랭킹</h1>
    </div>

    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="mt-4">
      <NoInvestmentGuide v-if="!hasInvestmentData" />
      <template v-else>
        <!-- 세그먼트 -->
        <div class="flex gap-2 sticky top-0 bg-white pb-2 z-10">
          <button
            class="flex-1 py-2 rounded-md border text-sm"
            :class="
              activeMain === 'ratio'
                ? 'bg-blue-200 text-blue-800 border-blue-300'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            "
            @click="activeMain = 'ratio'"
          >
            보유비중
          </button>
          <button
            class="flex-1 py-2 rounded-md border text-sm"
            :class="
              activeMain === 'distribution'
                ? 'bg-blue-200 text-blue-800 border-blue-300'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            "
            @click="activeMain = 'distribution'"
          >
            수익률분포
          </button>
          <button
            class="flex-1 py-2 rounded-md border text-sm"
            :class="
              activeMain === 'popular'
                ? 'bg-blue-200 text-blue-800 border-blue-300'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            "
            @click="activeMain = 'popular'"
          >
            인기종목
          </button>
        </div>

        <!-- 보유비중 -->
        <section v-show="activeMain === 'ratio'" class="mt-4">
          <h2 class="text-base font-semibold mb-2">성향별 보유 비중</h2>
          <div class="flex gap-2 overflow-x-auto py-2">
            <button
              v-for="(s, i) in traitStocks"
              :key="i"
              class="px-3 py-1 rounded-md border text-sm whitespace-nowrap"
              :class="
                selectedRatioKey === (s?.name || '')
                  ? 'bg-blue-200 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              "
              @click="selectedRatioKey = s?.name || ''"
            >
              {{ s.name }}
            </button>
          </div>
          <div v-if="currentRatioItem" class="mt-3">
            <TraitStockCard
              :name="currentRatioItem.name"
              :gain="currentRatioItem.gain"
              :traitRatio="getTraitRatio(currentRatioItem)"
              :logo="currentRatioItem.logo"
              class="mx-auto w-full max-w-[420px]"
            />
          </div>
          <div v-else class="text-center text-sm text-gray-500 py-8">
            상단에서 종목을 선택하면 성향별 보유 비중 차트를 보여줄게요.
          </div>
        </section>

        <!-- 수익률분포 -->
        <section v-show="activeMain === 'distribution'" class="mt-6">
          <h2 class="text-base font-semibold mb-2">내 수익률 분포 위치</h2>
          <div class="flex gap-2 overflow-x-auto py-2">
            <button
              v-for="(s, i) in myStocks"
              :key="i"
              class="px-3 py-1 rounded-md border text-sm whitespace-nowrap"
              :class="
                selectedDistKey === (s?.stockCode || s?.stockName || '')
                  ? 'bg-blue-200 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              "
              @click="selectedDistKey = s?.stockCode || s?.stockName || ''"
            >
              {{ s.stockName }}
            </button>
          </div>
          <div v-if="currentDistItem" class="mt-3 h-[300px] sm:h-[340px]">
            <MyStockChart
              :name="currentDistItem.stockName"
              :gain="currentDistItem.gain ?? currentDistItem.gainRate ?? 0"
              :positionIndex="currentDistItem.positionIndex"
              :positionLabel="currentDistItem.positionLabel"
              :distribution="
                Array.isArray(currentDistItem.distributionBins)
                  ? currentDistItem.distributionBins
                  : currentDistItem.distribution || [0, 0, 0, 0, 0, 0]
              "
            />
          </div>
          <div v-else class="text-center text-sm text-gray-500 py-8">
            상단에서 종목을 선택하면 수익률 분포 차트를 보여줄게요.
          </div>
        </section>

        <!-- 인기종목 -->
        <section v-show="activeMain === 'popular'" class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-base font-semibold">{{ traitGroupLabel }} 투자자 인기 종목</h2>
          </div>
          <div class="space-y-2">
            <PopularStockItem
              v-for="(stock, idx) in displayedPopularStocks"
              :key="idx"
              :name="stock.name"
              :logo="stock.logo"
              :gain="stock.gain"
            />
          </div>
          <button
            v-if="visiblePopularCount < Math.min(popularStocks.length, 50)"
            @click="loadMorePopular"
            class="mt-2 px-4 py-1 rounded-md bg-blue-200 text-blue-800 border border-blue-300 hover:bg-blue-300"
          >
            더보기
          </button>
        </section>
      </template>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import debounce from 'lodash.debounce'
import { useUserStore } from '@/stores/user'

import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import TraitStockCard from '@/components/ranking/TraitStockCard.vue'
import MyStockChart from '@/components/ranking/MyStockChart.vue'
import PopularStockItem from '@/components/ranking/PopularStockItem.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
import NoInvestmentGuide from '@/components/ranking/NoInvestmentGuide.vue'

import {
  fetchTraitStockAnalysis,
  fetchMyRealTimeStockDistribution,
  fetchPopularStocksByTrait,
  saveMyStockDistribution,
  normalizeTraitGroup,
  TRAIT_LABELS,
} from '@/services/stockAnalysisService'

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const traitStocks = ref([])
const myStocks = ref([])
const popularStocks = ref([])

const activeMain = ref('ratio')
const selectedRatioKey = ref('')
const selectedDistKey = ref('')

const visiblePopularCount = ref(10)
const displayedPopularStocks = computed(() =>
  popularStocks.value.slice(0, visiblePopularCount.value),
)
function loadMorePopular() {
  visiblePopularCount.value += 10
}

const hasInvestmentData = computed(
  () => traitStocks.value.length > 0 || myStocks.value.length > 0 || popularStocks.value.length > 0,
)

const traitGroupLabel = computed(() => {
  const raw = userStore.riskType || userStore.traitGroup
  const group = normalizeTraitGroup(raw)
  return TRAIT_LABELS[group] || '균형형'
})

function getTraitRatio(stock) {
  return {
    보수형: stock.traitRatio?.보수형 ?? 0,
    균형형: stock.traitRatio?.균형형 ?? 0,
    공격형: stock.traitRatio?.공격형 ?? 0,
    특수형: stock.traitRatio?.특수형 ?? 0,
    기타: stock.traitRatio?.기타 ?? 0,
  }
}

const currentRatioItem = computed(() =>
  traitStocks.value.find((s) => (s?.name || '') === selectedRatioKey.value),
)
const currentDistItem = computed(() =>
  myStocks.value.find((s) => (s?.stockCode || s?.stockName || '') === selectedDistKey.value),
)

async function fetchAnalysisData() {
  const uid = userId.value
  const traitGroup = normalizeTraitGroup(userStore.riskType || userStore.traitGroup)

  try {
    const [traitRes, myRes, popRes] = await Promise.all([
      fetchTraitStockAnalysis(uid),
      fetchMyRealTimeStockDistribution(uid),
      fetchPopularStocksByTrait(traitGroup),
    ])

    traitStocks.value = traitRes
    myRes &&
      (myStocks.value = myRes.map((s) => ({
        ...s,
        distribution: s.distributionBins || [0, 0, 0, 0, 0, 0],
      })))

    if (!selectedRatioKey.value && traitStocks.value.length) {
      selectedRatioKey.value = traitStocks.value[0]?.name || ''
    }
    if (!selectedDistKey.value && myStocks.value.length) {
      selectedDistKey.value = myStocks.value[0]?.stockCode || myStocks.value[0]?.stockName || ''
    }

    popularStocks.value = popRes
  } catch (err) {
    console.error('분석 데이터 로드 실패:', err?.message || err)
  }
}

const debouncedSave = debounce(async (uid, stocks) => {
  if (!uid || !stocks?.length) return
  const payload = stocks.map((s) => ({
    stockCode: s.stockCode,
    stockName: s.stockName,
    gainRate: s.gainRate,
    positionIndex: s.positionIndex,
    positionLabel: s.positionLabel,
    bin0: s.distribution?.[0] ?? s.distributionBins?.[0] ?? 0,
    bin1: s.distribution?.[1] ?? s.distributionBins?.[1] ?? 0,
    bin2: s.distribution?.[2] ?? s.distributionBins?.[2] ?? 0,
    bin3: s.distribution?.[3] ?? s.distributionBins?.[3] ?? 0,
    bin4: s.distribution?.[4] ?? s.distributionBins?.[4] ?? 0,
    bin5: s.distribution?.[5] ?? s.distributionBins?.[5] ?? 0,
    color: s.color || '#3b82f6',
  }))
  try {
    await saveMyStockDistribution(uid, payload)
  } catch {}
}, 1000)

watch(
  myStocks,
  (v) => {
    if (userId.value && v && v.length) debouncedSave(userId.value, v)
  },
  { deep: true },
)

watch(
  () => userStore.userId,
  (newUserId) => {
    if (newUserId && typeof newUserId === 'number' && newUserId > 0) fetchAnalysisData()
  },
  { immediate: true },
)
</script>
