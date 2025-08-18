import { ref, computed } from 'vue'

/**
 * 거래 내역 기간 필터링 Composable
 *
 * 책임:
 * - 기간 옵션 관리
 * - 기간별 데이터 필터링
 * - 현재 선택된 기간 상태
 */
export function useTransactionsPeriod(transactionsData) {
  // ==================== 상태 관리 ====================
  const currentPeriod = ref('1month') // 기본 기간: 1개월

  // ==================== 기간 옵션 ====================
  const periodOptions = [
    { key: '1week', label: '1주일' },
    { key: '1month', label: '1개월' },
    { key: '3month', label: '3개월' },
    { key: '6month', label: '6개월' },
    { key: '1year', label: '1년' }
  ]

  // ==================== 계산된 속성 ====================

  /**
   * 현재 선택된 기간 라벨
   */
  const currentPeriodLabel = computed(() => {
    const period = periodOptions.find(p => p.key === currentPeriod.value)
    return period ? period.label : '기간 선택'
  })

  /**
   * 기간별 필터링된 거래 내역
   */
  const filteredTransactions = computed(() => {
    if (!transactionsData.value || transactionsData.value.length === 0) {
      return []
    }

    const now = new Date()
    const periodStartDate = getPeriodStartDate(currentPeriod.value, now)

    return transactionsData.value.filter(transaction => {
      if (!transaction.executedAt) return false

      try {
        const transactionDate = new Date(transaction.executedAt)
        return transactionDate >= periodStartDate && transactionDate <= now
      } catch (error) {
        console.error('날짜 필터링 오류:', error, transaction.executedAt)
        return false
      }
    })
  })

  // ==================== 유틸리티 함수 ====================

  /**
   * 기간에 따른 시작 날짜 계산
   * @param {string} period - 기간 키 (1week, 1month, etc.)
   * @param {Date} currentDate - 현재 날짜
   * @returns {Date} - 시작 날짜
   */
  function getPeriodStartDate(period, currentDate = new Date()) {
    const startDate = new Date(currentDate)

    switch (period) {
      case '1week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '3month':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '6month':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        // 기본값: 1개월
        startDate.setMonth(startDate.getMonth() - 1)
        break
    }

    // 시간을 00:00:00으로 설정하여 날짜만 비교
    startDate.setHours(0, 0, 0, 0)
    return startDate
  }

  // ==================== 기간 선택 ====================

  /**
   * 기간 선택 처리
   * @param {string} periodKey - 선택할 기간 키
   */
  function selectPeriod(periodKey) {
    if (periodOptions.find(p => p.key === periodKey)) {
      currentPeriod.value = periodKey
    } else {
      console.warn('유효하지 않은 기간 키:', periodKey)
    }
  }

  // ==================== 기간별 통계 ====================

  /**
   * 선택된 기간의 거래 통계
   */
  const periodStats = computed(() => {
    const transactions = filteredTransactions.value

    if (!transactions || transactions.length === 0) {
      return {
        totalCount: 0,
        buyCount: 0,
        sellCount: 0,
        totalAmount: 0,
        cancelledCount: 0
      }
    }

    return transactions.reduce((stats, transaction) => {
      stats.totalCount++

      if (transaction.status === 'CANCELLED') {
        stats.cancelledCount++
      } else {
        if (transaction.type === 'BUY') {
          stats.buyCount++
        } else if (transaction.type === 'SELL') {
          stats.sellCount++
        }

        stats.totalAmount += transaction.totalAmount || 0
      }

      return stats
    }, {
      totalCount: 0,
      buyCount: 0,
      sellCount: 0,
      totalAmount: 0,
      cancelledCount: 0
    })
  })

  // ==================== 공개 인터페이스 ====================
  return {
    // 상태
    currentPeriod,
    periodOptions,

    // 계산된 속성
    currentPeriodLabel,
    filteredTransactions,
    periodStats,

    // 메서드
    selectPeriod,
  }
}
