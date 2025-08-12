import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
axios.defaults.withCredentials = true

function getLastMonday() {
  const today = new Date()
  const day = today.getDay() || 7
  today.setDate(today.getDate() - day + 1 - 7)
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
  const fmt = (d) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`
  return `${label} 랭킹 (${fmt(start)}~${fmt(end)})`
}

const mapStock = (stock) => ({
  name: stock.stockName,
  gain: stock.avgGainRate,
  image: stock.stockCode
    ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
    : '/images/stocks/default.png',
})

/** 서버 응답 → 표준화 */
const ALLOWED_GROUPS = ['AGGRESSIVE', 'BALANCED', 'CONSERVATIVE', 'ANALYTICAL', 'EMOTIONAL']

function normalizeTraitGroup(user) {
  const key = (user.traitGroup || user.trait || user.groupCode || user.riskType || '')
    .toString()
    .toUpperCase()
  return ALLOWED_GROUPS.includes(key) ? key : ''
}

function normalizeProfileImage(v) {
  if (v === null || v === undefined || v === 'null' || v === 'undefined') return null
  const n = typeof v === 'string' ? parseInt(v, 10) : v
  if (Number.isNaN(n) || n < 1 || n > 7) return null
  return n
}

const mapUser = (user) => ({
  userId: user.userId ?? user.id ?? null,
  nickname: user.nickname || 'N/A',
  gainRate: user.gainRate,
  ranking: user.ranking ?? null,
  trait: normalizeTraitGroup(user), // 영문 그룹코드
  originalTrait: user.originalTrait ?? null, // 세부 코드 (AGR/TEC…)
  profileImage: normalizeProfileImage(user.profileImage), // 1~7 또는 null
})

export async function fetchMyRanking(userId, baseDate) {
  const fallbackBaseDate = baseDate ?? getLastMonday()
  try {
    const { data } = await axios.get('/api/ranking/my', {
      params: { userId, baseDate: fallbackBaseDate },
    })
    return {
      rank: data.ranking,
      gainRate: data.gainRate,
      topPercent: data.topPercent,
      trait: data.riskType, // 영문 그룹코드
      originalTrait: data.originalTrait, // 세부 코드
      baseDate: data.baseDate ?? fallbackBaseDate,
    }
  } catch {
    return null
  }
}

export async function fetchTop10Stocks(baseDate) {
  try {
    const { data } = await axios.get('/api/ranking/popular-stocks', { params: { baseDate } })
    return (data || []).map(mapStock)
  } catch {
    return []
  }
}

export async function fetchWeeklyRanking(baseDate) {
  try {
    const { data } = await axios.get('/api/ranking/weekly', { params: { baseDate } })
    return Array.isArray(data) ? data.map(mapUser) : []
  } catch {
    return []
  }
}

export async function fetchGroupedWeeklyRanking(baseDate) {
  try {
    const { data } = await axios.get('/api/ranking/weekly/grouped', { params: { baseDate } })
    const parsed = {}
    for (const [groupKey, users] of Object.entries(data || {})) {
      parsed[groupKey] = (users || []).map(mapUser)
    }
    return parsed
  } catch {
    return {}
  }
}

export async function fetchTop10StocksRealtime() {
  try {
    const { data } = await axios.get('/api/ranking/popular-stocks')
    return (data || []).map(mapStock)
  } catch {
    return []
  }
}

export async function fetchMyRealTimeStockDistribution() {
  try {
    const assetStore = useAssetDataStore()
    await assetStore.loadUserData()
    if (!assetStore.holdingsData.value?.length) return []
    return assetStore.holdingsData.value.map((h) => {
      const q = h.quantity ?? 0
      const avg = h.averagePrice ?? 0
      const cur = h.currentPrice ?? 0
      const curVal = q * cur
      const total = q * avg
      const pnl = curVal - total
      const rate = total ? (pnl / total) * 100 : 0
      return {
        stockCode: h.stockCode,
        stockName: h.stockName,
        gainRate: rate,
        positionIndex: h.positionIndex ?? 0,
        positionLabel: h.positionLabel || '',
        distributionBins: h.distributionBins || [0, 0, 0, 0, 0, 0],
        color: h.color || '#3b82f6',
      }
    })
  } catch {
    return []
  }
}
