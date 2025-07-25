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

    <!-- 성향별 보유 비중 분석 (더보기 없음, 5개만 가로 스크롤) -->
    <section class="mt-4">
      <h2 class="text-base font-semibold mb-2">성향별 보유 비중 분석</h2>
      <div class="flex space-x-4 overflow-x-auto">
        <TraitStockCard
          v-for="(stock, idx) in stocks.slice(0, 5)"
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
        v-for="(stock, idx) in myStocks"
        :key="idx"
        :name="stock.name"
        :gain="stock.gain"
        :positionIndex="stock.positionIndex"
        :positionLabel="stock.positionLabel"
        :distribution="stock.distribution"
        :color="stock.color"
      />
    </section>

    <!-- 유사 성향 투자자 인기 종목 (더보기 버튼으로 최대 50개까지 확장) -->
    <section class="mt-6">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-base font-semibold">유사 성향 투자자 인기 종목</h2>
        <!-- 전체보기 버튼은 필요없으면 제거 가능 -->
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TabSwitcher from '@/components/TabSwitcher.vue'
import TraitStockCard from '@/components/TraitStockCard.vue'
import MyStockChart from '@/components/MyStockChart.vue'
import PopularStockItem from '@/components/PopularStockItem.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'

const router = useRouter()

function goBack() {
  router.back()
}

// 전체 성향별 보유 비중 분석 종목 데이터 (예시 10개)
const stocks = [
  {
    name: '삼성전자',
    gain: 15.3,
    logo: '/images/samsung.png',
    traitRatio: {
      공격형: 41,
      중립형: 38,
      안정형: 29,
    },
  },
  {
    name: 'LG화학',
    gain: -9.2,
    logo: '/images/lgchem.png',
    traitRatio: {
      공격형: 35,
      중립형: 30,
      안정형: 35,
    },
  },
  {
    name: '현대차',
    gain: 5.7,
    logo: '/images/hyundai.png',
    traitRatio: {
      공격형: 25,
      중립형: 45,
      안정형: 30,
    },
  },
  {
    name: '카카오',
    gain: 8.1,
    logo: '/images/kakao.png',
    traitRatio: {
      공격형: 40,
      중립형: 40,
      안정형: 20,
    },
  },
  {
    name: 'NAVER',
    gain: 11.3,
    logo: '/images/naver.png',
    traitRatio: {
      공격형: 30,
      중립형: 50,
      안정형: 20,
    },
  },
  {
    name: 'SK하이닉스',
    gain: 7.6,
    logo: '/images/skhynix.png',
    traitRatio: {
      공격형: 35,
      중립형: 45,
      안정형: 20,
    },
  },
  {
    name: '셀트리온',
    gain: 12.2,
    logo: '/images/celltrion.png',
    traitRatio: {
      공격형: 40,
      중립형: 40,
      안정형: 20,
    },
  },
  {
    name: '삼성바이오로직스',
    gain: 14.5,
    logo: '/images/samsung_bio.png',
    traitRatio: {
      공격형: 50,
      중립형: 30,
      안정형: 20,
    },
  },
  {
    name: '현대모비스',
    gain: 6.3,
    logo: '/images/hyundai_mobis.png',
    traitRatio: {
      공격형: 25,
      중립형: 50,
      안정형: 25,
    },
  },
  {
    name: 'POSCO',
    gain: 9.7,
    logo: '/images/posco.png',
    traitRatio: {
      공격형: 30,
      중립형: 40,
      안정형: 30,
    },
  },
]

// 내 수익률 분포 위치 예시 데이터
const myStocks = [
  {
    name: '삼성전자',
    gain: 8.5,
    positionIndex: 3,
    positionLabel: '상위 23% 수익률',
    distribution: [5, 10, 20, 30, 25, 10],
    color: 'rgba(220,38,38,0.7)', // red
  },
  {
    name: 'NVIDIA',
    gain: 15.7,
    positionIndex: 4,
    positionLabel: '상위 15% 수익률',
    distribution: [3, 12, 18, 35, 22, 10],
    color: 'rgba(34,197,94,0.7)', // green
  },
]

// 유사 성향 투자자 인기 종목 (50개 예시로 복사해서 50개 이상 만들어도 됨)
const popularStocks = [
  {
    name: 'LG화학',
    trait: '균형형',
    gain: -9.2,
    logo: '/images/lgchem.png',
  },
  {
    name: '하이닉스',
    trait: '공격형',
    gain: 14.7,
    logo: '/images/skhynix.png',
  },
  {
    name: '현대차',
    trait: '안정형',
    gain: -6.8,
    logo: '/images/hyundai.png',
  },
  {
    name: 'NAVER',
    trait: '균형형',
    gain: 11.3,
    logo: '/images/naver.png',
  },
  {
    name: '카카오',
    trait: '공격형',
    gain: -2.1,
    logo: '/images/kakao.png',
  },
  { name: '종목1', trait: '공격형', gain: 20.0, logo: '/images/stock1.png' },
  { name: '종목2', trait: '공격형', gain: 19.5, logo: '/images/stock2.png' },
  { name: '종목3', trait: '공격형', gain: 19.0, logo: '/images/stock3.png' },
  { name: '종목4', trait: '공격형', gain: 18.5, logo: '/images/stock4.png' },
  { name: '종목5', trait: '공격형', gain: 18.0, logo: '/images/stock5.png' },
  { name: '종목6', trait: '공격형', gain: 17.5, logo: '/images/stock1.png' },
  { name: '종목7', trait: '공격형', gain: 17.0, logo: '/images/stock2.png' },
  { name: '종목8', trait: '공격형', gain: 16.5, logo: '/images/stock3.png' },
  { name: '종목9', trait: '공격형', gain: 16.0, logo: '/images/stock4.png' },
  { name: '종목10', trait: '공격형', gain: 15.5, logo: '/images/stock5.png' },
]

// 유사 성향 인기 종목 더보기 카운트 관리
const visiblePopularCount = ref(5)
const displayedPopularStocks = computed(() => popularStocks.slice(0, visiblePopularCount.value))
function loadMorePopular() {
  if (visiblePopularCount.value < 50 && visiblePopularCount.value < popularStocks.length) {
    visiblePopularCount.value += 5
  }
}
</script>

<style scoped></style>
