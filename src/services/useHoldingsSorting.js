import { ref, computed } from 'vue'

export function useHoldingsSorting(holdingsData, safeNumber) {
  // ===== 정렬 상태 =====
  const currentSort = ref('name')
  const showDetail = ref(false)

  // ===== 정렬 옵션 =====
  const sortOptions = [
    { key: 'name', label: '종목명' },
    { key: 'profitRate', label: '수익률' },
    { key: 'profitLoss', label: '평가손익' },
  ]

  // ===== 정렬된 보유 종목 계산 =====
  const sortedHoldings = computed(() => {
    const sorted = [...holdingsData.value]

    switch (currentSort.value) {
      case 'name':
        return sorted.sort((a, b) => a.stockName.localeCompare(b.stockName))
      case 'profitRate':
        return sorted.sort((a, b) => safeNumber(b.profitRate, 0) - safeNumber(a.profitRate, 0))
      case 'profitLoss':
        return sorted.sort((a, b) => safeNumber(b.profitLoss, 0) - safeNumber(a.profitLoss, 0))
      default:
        return sorted
    }
  })

  // ===== 정렬 옵션 변경 =====
  const changeSortOption = (sortKey) => {
    currentSort.value = sortKey
  }

  return {
    // 상태
    currentSort,
    showDetail,
    sortOptions,

    // 계산된 속성
    sortedHoldings,

    // 메서드
    changeSortOption,
  }
}
