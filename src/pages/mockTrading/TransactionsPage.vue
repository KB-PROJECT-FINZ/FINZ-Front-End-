<!-- 템플릿 부분은 기존 그대로 유지 -->
<template>
  <div class="min-h-[100vh] pb-20 bg-white">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">거래 내역</span>
      <button
        class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        @click="refreshData"
      >
        &#8635;
      </button>
    </header>
    <div class="w-full h-px bg-gray-200 shadow-sm mx-0" />

    <!-- 필터 및 기간 선택 -->
    <section class="bg-white mx-4 mt-2 pt-4 px-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-base font-semibold text-gray-900">거래 내역 조회</h3>
        <span class="text-sm text-gray-500">총 {{ filteredTransactions.length }}건</span>
      </div>

      <!-- 기간 선택 -->
      <div class="mb-3">
        <button
          @click="showPeriodModal = true"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-gray-100 text-gray-900"
        >
          <span>{{ getSelectedPeriodLabel() }}</span>
          <svg
            class="w-4 h-4 ml-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <!-- 기간 선택 모달 -->
        <div
          v-if="showPeriodModal"
          class="fixed inset-0 bg-transparent z-50 flex items-end"
          @click="showPeriodModal = false"
        >
          <div
            class="bg-white w-full rounded-t-2xl p-4 pb-18"
            :class="!isModalDragging ? 'transition-transform duration-200' : ''"
            :style="{ transform: `translateY(${modalDragOffset}px)` }"
            @click.stop
            @mousedown="onModalDragStart"
            @touchstart="onModalDragStart"
            @mousemove="onModalDragMove"
            @touchmove="onModalDragMove"
            @mouseup="onModalDragEnd"
            @mouseleave="onModalDragEnd"
            @touchend="onModalDragEnd"
          >
            <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"></div>
            <h3 class="text-lg font-semibold mb-4">기간 선택</h3>
            <div class="space-y-2">
              <button
                v-for="period in periodOptions"
                :key="period.key"
                @click="selectPeriod(period.key)"
                class="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
                :class="currentPeriod === period.key ? 'bg-gray-100' : ''"
              >
                <span class="text-gray-900">{{ period.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 거래 내역 리스트 -->
    <section class="mx-4 mt-0 space-y-1.5">
      <div v-for="transaction in visibleTransactions" :key="transaction.id" class="bg-white p-3">
        <!-- 새 카드 레이아웃: 왼쪽 날짜, 가운데 종목명, 오른쪽 체결단가 -->
        <div class="flex items-center justify-between mb-1">
          <!-- 날짜 -->
          <div class="flex-shrink-0 w-10 text-left">
            <div class="text-xs text-gray-400">{{ formatDateDot(transaction.executedAt) }}</div>
          </div>
          <!-- 종목명 및 상태 + 이미지 -->
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="getStockImageUrl(transaction) && !imageErrors[transaction.stockCode]"
                :src="getStockImageUrl(transaction)"
                :alt="`${transaction.stockName} 로고`"
                class="w-full h-full object-cover rounded-full"
                @error="handleImageError(transaction.stockCode)"
              />
              <span
                v-else
                class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center flex-shrink-0"
                style="border-color: #2272eb; color: #2272eb; background: #fff"
              >
                {{ getStockInitial(transaction.stockName) }}
              </span>
            </span>
            <div class="flex-1 min-w-0">
              <div
                class="text-base font-semibold truncate"
                :class="transaction.status === 'CANCELLED' ? 'text-gray-400' : 'text-gray-900'"
              >
                {{ transaction.stockName }}
              </div>
              <div
                class="text-xs mt-1"
                :class="
                  transaction.status === 'CANCELLED'
                    ? 'text-gray-400'
                    : [
                        getStatusClass(transaction.status, transaction.type),
                        transaction.type === 'BUY'
                          ? 'text-red-600'
                          : transaction.type === 'SELL'
                            ? 'text-blue-600'
                            : '',
                      ]
                "
              >
                {{ getTransactionStatusText(transaction) }}
              </div>
            </div>
          </div>
          <!-- 체결단가 -->
          <div class="flex-shrink-0 text-right">
            <div v-if="transaction.status !== 'CANCELLED'" class="text-sm text-gray-900">
              주당 {{ transaction.price.toLocaleString() }}원
            </div>
            <div v-else class="text-sm text-gray-400">&nbsp;</div>
          </div>
        </div>

        <!-- 수량/유형/현재가/평가손익 영역 제거 -->
      </div>

      <!-- 더보기 버튼 -->
      <button
        v-if="!showAll && filteredTransactions.length > itemsPerPage"
        class="block w-full py-3 bg-gray-100 text-gray-800 border-none border-t border-gray-200 text-[14px] font-medium cursor-pointer transition-colors hover:bg-gray-200 mt-2"
        @click="showAll = true"
      >
        더보기
      </button>
    </section>

    <!-- 빈 상태 -->
    <div
      v-if="filteredTransactions.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <div class="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-center mb-4">선택한 기간의 거래 내역이 없습니다</p>
      <button
        @click="goToMockTrading"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        모의투자 시작하기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white"
    >
      <div
        class="w-10 h-10 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"
      ></div>
      <p>거래 내역을 불러오는 중...</p>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'

import { useTransactionsModal } from '@/services/useTranscationsModal.js'
import { useTransactionsData } from '@/services/useTranscationsData.js'
import { useTransactionsPeriod } from '@/services/useTranscationsPeriod.js'

// ==================== 라우터 ====================
const router = useRouter()

// 데이터 관리
const {
  transactionsData,
  loading,
  imageErrors,
  showAll,
  itemsPerPage,
  fetchTransactions,
  getStockImageUrl,
  getStockInitial,
  handleImageError,
  formatDateOnly,
  getTransactionStatusText,
  getStatusClass,
  resetPagination,
} = useTransactionsData()

// 기간 필터링
const {
  currentPeriod,
  periodOptions,
  currentPeriodLabel,
  filteredTransactions,
  selectPeriod: selectPeriodFromComposable,
} = useTransactionsPeriod(transactionsData)

// 모달 인터랙션
const {
  showPeriodModal,
  modalDragOffset,
  isDragging: isModalDragging,
  onModalDragStart,
  onModalDragMove,
  onModalDragEnd,
  onMounted: onModalMounted,
  onUnmounted: onModalUnmounted,
} = useTransactionsModal()

// ==================== 계산된 속성 ====================

/**
 * 실제로 화면에 표시될 거래 내역 (페이지네이션 적용)
 */
const visibleTransactions = computed(() => {
  const maxItems = showAll.value ? filteredTransactions.value.length : itemsPerPage
  return filteredTransactions.value.slice(0, maxItems)
})

// ==================== 템플릿에서 사용하는 메서드 ====================

/**
 * 날짜를 MM.DD 형식으로 반환 (예: 08.07)
 */
function formatDateDot(dateString) {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}.${day}`
}

/**
 * 선택된 기간 라벨 반환
 */
function getSelectedPeriodLabel() {
  return currentPeriodLabel.value
}

/**
 * 기간 선택 처리 (모달 닫기 포함)
 */
function selectPeriod(periodKey) {
  selectPeriodFromComposable(periodKey)
  showPeriodModal.value = false
  resetPagination() // 기간 변경 시 페이지네이션 리셋
}

/**
 * 데이터 새로고침
 */
async function refreshData() {
  await fetchTransactions()
  resetPagination() // 새로고침 시 페이지네이션 리셋
}

// ==================== UI 이벤트 핸들러 ====================

/**
 * 뒤로가기 버튼 클릭
 */
function goBack() {
  router.back()
}

/**
 * 모의투자 홈으로 이동
 */
function goToMockTrading() {
  router.push({ name: 'MockTradingHome' })
}

// ==================== 생명주기 ====================

onMounted(async () => {
  // 거래 내역 데이터 로드
  await fetchTransactions()

  // 모달 이벤트 리스너 등록
  onModalMounted()
})

onUnmounted(() => {
  // 모달 이벤트 리스너 제거
  onModalUnmounted()
})
</script>
