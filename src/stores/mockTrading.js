import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { marketIndices, stockList } from '@/utils/dummyData'

export const useMockTradingStore = defineStore('mockTrading', () => {
  // 상태 (State)
  const marketData = ref([...marketIndices])
  const searchResults = ref([])
  const selectedStock = ref(null)
  const isLoading = ref(false)

  // 사용자 포트폴리오 상태
  const portfolio = ref({
    totalAssets: 10000000, // 1천만원 초기 자금
    availableCash: 10000000,
    totalValue: 10000000,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    holdings: []
  })

  // 계산된 값 (Getters)
  const kospiIndex = computed(() =>
    marketData.value.find(item => item.name === 'KOSPI')
  )

  const kosdaqIndex = computed(() =>
    marketData.value.find(item => item.name === 'KOSDAQ')
  )

  const portfolioSummary = computed(() => ({
    investedAmount: portfolio.value.totalAssets - portfolio.value.availableCash,
    gainLossPercent: portfolio.value.totalGainLossPercent,
    isPositive: portfolio.value.totalGainLoss >= 0
  }))

  // 액션 (Actions)
  const searchStocks = async (query) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    isLoading.value = true

    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 300)) // 검색 딜레이 시뮬레이션

      const filtered = stockList.filter(stock =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.code.includes(query)
      )

      searchResults.value = filtered.slice(0, 10)
    } catch (error) {
      console.error('검색 중 오류 발생:', error)
      searchResults.value = []
    } finally {
      isLoading.value = false
    }
  }

  const selectStock = (stock) => {
    selectedStock.value = stock
    searchResults.value = []
  }

  const updateMarketData = (newData) => {
    marketData.value = newData
  }

  const addToWatchlist = (stock) => {
    // 관심종목 추가 로직
    console.log('관심종목 추가:', stock)
  }

  const buyStock = async (stockCode, quantity, price) => {
    isLoading.value = true

    try {
      const totalCost = quantity * price

      if (totalCost > portfolio.value.availableCash) {
        throw new Error('잔고가 부족합니다.')
      }

      // 기존 보유 종목 확인
      const existingHolding = portfolio.value.holdings.find(h => h.stockCode === stockCode)

      if (existingHolding) {
        // 기존 보유 종목의 수량 및 평균 단가 업데이트
        const totalShares = existingHolding.quantity + quantity
        const totalValue = (existingHolding.averagePrice * existingHolding.quantity) + totalCost
        existingHolding.averagePrice = totalValue / totalShares
        existingHolding.quantity = totalShares
      } else {
        // 새 종목 추가
        portfolio.value.holdings.push({
          stockCode,
          stockName: stockList.find(s => s.code === stockCode)?.name || stockCode,
          quantity,
          averagePrice: price,
          currentPrice: price,
          gainLoss: 0,
          gainLossPercent: 0
        })
      }

      portfolio.value.availableCash -= totalCost
      updatePortfolioValue()

      return { success: true, message: '매수 주문이 체결되었습니다.' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const sellStock = async (stockCode, quantity, price) => {
    isLoading.value = true

    try {
      const holding = portfolio.value.holdings.find(h => h.stockCode === stockCode)

      if (!holding || holding.quantity < quantity) {
        throw new Error('보유 수량이 부족합니다.')
      }

      const totalRevenue = quantity * price

      if (holding.quantity === quantity) {
        // 전량 매도
        portfolio.value.holdings = portfolio.value.holdings.filter(h => h.stockCode !== stockCode)
      } else {
        // 일부 매도
        holding.quantity -= quantity
      }

      portfolio.value.availableCash += totalRevenue
      updatePortfolioValue()

      return { success: true, message: '매도 주문이 체결되었습니다.' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const updatePortfolioValue = () => {
    const holdingsValue = portfolio.value.holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.currentPrice)
    }, 0)

    portfolio.value.totalValue = portfolio.value.availableCash + holdingsValue
    portfolio.value.totalGainLoss = portfolio.value.totalValue - portfolio.value.totalAssets
    portfolio.value.totalGainLossPercent = (portfolio.value.totalGainLoss / portfolio.value.totalAssets) * 100

    // 각 종목별 손익 계산
    portfolio.value.holdings.forEach(holding => {
      const investedAmount = holding.quantity * holding.averagePrice
      const currentValue = holding.quantity * holding.currentPrice
      holding.gainLoss = currentValue - investedAmount
      holding.gainLossPercent = (holding.gainLoss / investedAmount) * 100
    })
  }

  const resetPortfolio = () => {
    portfolio.value = {
      totalAssets: 10000000,
      availableCash: 10000000,
      totalValue: 10000000,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      holdings: []
    }
  }

  // 스토어 반환
  return {
    // 상태
    marketData,
    searchResults,
    selectedStock,
    isLoading,
    portfolio,

    // 계산된 값
    kospiIndex,
    kosdaqIndex,
    portfolioSummary,

    // 액션
    searchStocks,
    selectStock,
    updateMarketData,
    addToWatchlist,
    buyStock,
    sellStock,
    updatePortfolioValue,
    resetPortfolio
  }
})
