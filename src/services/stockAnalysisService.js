// stockAnalysisService.js
import axios from 'axios'
import { useAssetDataStore } from '@/services/useAssetData'
axios.defaults.withCredentials = true

// [A1] 성향별 보유 비중
export async function fetchTraitStockAnalysis(userId) {
  try {
    const res = await axios.get('/api/ranking/analysis/trait-stock', {
      params: { userId },
    })
    return res.data.map((item) => ({
      name: item.name,
      gain: item.gain,
      logo: item.logo,
      traitRatio: {
        보수형: item.conservativeRatio,
        균형형: item.balancedRatio,
        공격형: item.aggressiveRatio,
        특수형: item.specialRatio,
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
    console.log('📦 내 수익률 분포 응답:', res.data)
    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.gain,
      positionIndex: stock.positionIndex,
      positionLabel: stock.positionLabel,
      distribution: [stock.bin0, stock.bin1, stock.bin2, stock.bin3, stock.bin4, stock.bin5],
      color: stock.color || '#3b82f6',
    }))
  } catch (error) {
    console.error('❌ fetchMyStockDistribution error:', error)
    return []
  }
}

// [A3] 유사 성향 투자자 인기 종목
export async function fetchPopularStocksByTrait(traitGroup) {
  try {
    const res = await axios.get('/api/ranking/analysis/popular-stocks', {
      params: { traitGroup },
    })
    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.transactionCount,
      logo: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
      trait: traitGroup,
    }))
  } catch (error) {
    console.error('fetchPopularStocksByTrait error:', error)
    return []
  }
}

// [A4] 내 수익률 분포 저장
export async function saveMyStockDistribution(userId, distributions) {
  try {
    // distributions 배열 내 각 객체의 필수 필드 존재 확인 및 기본값 보정
    const sanitized = distributions
      // stockCode가 없거나 빈 문자열인 항목은 제외
      .filter((item) => item.stockCode && String(item.stockCode).trim() !== '')
      .map((item) => ({
        stockCode: item.stockCode,
        stockName: item.stockName,
        gainRate: item.gainRate,
        positionIndex: item.positionIndex,
        positionLabel: item.positionLabel,
        bin0: item.distributionBins?.[0] ?? 0,
        bin1: item.distributionBins?.[1] ?? 0,
        bin2: item.distributionBins?.[2] ?? 0,
        bin3: item.distributionBins?.[3] ?? 0,
        bin4: item.distributionBins?.[4] ?? 0,
        bin5: item.distributionBins?.[5] ?? 0,
        color: item.color || '#3b82f6',
      }))

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
    const assetStore = useAssetDataStore()

    if (userId) {
      // userId가 있으면 명시적으로 로드
      await assetStore.loadUserData(userId)
    } else {
      // 없으면 기본 로드
      await assetStore.loadUserData()
    }

    console.log('holdingsData 값:', assetStore.holdingsData.value)

    if (!assetStore.holdingsData.value || assetStore.holdingsData.value.length === 0) {
      console.warn('holdingsData가 비어있거나 데이터가 없습니다!')
      return []
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
