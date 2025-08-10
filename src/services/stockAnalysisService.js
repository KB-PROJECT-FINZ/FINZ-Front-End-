// stockAnalysisService.js
import axios from 'axios'
// import { useAssetDataStore } from '@/services/useAssetData'
axios.defaults.withCredentials = true

export const TRAIT_LABELS = {
  AGGRESSIVE: '공격형',
  BALANCED: '균형형',
  CONSERVATIVE: '보수형',
  ANALYTICAL: '특수형',
  EMOTIONAL: '기타',
}

const DETAILED_TO_GROUP = {
  AGR: 'AGGRESSIVE',
  AID: 'BALANCED',
  BGT: 'BALANCED',
  BSS: 'BALANCED',
  CAG: 'CONSERVATIVE',
  CSD: 'CONSERVATIVE',
  DTA: 'AGGRESSIVE',
  EXP: 'AGGRESSIVE',
  IND: 'CONSERVATIVE',
  INF: 'ANALYTICAL',
  SOC: 'EMOTIONAL',
  SYS: 'ANALYTICAL',
  TEC: 'ANALYTICAL',
  THE: 'AGGRESSIVE',
  VAL: 'CONSERVATIVE',
}

// [A1] 성향별 보유 비중
export async function fetchTraitStockAnalysis(userId) {
  try {
    const res = await axios.get('/api/ranking/analysis/trait-stock', {
      params: { userId },
    })
    // 백엔드가 5개 컬럼을 각각 %로 주도록 변경했으니 그대로 매핑
    return res.data.map((item) => ({
      name: item.name,
      gain: item.gain ?? 0,
      logo: item.logo,
      traitRatio: {
        보수형: item.conservativeRatio ?? 0,
        균형형: item.balancedRatio ?? 0,
        공격형: item.aggressiveRatio ?? 0,
        특수형: item.analyticalRatio ?? 0, // <-- NEW
        기타: item.emotionalRatio ?? 0, // <-- NEW
      },
    }))
  } catch (error) {
    console.error('fetchTraitStockAnalysis error:', error)
    return []
  }
}

// [A2] 내 보유 종목 수익률 분포 (기존 API 버전)
export async function fetchMyStockDistribution(userId) {
  try {
    const res = await axios.get('/api/ranking/analysis/my-distribution', {
      params: { userId },
    })
    return res.data.map((stock) => ({
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
  } catch (error) {
    console.error('fetchMyStockDistribution error:', error)
    return []
  }
}
// [A3] 유사 성향 투자자 인기 종목
export async function fetchPopularStocksByTrait(traitGroup) {
  try {
    const tg = DETAILED_TO_GROUP[traitGroup] || String(traitGroup || '').toUpperCase()
    const res = await axios.get('/api/ranking/analysis/popular-stocks', {
      params: { traitGroup: tg },
    })
    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.investorCount, // 보유자 수
      logo: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
      trait:
        {
          AGGRESSIVE: '공격형',
          BALANCED: '균형형',
          CONSERVATIVE: '보수형',
          ANALYTICAL: '특수형',
          EMOTIONAL: '기타',
        }[tg] || tg,
      ranking: stock.ranking,
    }))
  } catch (error) {
    console.error('fetchPopularStocksByTrait error:', error)
    return []
  }
}

// [A4] 내 수익률 분포 저장
export async function saveMyStockDistribution(userId, distributions) {
  try {
    const sanitized = distributions
      .filter((item) => item.stockCode && String(item.stockCode).trim() !== '')
      .map((item) => {
        const bins = item.distribution ?? item.distributionBins ?? [0, 0, 0, 0, 0, 0] // <-- 통일
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
    console.log('✅ 내 수익률 분포 저장 성공')
  } catch (error) {
    console.error('❌ 내 수익률 분포 저장 실패:', error?.message || error)
    throw error
  }
}

// [A5] 실시간 내 보유종목 수익률 분포 계산 (통합버전)
export async function fetchMyRealTimeStockDistribution(userId) {
  try {
    const res = await axios.get('/api/ranking/analysis/my-distribution', {
      params: { userId },
    })

    return res.data.map((stock) => ({
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
  } catch (error) {
    console.error('fetchMyRealTimeStockDistribution error:', error)
    return []
  }
}
