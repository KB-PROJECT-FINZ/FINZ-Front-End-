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
    <!-- 상단 탭 -->
    <TabSwitcher
      :tabs="[
        { label: '투자 랭킹 보기', route: '/ranking' },
        { label: '종목 분석', route: '/ranking/analysis' },
      ]"
    />

    <!-- 1. 성향별 보유 비중 분석 (최대 5개 가로 스크롤) -->
    <section class="mt-4">
      <h2 class="text-base font-semibold mb-2">성향별 보유 비중 분석</h2>
      <div class="flex space-x-4 overflow-x-auto">
        <TraitStockCard
          v-for="(stock, idx) in traitStocks.slice(0, 5)"
          :key="idx"
          :name="stock.name"
          :gain="stock.gain"
          :traitRatio="stock.traitRatio"
          :logo="stock.logo"
        />
      </div>
    </section>

    <!-- 내 수익률 분포 위치 -->
    <section class="mt-6 space-y-6">
      <h2 class="text-base font-semibold">내 수익률 분포 위치</h2>
      <MyStockChart
        v-for="(stock, idx) in displayedMyStocks"
        :key="idx"
        :name="stock.name"
        :gain="stock.gain"
        :positionIndex="stock.positionIndex"
        :positionLabel="stock.positionLabel"
        :distribution="stock.distribution"
        :color="stock.color"
      />

      <button
        v-if="visibleMyStockCount < myStocks.length"
        @click="loadMoreMyStocks"
        class="mt-2 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        더보기
      </button>
    </section>

    <!-- 3. 유사 성향 투자자 인기 종목 -->
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

    <!-- 하단 네비게이션 -->
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import TabSwitcher from '@/components/ranking/TabSwitcher.vue'
import TraitStockCard from '@/components/ranking/TraitStockCard.vue'
import MyStockChart from '@/components/ranking/MyStockChart.vue'
import PopularStockItem from '@/components/ranking/PopularStockItem.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'

const router = useRouter()
function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/ranking') // 뒤로갈 페이지가 없으면 이 경로로 이동
  }
}

// 1. 성향별 보유 비중 분석
const traitStocks = ref([])

// 2. 내 수익률 분포 위치
const myStocks = ref([])
const visibleMyStockCount = ref(5)
const displayedMyStocks = computed(() => myStocks.value.slice(0, visibleMyStockCount.value))
function loadMoreMyStocks() {
  if (visibleMyStockCount.value < myStocks.value.length) {
    visibleMyStockCount.value += 5
  }
}

// 3. 유사 성향 인기 종목
const popularStocks = ref([])
const visiblePopularCount = ref(5)
const displayedPopularStocks = computed(() =>
  popularStocks.value.slice(0, visiblePopularCount.value),
)
function loadMorePopular() {
  if (visiblePopularCount.value < 50 && visiblePopularCount.value < popularStocks.value.length) {
    visiblePopularCount.value += 5
  }
}

// API 연동
async function fetchAnalysisData() {
  try {
    const userId = 1

    const [traitRes, myRes, popRes] = await Promise.all([
      axios.get('/analysis/trait-stock', { params: { userId } }),
      axios.get('/ranking/analysis/my-stock', { params: { userId } }),
      axios.get('/ranking/analysis/popular-stock', { params: { userId } }),
    ])

    traitStocks.value = traitRes.data
    myStocks.value = myRes.data
    popularStocks.value = popRes.data
  } catch (err) {
    console.error('분석 데이터 로드 실패:', err)
  }
}

onMounted(() => {
  fetchAnalysisData()
})
</script>
