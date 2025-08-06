<template>
  <div class="min-h-[100vh] pb-20 bg-gray-50">
    <!-- 상단 헤더 + 보유 종목 요약 통합 배경 -->
    <div class="bg-white">
      <header
        class="flex items-center justify-between px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10 bg-white"
      >
        <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">보유 종목</span>
        <button
          class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
          @click="refreshData"
          :disabled="loading"
        >
          <span :class="{ 'animate-spin': loading }">&#8635;</span>
        </button>
      </header>

      <!-- 보유 종목 요약 -->
      <section class="pt-4 px-0">
        <div class="flex justify-between items-center px-6 pt-2">
          <h3 class="text-lg font-semibold text-gray-900">내 투자</h3>
        </div>

        <!-- 요약 정보 로딩 상태 -->
        <div v-if="loading && holdingsData.length === 0" class="flex flex-col gap-3 p-5">
          <div v-for="i in 4" :key="i" class="flex justify-between items-center px-2">
            <div class="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- 요약 정보 -->
        <div v-else class="flex flex-col gap-3 p-5">
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">원금</span>
            <span class="text-base text-gray-900">{{ totalInvestment.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">평가금액</span>
            <span class="text-base text-gray-900">{{ totalCurrentValue.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">총 수익</span>
            <span
              class="text-base"
              :class="totalProfitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ totalProfitLoss >= 0 ? '+' : ''
              }}{{ Math.abs(totalProfitLoss).toLocaleString() }}원
            </span>
          </div>
          <div class="flex justify-between items-center px-2">
            <span class="text-xs text-gray-500">수익률</span>
            <span
              class="text-base"
              :class="totalProfitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ totalProfitRate >= 0 ? '+' : '' }}{{ totalProfitRate }}%
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- 정렬 옵션 -->
    <section class="mx-4 mt-4 mb-4">
      <div class="flex items-center text-xs text-gray-500 font-medium">
        <button
          type="button"
          class="flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[70px] h-6 ml-0"
          :class="[
            showDetail
              ? 'bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-300'
              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200',
          ]"
          style="box-shadow: 0 1px 2px 0 rgb(16 30 115 / 0.04)"
          @click="showDetail = !showDetail"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 min-w-[16px] mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          자세히 보기
        </button>
        <div class="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 flex-nowrap ml-auto">
          <button
            v-for="sort in sortOptions"
            :key="sort.key"
            @click="changeSortOption(sort.key)"
            class="px-1.5 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-[44px] h-6 flex items-center justify-center"
            :class="
              currentSort === sort.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            "
          >
            {{ sort.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 보유 종목 리스트 -->
    <section class="bg-white rounded-xl px-4">
      <!-- 로딩 중 스켈레톤 UI -->
      <div v-if="loading && holdingsData.length === 0">
        <div v-for="i in 3" :key="i" class="p-4 animate-pulse">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div class="flex flex-col min-w-0">
                <div class="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                <div class="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="flex flex-col items-end justify-center min-w-[110px]">
              <div class="w-20 h-4 bg-gray-200 rounded mb-1"></div>
              <div class="w-24 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 실제 데이터 -->
      <div v-else>
        <div
          v-for="holding in sortedHoldings"
          :key="holding.stockCode"
          class="p-4 cursor-pointer transition-colors hover:bg-gray-50 hover:rounded-xl"
          @click="goToStockDetail(holding.stockCode, holding.stockName)"
        >
          <template v-if="showDetail">
            <!-- 상세 카드: 종목명 옆에 이미지 -->
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="holding.imageUrl && !imageErrors[holding.stockCode]"
                    :src="holding.imageUrl"
                    :alt="`${holding.stockName} 로고`"
                    class="w-full h-full object-cover rounded-full"
                    @error="handleImageError(holding.stockCode)"
                  />
                  <span
                    v-else
                    class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                    style="border-color: #2272eb; color: #2272eb; background: #fff"
                  >
                    {{ getStockInitial(holding.stockName) }}
                  </span>
                </span>
                <div>
                  <h4 class="text-base font-semibold text-gray-900">{{ holding.stockName }}</h4>
                  <p class="text-sm text-gray-500">{{ holding.stockCode }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex flex-col gap-0 text-right">
                  <div class="text-base font-bold text-gray-900 leading-tight">
                    <span v-if="holding.currentPrice > 0"
                      >{{ holding.currentPrice.toLocaleString() }}원</span
                    >
                    <span v-else class="text-gray-400">가격 업데이트 중...</span>
                  </div>
                  <span
                    v-if="holding.profitRate !== null && holding.profitRate !== undefined"
                    class="text-sm leading-tight"
                    :class="holding.profitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
                    style="margin-top: 2px"
                  >
                    {{ holding.profitRate >= 0 ? '+' : '' }}{{ holding.profitRate }}%
                  </span>
                  <span v-else class="text-sm text-gray-400 leading-tight" style="margin-top: 2px"
                    >-%</span
                  >
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">보유수량</span>
                <span class="ml-2 font-medium text-gray-900">{{ holding.quantity }}주</span>
              </div>
              <div>
                <span class="text-gray-500">평균단가</span>
                <span class="ml-2 font-medium text-gray-900"
                  >{{ holding.averagePrice.toLocaleString() }}원</span
                >
              </div>
              <div>
                <span class="text-gray-500">평가금액</span>
                <span class="ml-2 font-medium text-gray-900">
                  <span v-if="holding.totalValue > 0"
                    >{{ holding.totalValue.toLocaleString() }}원</span
                  >
                  <span v-else class="text-gray-400">계산 중...</span>
                </span>
              </div>
              <div>
                <span class="text-gray-500">평가손익</span>
                <span
                  v-if="holding.profitLoss !== null && holding.profitLoss !== undefined"
                  class="ml-2 font-medium"
                  :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
                >
                  {{ holding.profitLoss >= 0 ? '+' : ''
                  }}{{ Math.abs(holding.profitLoss).toLocaleString() }}원
                </span>
                <span v-else class="ml-2 font-medium text-gray-400">계산 중...</span>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- 간단 카드: 종목명 옆에 이미지, 보유수량(아래), 오른쪽에 현재가/평가손익(수익률%) -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span
                  class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="holding.imageUrl && !imageErrors[holding.stockCode]"
                    :src="holding.imageUrl"
                    :alt="`${holding.stockName} 로고`"
                    class="w-full h-full object-cover rounded-full"
                    @error="handleImageError(holding.stockCode)"
                  />
                  <span
                    v-else
                    class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                    style="border-color: #2272eb; color: #2272eb; background: #fff"
                  >
                    {{ getStockInitial(holding.stockName) }}
                  </span>
                </span>
                <div class="flex flex-col min-w-0">
                  <div class="text-base font-semibold text-gray-900 truncate">
                    {{ holding.stockName }}
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ holding.quantity }}주</div>
                </div>
              </div>
              <div class="flex flex-col items-end justify-center min-w-[110px]">
                <span class="text-base text-gray-900 font-semibold mb-0.5">
                  <span v-if="holding.currentPrice > 0"
                    >{{ holding.currentPrice.toLocaleString() }}원</span
                  >
                  <span v-else class="text-gray-400 text-sm">업데이트 중...</span>
                </span>
                <span
                  v-if="
                    holding.profitLoss !== null &&
                    holding.profitLoss !== undefined &&
                    holding.profitRate !== null &&
                    holding.profitRate !== undefined
                  "
                  :class="holding.profitLoss >= 0 ? 'text-red-600' : 'text-blue-600'"
                  class="text-xs"
                  >{{ holding.profitRate >= 0 ? '+' : '-'
                  }}{{ Math.abs(holding.profitLoss).toLocaleString() }}원 ({{
                    holding.profitRate >= 0 ? '+' : ''
                  }}{{ holding.profitRate }}%)
                </span>
                <span v-else class="text-xs text-gray-400">계산 중...</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- 빈 상태 -->
    <div
      v-if="holdingsData.length === 0 && !loading"
      class="flex flex-col items-center justify-center py-16"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-center mb-4">보유 중인 종목이 없습니다</p>
      <button
        @click="goToMockTrading"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        모의투자 시작하기
      </button>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHoldingsData } from '@/services/useHoldingsData'
import { useHoldingsSorting } from '@/services/useHoldingsSorting'
import FooterNavigation from '@/components/FooterNavigation.vue'

const router = useRouter()

// ===== Composables 사용 =====
const {
  holdingsData,
  loading,
  imageErrors,
  totalInvestment,
  totalCurrentValue,
  totalProfitLoss,
  totalProfitRate,
  fetchHoldings,
  safeNumber,
  getStockInitial,
  handleImageError,
} = useHoldingsData()

const { currentSort, showDetail, sortOptions, sortedHoldings, changeSortOption } =
  useHoldingsSorting(holdingsData, safeNumber, false)

// ===== 네비게이션 메서드 =====
const goBack = () => {
  router.back()
}

const goToStockDetail = (stockCode, stockName) => {
  router.push(`/mock-trading/${stockCode}/chart?stockName=${encodeURIComponent(stockName)}`)
}

const goToMockTrading = () => {
  router.push('/mock-trading')
}

const refreshData = async () => {
  console.log('🔄 보유 종목 데이터 새로고침')
  await fetchHoldings()
}

// ===== 컴포넌트 라이프사이클 =====
onMounted(() => {
  fetchHoldings()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
