import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
axios.defaults.withCredentials = true

/* ====== 날짜 유틸 (KST 안전) ====== */
// ISO 자를 때 UTC로 전날로 밀리는 걸 방지하려고 '정오'로 고정
function toISODateLocal(d) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}

// 지난주 '일요일' (주차: 일~토)
function getLastSundayISO(base = new Date()) {
  const d = new Date(base)
  const day = d.getDay() // 0=일, 1=월,... 6=토
  d.setDate(d.getDate() - day - 7) // 이번 주 일요일에서 1주 전
  return toISODateLocal(d)
}

/* ====== 주차 라벨: baseDate(일) ~ (토) ====== */
export function getRankingWeekLabel(baseDateString) {
  const start = new Date(baseDateString) // 일요일
  start.setHours(12, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6) // 토요일

  const sm = start.getMonth() + 1
  const sd = String(start.getDate()).padStart(2, '0')
  const em = end.getMonth() + 1
  const ed = String(end.getDate()).padStart(2, '0')

  return `${sm}월 ${sd}일 ~ ${em}월 ${ed}일`
}

/* ====== 공통 유틸 ====== */
function pad6(v) {
  const s = String(v ?? '').trim()
  return /^[0-9]+$/.test(s) ? s.padStart(6, '0') : s
}

/* ====== 매핑/정규화 ====== */
const mapStock = (stock) => {
  const code = pad6(stock.stockCode ?? stock.code ?? stock.stock_code)
  // 서버가 imageUrl 내려주면 우선 사용, 없으면 알파스퀘어 CDN 시도 (404면 컴포넌트에서 다음 후보로 자동 폴백)
  const primaryImage =
    stock.imageUrl ??
    stock.image_url ??
    (code ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${code}.png` : null)

  return {
    code, // 🔑 Top10StockList가 반드시 필요로 함
    name: stock.stockName ?? stock.name ?? code,
    gain: stock.avgGainRate ?? stock.gainRate ?? stock.gain ?? 0,
    image: primaryImage, // 첫 후보 (실패 시 컴포넌트에서 /api/logo → 정적 → default 순서)
    // (옵션) 메타 들어오면 넘겨줌 - 타이틀/서브타이틀에서 쓰일 수 있음
    dateType: stock.dateType ?? null,
    baseDate: stock.baseDate ?? null,
  }
}

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

/* ====== API ====== */
export async function fetchMyRanking(userId, baseDate) {
  // ✅ 기본값을 "지난주 일요일"로 변경
  const fallbackBaseDate = baseDate ?? getLastSundayISO()
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
      baseDate: data.baseDate ?? fallbackBaseDate, // 서버가 에코 안 해도 안전
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

// 실시간 Top10 (baseDate 없이)
export async function fetchTop10StocksRealtime() {
  try {
    const { data } = await axios.get('/api/ranking/popular-stocks/realtime')
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
