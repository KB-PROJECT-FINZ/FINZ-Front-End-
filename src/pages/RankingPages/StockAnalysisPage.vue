<template>
  <div class="w-full max-w-[480px] mx-auto pb-24 px-4 overflow-x-hidden">
    <div class="mt-6"></div>
    <!-- 상단 탭 -->
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <div class="mt-3">
      <NoInvestmentGuide v-if="!hasInvestmentData" />
      <template v-else>
        <!-- 세그먼트: sticky + 내부 컨테이너로 폭 통일 -->
        <div class="sticky top-0 bg-white z-10">
          <div
            class="w-full max-w-[480px] mx-auto shadow-md rounded-md overflow-hidden bg-white grid grid-cols-3"
          >
            <button
              class="h-10 whitespace-nowrap px-2 text-sm flex items-center justify-center"
              :class="
                activeMain === 'ratio'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              "
              @click="activeMain = 'ratio'"
            >
              성향별 비중
            </button>

            <button
              class="h-10 whitespace-nowrap px-2 text-sm flex items-center justify-center"
              :class="
                activeMain === 'distribution'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              "
              @click="activeMain = 'distribution'"
            >
              내 수익률 분포
            </button>

            <button
              class="h-10 whitespace-nowrap px-2 text-sm flex items-center justify-center"
              :class="
                activeMain === 'popular'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              "
              @click="activeMain = 'popular'"
            >
              성향별 인기 종목
            </button>
          </div>
        </div>

        <!-- 성향별 비중 -->
        <section v-if="activeMain === 'ratio'" class="mt-4">
          <!-- 종목 선택 버튼 -->
          <div class="flex gap-2 overflow-x-auto py-2">
            <button
              v-for="(s, i) in traitStocks"
              :key="i"
              class="px-3 py-1 rounded-md shadow-sm whitespace-nowrap transition-colors"
              :class="
                selectedRatioKey === (s?.name || '')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-200'
              "
              @click="selectedRatioKey = s?.name || ''"
            >
              {{ s.name }}
            </button>
          </div>

          <div v-if="currentRatioItem" class="mt-3">
            <TraitStockCard
              :key="selectedRatioKey"
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

        <!-- 내 수익률 분포 -->
        <section v-if="activeMain === 'distribution'" class="mt-6">
          <div class="flex gap-2 overflow-x-auto py-2">
            <button
              v-for="(s, i) in myStocks"
              :key="i"
              class="px-3 py-1 rounded-md shadow-sm whitespace-nowrap transition-colors"
              :class="
                selectedDistKey === (s?.stockCode || s?.stockName || '')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-200'
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

        <!-- 성향별 인기 종목 -->
        <section v-if="activeMain === 'popular'" class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-base font-semibold">{{ traitGroupLabel }} 인기 종목</h2>
          </div>

          <!-- 섹션 전체 박스(배경 없음 + 섀도우만) -->
          <div class="rounded-md shadow-md" role="group" aria-label="인기 종목 목록">
            <div class="p-2">
              <PopularStockItem
                v-for="(stock, idx) in displayedPopularStocks"
                :key="idx"
                :name="stock.name"
                :logo="stock.logo"
                :gain="stock.gain"
              />
            </div>
            <div class="p-2 pt-0">
              <button
                v-if="visiblePopularCount < Math.min(popularStocks.length, 50)"
                @click="loadMorePopular"
                class="w-full px-4 py-2 rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                더보기
              </button>
            </div>
          </div>
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

/* =========================
   로고 URL 정규화 유틸
   - 공백/문자열 'null'/'undefined' 제거
   - //host → https://host
   - http:// → https:// (혼합콘텐츠 방지)
   ========================= */
function normalizeUrl(raw) {
  if (!raw) return ''
  const u = String(raw).trim()
  if (!u || u === 'null' || u === 'undefined') return ''
  if (u.startsWith('//')) return 'https:' + u
  if (u.startsWith('http://')) return u.replace(/^http:\/\//, 'https://')
  return u
}

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

    // 성향별 비중
    traitStocks.value = Array.isArray(traitRes) ? traitRes : []

    // 내 수익률 분포
    myStocks.value = Array.isArray(myRes)
      ? myRes.map((s) => ({
          ...s,
          distribution: s.distributionBins || [0, 0, 0, 0, 0, 0],
        }))
      : []

    // ✅ 인기 종목: 로고 URL 정규화 적용
    popularStocks.value = Array.isArray(popRes)
      ? popRes.map((s) => ({
          ...s,
          logo: normalizeUrl(s.logo),
        }))
      : []

    if (!selectedRatioKey.value && traitStocks.value.length) {
      selectedRatioKey.value = traitStocks.value[0]?.name || ''
    }
    if (!selectedDistKey.value && myStocks.value.length) {
      selectedDistKey.value = myStocks.value[0]?.stockCode || myStocks.value[0]?.stockName || ''
    }
  } catch (err) {
    console.error('분석 데이터 로드 실패:', err?.message || err)
  }
}

// 분포 저장 (변경 누적 시 딜레이 저장)
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
