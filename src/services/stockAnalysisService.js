// src/services/stockAnalysisService.js
import axios from 'axios'
axios.defaults.withCredentials = true

/* ---------- 라벨/매핑 ---------- */
export const TRAIT_LABELS = {
  AGGRESSIVE: '공격형',
  BALANCED: '균형형',
  CONSERVATIVE: '보수형',
  ANALYTICAL: '특수형',
  EMOTIONAL: '기타',
}
export const DETAILED_TO_GROUP = {
  AGR: 'AGGRESSIVE',
  AID: 'BALANCED',
  BGT: 'BALANCED',
  BSS: 'BALANCED',
  CAG: 'CONSERVATIVE',
  CSD: 'CONSERVATIVE',
  IND: 'CONSERVATIVE',
  VAL: 'CONSERVATIVE',
  DTA: 'AGGRESSIVE',
  EXP: 'AGGRESSIVE',
  THE: 'AGGRESSIVE',
  INF: 'ANALYTICAL',
  SYS: 'ANALYTICAL',
  TEC: 'ANALYTICAL',
  SOC: 'EMOTIONAL',
}
export function normalizeTraitGroup(input) {
  const raw = String(input || '')
    .toUpperCase()
    .trim()
  return DETAILED_TO_GROUP[raw] || raw
}

/* ---------- 이미지 유틸 (정규화 + 폴백) ---------- */
// 절대 경로 폴백 (public/images/stocks/default.png 사용)
const ABS_FALLBACK = new URL('/images/stocks/default.png', window.location.origin).toString()

// 도메인 화이트리스트 (프록시 대상) — 기본적으로 사용 안 함
const PROXY_HOSTS = ['file.alphasquare.co.kr']
// ✅ 기본 OFF: 프록시 백엔드가 준비되면 .env에서 VITE_USE_IMG_PROXY=true 로 켜세요
const PROXY_ENABLED = import.meta?.env?.VITE_USE_IMG_PROXY === 'true'
const viaProxy = (url) => `/api/img-proxy?url=${encodeURIComponent(url)}`

function normalizeUrl(raw) {
  if (!raw) return ''
  const u = String(raw).trim()
  if (!u || u === 'null' || u === 'undefined') return ''
  if (u.startsWith('//')) return 'https:' + u
  if (u.startsWith('http://')) return u.replace(/^http:\/\//, 'https://')
  return u
}
function shouldProxy(url) {
  try {
    const { host } = new URL(url)
    return PROXY_ENABLED && PROXY_HOSTS.includes(host)
  } catch {
    return false
  }
}
function alphaLogoUrl(stockCode) {
  if (!stockCode) return ''
  return `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stockCode}.png`
}
function resolveLogo({ logoUrl, stockCode }) {
  // 1) 응답의 logo 우선
  let url = normalizeUrl(logoUrl)
  // 2) 없으면 stockCode로 구성
  if (!url && stockCode) url = alphaLogoUrl(stockCode)
  // 3) 여전히 없으면 폴백
  if (!url) return ABS_FALLBACK
  // 4) (옵션) 프록시
  return shouldProxy(url) ? viaProxy(url) : url
}

/* ---------- API ---------- */
export async function fetchTraitStockAnalysis(userId) {
  try {
    const { data } = await axios.get('/api/ranking/analysis/trait-stock', { params: { userId } })
    return (data || []).map((item) => ({
      name: item.name,
      gain: item.gain ?? 0,
      logo: resolveLogo({ logoUrl: item.logo, stockCode: item.stockCode }),
      traitRatio: {
        보수형: item.conservativeRatio ?? 0,
        균형형: item.balancedRatio ?? 0,
        공격형: item.aggressiveRatio ?? 0,
        특수형: item.analyticalRatio ?? 0,
        기타: item.emotionalRatio ?? 0,
      },
    }))
  } catch (e) {
    console.error('fetchTraitStockAnalysis error:', e?.message || e)
    return []
  }
}

export async function fetchMyStockDistribution(userId) {
  try {
    const { data } = await axios.get('/api/ranking/analysis/my-distribution', {
      params: { userId },
    })
    return (data || []).map((stock) => ({
      stockName: stock.stockName,
      gainRate: stock.gainRate,
      positionIndex: stock.positionIndex,
      positionLabel: stock.positionLabel,
      distribution: [
        stock.bin0 || 0,
        stock.bin1 || 0,
        stock.bin2 || 0,
        stock.bin3 || 0,
        stock.bin4 || 0,
        stock.bin5 || 0,
      ],
    }))
  } catch (e) {
    console.error('fetchMyStockDistribution error:', e?.message || e)
    return []
  }
}

export async function fetchPopularStocksByTrait(traitGroup) {
  try {
    const tg = normalizeTraitGroup(traitGroup)
    const { data } = await axios.get('/api/ranking/analysis/popular-stocks', {
      params: { traitGroup: tg },
    })
    return (data || []).map((stock) => ({
      name: stock.stockName,
      gain: stock.investorCount,
      // ✔ 원본 URL (정규화/폴백). 프록시는 VITE_USE_IMG_PROXY=true 때만 적용.
      logo: resolveLogo({ logoUrl: alphaLogoUrl(stock.stockCode), stockCode: stock.stockCode }),
      trait: TRAIT_LABELS[tg] || tg,
      ranking: stock.ranking,
    }))
  } catch (e) {
    console.error('fetchPopularStocksByTrait error:', e?.message || e)
    return []
  }
}

export async function saveMyStockDistribution(userId, distributions) {
  try {
    const sanitized = (distributions || [])
      .filter((item) => item?.stockCode && String(item.stockCode).trim() !== '')
      .map((item) => {
        const bins = item.distribution ?? item.distributionBins ?? [0, 0, 0, 0, 0, 0]
        return {
          stockCode: item.stockCode,
          stockName: item.stockName,
          gainRate: item.gainRate,
          positionIndex: item.positionIndex,
          positionLabel: item.positionLabel,
          bin0: bins[0] ?? 0,
          bin1: bins[1] ?? 0,
          bin2: bins[2] ?? 0,
          bin3: bins[3] ?? 0,
          bin4: bins[4] ?? 0,
          bin5: bins[5] ?? 0,
          color: item.color || '#3b82f6',
        }
      })
    await axios.post('/api/ranking/analysis/my-distribution/save', {
      userId,
      distributions: sanitized,
    })
  } catch (e) {
    console.error('saveMyStockDistribution error:', e?.message || e)
    throw e
  }
}

export async function fetchMyRealTimeStockDistribution(userId) {
  try {
    const { data } = await axios.get('/api/ranking/analysis/my-distribution', {
      params: { userId },
    })
    return (data || []).map((stock) => ({
      stockCode: stock.stockCode,
      stockName: stock.stockName,
      gainRate: stock.gainRate,
      positionIndex: stock.positionIndex,
      positionLabel: stock.positionLabel,
      distributionBins: [
        stock.bin0 || 0,
        stock.bin1 || 0,
        stock.bin2 || 0,
        stock.bin3 || 0,
        stock.bin4 || 0,
        stock.bin5 || 0,
      ],
      color: stock.color || '#3b82f6',
    }))
  } catch (e) {
    console.error('fetchMyRealTimeStockDistribution error:', e?.message || e)
    return []
  }
}
