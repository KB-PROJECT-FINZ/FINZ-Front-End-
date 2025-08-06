// composables/useAssetData.js
import { ref, computed } from 'vue'
import axios from 'axios'

export function useAssetDataStore() {
  // ===== 상태 관리 =====
  const dataLoaded = ref(false)

  // ===== 사용자 데이터 =====
  const userAccount = ref({
    accountId: null,
    accountNumber: '',
    currentBalance: 0,
    totalAssetValue: 0,
    totalProfitLoss: 0,
    profitRate: 0,
  })

  const userCredit = ref(0)
  const holdingsData = ref([])

  // ===== 헬퍼 함수 =====
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue
    }
    return Number(value)
  }

  // ===== Computed Properties =====
  const stockValue = computed(() => {
    return holdingsData.value.reduce((total, holding) => {
      return total + safeNumber(holding.currentValue, 0)
    }, 0)
  })

  const totalInvestment = computed(() => {
    return holdingsData.value.reduce((sum, holding) => {
      return sum + safeNumber(holding.averagePrice, 0) * safeNumber(holding.quantity, 0)
    }, 0)
  })

  const totalProfitLoss = computed(() => {
    return holdingsData.value.reduce((sum, holding) => {
      return sum + safeNumber(holding.profitLoss, 0)
    }, 0)
  })

  const calculatedProfitRate = computed(() => {
    if (totalInvestment.value === 0) return 0
    return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
  })

  const portfolioPercentages = computed(() => {
    if (!dataLoaded.value) {
      return {
        holdings: [],
        cash: 100,
      }
    }

    // 유효한 보유 종목들만 필터링
    const validHoldings = holdingsData.value.filter(
      (holding) => safeNumber(holding.currentValue, 0) > 0,
    )

    // 총 자산 계산: 현금 + 유효한 보유 종목의 총 가치
    const totalStockValue = validHoldings.reduce(
      (sum, holding) => sum + safeNumber(holding.currentValue, 0),
      0,
    )
    const totalAsset = safeNumber(userAccount.value.currentBalance, 0) + totalStockValue

    if (totalAsset === 0) {
      return {
        holdings: [],
        cash: 100,
      }
    }

    const holdingPercentages = validHoldings.map((holding) => {
      const exactPercentage = (safeNumber(holding.currentValue, 0) / totalAsset) * 100
      return {
        ...holding,
        exactPercentage,
        percentage: Math.round(exactPercentage),
      }
    })

    // 0% 종목들을 제거
    const nonZeroHoldings = holdingPercentages.filter((holding) => holding.percentage > 0)

    const stockTotalExact = nonZeroHoldings.reduce((sum, h) => sum + h.exactPercentage, 0)
    let cashDisplayPercentage = Math.round(100 - stockTotalExact)

    const totalDisplayPercentage =
      nonZeroHoldings.reduce((sum, h) => sum + h.percentage, 0) + cashDisplayPercentage

    if (totalDisplayPercentage !== 100) {
      const difference = 100 - totalDisplayPercentage

      if (nonZeroHoldings.length > 0) {
        const largestHolding = nonZeroHoldings.reduce((max, current) =>
          current.exactPercentage > max.exactPercentage ? current : max,
        )
        largestHolding.percentage += difference
      } else {
        cashDisplayPercentage += difference
      }
    }

    return {
      holdings: nonZeroHoldings || [],
      cash: Math.max(0, cashDisplayPercentage || 0),
    }
  })

  // ===== API 호출 함수들 =====
  const fetchMultipleStockPrices = async (stockCodes) => {
    try {
      const codesString = stockCodes.join(',')
      const response = await axios.get(`/api/stock/prices/${codesString}`)

      if (response.data && response.data.success) {
        console.log(`배치 가격 조회 완료`)

        if (response.data.errors && response.data.errors.length > 0) {
          console.warn('⚠️ 일부 종목 조회 실패:', response.data.errors)
        }

        return response.data.data
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ 배치 주식 가격 조회 실패:', error)
      return null
    }
  }

  const updateHoldingsWithRealTimePrice = async (holdings) => {
    if (holdings.length === 0) return holdings

    const stockCodes = holdings.map((holding) => holding.stockCode)
    const pricesData = await fetchMultipleStockPrices(stockCodes)

    if (!pricesData) {
      console.warn('⚠️ 배치 가격 조회 실패, 기존 데이터 유지')
      return holdings
    }

    const updatedHoldings = holdings.map((holding) => {
      const priceInfo = pricesData[holding.stockCode]

      if (priceInfo && priceInfo.output) {
        const output = priceInfo.output
        const currentPrice = parseInt(output.stck_prpr)

        const totalValue = holding.quantity * currentPrice
        const totalInvestment = holding.quantity * holding.averagePrice
        const profitLoss = totalValue - totalInvestment
        const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

        return {
          ...holding,
          currentPrice: currentPrice,
          currentValue: totalValue,
          profitLoss: profitLoss,
          profitRate: Number(profitRate.toFixed(2)),
          priceChange: parseInt(output.prdy_vrss),
          changeRate: parseFloat(output.prdy_ctrt),
          changeSign: output.prdy_vrss_sign,
        }
      } else {
        console.warn(`⚠️ ${holding.stockCode} 가격 조회 실패, 기존 데이터 유지`)
        return holding
      }
    })

    return updatedHoldings
  }

  // 데이터 로딩 함수
  const loadUserData = async () => {
    dataLoaded.value = false

    try {
      // 1단계: 계좌 정보 로드
      const accountResponse = await axios.get('/api/mocktrading/account')

      if (accountResponse.data) {
        userAccount.value = {
          accountId: accountResponse.data.accountId,
          accountNumber: accountResponse.data.accountNumber || '',
          currentBalance: safeNumber(accountResponse.data.currentBalance, 0),
          totalAssetValue: safeNumber(accountResponse.data.totalAssetValue, 0),
          totalProfitLoss: safeNumber(accountResponse.data.totalProfitLoss, 0),
          profitRate: safeNumber(accountResponse.data.profitRate, 0),
        }
      } else {
        throw new Error('계좌 정보를 불러올 수 없습니다.')
      }

      // 2단계: 보유 종목 정보 로드
      const holdingsResponse = await axios.get('/api/mocktrading/holdings')

      if (holdingsResponse.data && Array.isArray(holdingsResponse.data)) {
        const basicHoldings = holdingsResponse.data.map((holding) => ({
          stockCode: holding.stockCode,
          stockName: holding.stockName,
          quantity: safeNumber(holding.quantity, 0),
          averagePrice: safeNumber(holding.averagePrice, 0),
          currentPrice: safeNumber(holding.currentPrice, 0),
          currentValue: safeNumber(holding.currentValue, 0),
          profitLoss: safeNumber(holding.profitLoss, 0),
          profitRate: safeNumber(holding.profitRate, 0),
        }))

        holdingsData.value = await updateHoldingsWithRealTimePrice(basicHoldings)
        console.log('배치 실시간 가격 업데이트 완료')
      } else {
        holdingsData.value = []
        console.log('📝 보유 종목 없음')
      }

      // 3단계: 크레딧 로드
      const creditResponse = await axios.get('/api/mocktrading/user/credit')

      if (creditResponse.data) {
        userCredit.value = safeNumber(creditResponse.data.totalCredit, 0)
      }

      // 4단계: 총 자산 값 업데이트
      userAccount.value.totalAssetValue = userAccount.value.currentBalance + stockValue.value

      dataLoaded.value = true
    } catch (error) {
      console.error('❌ 사용자 데이터 로드 실패:', error)
      if (error.response?.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      dataLoaded.value = true
      throw error
    }
  }

  return {
    // 상태
    dataLoaded,
    userAccount,
    userCredit,
    holdingsData,

    // Computed
    stockValue,
    totalInvestment,
    totalProfitLoss,
    calculatedProfitRate,
    portfolioPercentages,

    // 메서드
    loadUserData,
    safeNumber,
  }
}
