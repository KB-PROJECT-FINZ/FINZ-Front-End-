import { ref, computed } from 'vue'
import axios from 'axios'

export function useHoldingsData() {
  // ===== 상태 관리 =====
  const holdingsData = ref([])
  const loading = ref(false)
  const imageErrors = ref({})

  // ===== 헬퍼 함수 =====
  // null 값을 안전하게 처리하는 헬퍼 함수
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue
    }
    return Number(value)
  }

  // 가격 데이터 파싱 헬퍼 함수
  const parseStockPriceData = (priceInfo) => {
    if (priceInfo && typeof priceInfo === 'object') {
      const fields = {
        currentPrice: priceInfo.inter2_prpr,
        priceChange: priceInfo.inter2_prdy_vrss,
        changeRate: priceInfo.prdy_ctrt,
        changeSign: priceInfo.prdy_vrss_sign,
        openPrice: priceInfo.inter2_oprc,
        highPrice: priceInfo.inter2_hgpr,
        lowPrice: priceInfo.inter2_lwpr,
        volume: priceInfo.acml_vol,
        stockName: priceInfo.inter_kor_isnm,
      }

      if (fields.currentPrice) {
        return {
          currentPrice: parseInt(fields.currentPrice),
          priceChange: parseInt(fields.priceChange || 0),
          changeRate: parseFloat(fields.changeRate || 0),
          changeSign: fields.changeSign || '3',
          openPrice: parseInt(fields.openPrice || 0),
          highPrice: parseInt(fields.highPrice || 0),
          lowPrice: parseInt(fields.lowPrice || 0),
          volume: parseInt(fields.volume || 0),
          stockName: fields.stockName || '',
        }
      }
    }
    return null
  }

  // 종목명에서 이니셜 추출 (이미지 대체용)
  const getStockInitial = (stockName) => {
    if (!stockName) return '?'
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(stockName.charAt(0))) {
      return stockName.charAt(0)
    }
    return stockName.substring(0, 1).toUpperCase()
  }

  // 이미지 로딩 에러 처리
  const handleImageError = (stockCode) => {
    imageErrors.value[stockCode] = true
  }

  // ===== 계산된 속성들 =====
  const totalInvestment = computed(() => {
    return holdingsData.value.reduce(
      (sum, holding) => sum + safeNumber(holding.averagePrice, 0) * safeNumber(holding.quantity, 0),
      0,
    )
  })

  const totalCurrentValue = computed(() => {
    return holdingsData.value.reduce((sum, holding) => sum + safeNumber(holding.totalValue, 0), 0)
  })

  const totalProfitLoss = computed(() => {
    return holdingsData.value.reduce((sum, holding) => sum + safeNumber(holding.profitLoss, 0), 0)
  })

  const totalProfitRate = computed(() => {
    if (totalInvestment.value === 0) return 0
    return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
  })

  // ===== API 호출 =====
  const fetchHoldings = async () => {
    loading.value = true
    try {
      // 1. 보유 종목 기본 정보 가져오기
      const response = await axios.get('/api/mocktrading/holdings')

      if (!response.data || !Array.isArray(response.data)) {
        console.warn('보유 종목 데이터가 배열이 아닙니다:', response.data)
        holdingsData.value = []
        return
      }

      // 2. 종목 코드 목록 추출
      const stockCodes = response.data.map((holding) => holding.stockCode).filter((code) => code)

      if (stockCodes.length === 0) {
        console.log('보유 종목이 없습니다.')
        holdingsData.value = []
        return
      }

      // 3. 다중 종목 가격 정보 조회
      const stockCodesParam = stockCodes.join(',')
      const priceResponse = await axios.get(`/api/stock/prices/${stockCodesParam}`)

      // 4. 데이터 결합 및 계산
      const enrichedHoldings = response.data.map((holding) => {
        // 해당 종목의 가격 정보 찾기
        const priceInfo = priceResponse.data?.data?.[holding.stockCode]

        // 가격 데이터 파싱
        const parsedPrice = parseStockPriceData(priceInfo)
        const currentPrice = parsedPrice?.currentPrice || 0

        // 수익/손실 계산
        const quantity = safeNumber(holding.quantity, 0)
        const averagePrice = safeNumber(holding.averagePrice, 0)
        const totalValue = currentPrice * quantity
        const profitLoss = totalValue - averagePrice * quantity
        const profitRate = averagePrice > 0 ? (profitLoss / (averagePrice * quantity)) * 100 : 0

        return {
          ...holding,
          currentPrice,
          totalValue,
          profitLoss,
          profitRate: Number(profitRate.toFixed(2)),
          priceChange: parsedPrice?.priceChange || 0,
          changeRate: parsedPrice?.changeRate || 0,
          changeSign: parsedPrice?.changeSign || '3',
          imageUrl: holding.imageUrl,
        }
      })

      holdingsData.value = enrichedHoldings
    } catch (error) {
      console.error('❌ 보유 종목 데이터 로딩 실패:', error)

      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트')
        return
      }

      holdingsData.value = []
      alert('보유 종목 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      loading.value = false
    }
  }

  return {
    // 상태
    holdingsData,
    loading,
    imageErrors,

    // 계산된 속성
    totalInvestment,
    totalCurrentValue,
    totalProfitLoss,
    totalProfitRate,

    // 메서드
    fetchHoldings,
    safeNumber,
    getStockInitial,
    handleImageError,
  }
}
