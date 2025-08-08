import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
axios.defaults.withCredentials = true

// utils
function getLastMonday() {
  const today = new Date()
  const day = today.getDay() || 7
  today.setDate(today.getDate() - day + 1 - 7) // 지난주 월요일
  return today.toISOString().slice(0, 10)
}

export function getRankingWeekLabel(baseDateString) {
  const baseDate = new Date(baseDateString)
  const start = new Date(baseDate)
  const end = new Date(baseDate)
  end.setDate(end.getDate() + 6)

  const month = start.getMonth() + 1
  const weekNumber = Math.ceil(start.getDate() / 7)
  const label = `${month}월 ${['첫째', '둘째', '셋째', '넷째', '다섯째'][weekNumber - 1]} 주`

  const format = (date) => `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, '0')}`
  return ` ${label} 랭킹 (${format(start)}~${format(end)})`
}

// [1] 내 주간 수익률 및 랭킹
export async function fetchMyRanking(userId, baseDate) {
  const fallbackBaseDate = baseDate ?? getLastMonday()
  try {
    const res = await axios.get('/api/ranking/my', {
      params: { userId, baseDate: fallbackBaseDate },
    })
    const data = res.data
    return {
      rank: data.ranking,
      gainRate: data.gainRate,
      topPercent: data.topPercent,
      trait: data.riskType || '미지정',
      baseDate: data.baseDate ?? fallbackBaseDate,
    }
  } catch (error) {
    console.error('fetchMyRanking error:', error)
    return null
  }
}

// [2] 주간 인기 종목 Top10 (지난주 기준)
export async function fetchTop10Stocks(baseDate) {
  try {
    const res = await axios.get('/api/ranking/popular-stocks', { params: { baseDate } })
    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.avgGainRate,
      image: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
    }))
  } catch (error) {
    console.error('fetchTop10Stocks error:', error)
    return []
  }
}

// [3] 주간 전체 유저 랭킹 Top100 (지난주 기준)
export async function fetchWeeklyRanking(baseDate) {
  try {
    const res = await axios.get('/api/ranking/weekly', { params: { baseDate } })
    if (!Array.isArray(res.data)) {
      console.warn('fetchWeeklyRanking 응답이 배열이 아닙니다:', res.data)
      return []
    }
    return res.data.map((user) => ({
      userId: user.userId,
      nickname: user.nickname || 'N/A',
      gainRate: user.gainRate,
      trait: user.traitGroup || '기타',
      originalTrait: user.originalTrait,
      image: `/images/profile${(user.userId % 5) + 1}.png`,
    }))
  } catch (error) {
    console.error('fetchWeeklyRanking error:', error)
    return []
  }
}

// [4] 성향 그룹별 주간 랭킹 (지난주 기준)
export async function fetchGroupedWeeklyRanking(baseDate) {
  try {
    const response = await axios.get('/api/ranking/weekly/grouped', { params: { baseDate } })
    const grouped = response.data
    const parsedGrouped = {}
    for (const [groupKey, users] of Object.entries(grouped)) {
      parsedGrouped[groupKey] = users.map((user) => ({
        userId: user.userId,
        nickname: user.nickname || 'N/A',
        gainRate: user.gainRate,
        trait: user.traitGroup || '기타',
        originalTrait: user.originalTrait,
        image: `/images/profile${(user.userId % 5) + 1}.png`,
      }))
    }
    return parsedGrouped
  } catch (error) {
    console.error('❌ fetchGroupedWeeklyRanking 오류:', error)
    return {}
  }
}

// [5] 실시간 인기 종목 Top10
export async function fetchTop10StocksRealtime() {
  try {
    const res = await axios.get('/api/ranking/popular-stocks')
    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.avgGainRate,
      image: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
    }))
  } catch (error) {
    console.error('fetchTop10StocksRealtime error:', error)
    return []
  }
}

// [6] 실시간 내 수익률 분포 계산
export async function fetchMyRealTimeStockDistribution() {
  try {
    const assetStore = useAssetDataStore()
    await assetStore.loadUserData()

    console.log('holdingsData 값:', assetStore.holdingsData.value)

    if (!assetStore.holdingsData.value || assetStore.holdingsData.value.length === 0) {
      console.warn('holdingsData가 비어있거나 데이터가 없습니다!')
      return [] // 데이터 없으면 빈 배열 반환하고 종료
    }

    const stocks = assetStore.holdingsData.value.map((holding) => {
      const quantity = holding.quantity ?? 0
      const avgPrice = holding.averagePrice ?? 0
      const currentPrice = holding.currentPrice ?? 0

      const currentValue = quantity * currentPrice
      const totalInvestment = quantity * avgPrice
      const profitLoss = currentValue - totalInvestment
      const profitRate = totalInvestment ? (profitLoss / totalInvestment) * 100 : 0

      return {
        stockCode: holding.stockCode,
        stockName: holding.stockName,
        gainRate: profitRate,
        positionIndex: holding.positionIndex ?? 0,
        positionLabel: holding.positionLabel || '',
        distributionBins: holding.distributionBins || [0, 0, 0, 0, 0, 0],
        color: holding.color || '#3b82f6',
      }
    })

    console.log('실제 저장할 stocks:', stocks)

    return stocks
  } catch (error) {
    console.error('❌ fetchMyRealTimeStockDistribution error:', error?.message || error)
    return []
  }
}
