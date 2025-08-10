import axios from 'axios'
axios.defaults.withCredentials = true

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

export async function fetchTraitStockAnalysis(userId) {
  try {
    const { data } = await axios.get('/api/ranking/analysis/trait-stock', { params: { userId } })
    return (data || []).map((item) => ({
      name: item.name,
      gain: item.gain ?? 0,
      logo: item.logo,
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
      logo: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
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
