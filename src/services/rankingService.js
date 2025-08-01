import axios from 'axios'
axios.defaults.withCredentials = true

// 내 랭킹 조회 (userId 쿼리 제거, baseDate만 전달)
export async function fetchMyRanking(baseDate) {
  try {
    const res = await axios.get('/api/ranking/my', { params: { baseDate } })
    const data = res.data

    return {
      rank: data.ranking,
      gainRate: data.gainRate,
      topPercent: data.topPercent,
      trait: data.riskType || '미지정',
    }
  } catch (error) {
    console.error('fetchMyRanking error:', error)
    return null
  }
}

// 인기 종목 Top5 조회 (baseDate 유지, 필요하면 백엔드 맞게 조정)
export async function fetchTop5Stocks(baseDate) {
  try {
    const res = await axios.get('/api/ranking/popular-stocks', {
      params: { baseDate },
    })

    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.avgGainRate,
      image: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
    }))
  } catch (error) {
    console.error('fetchTop5Stocks error:', error)
    return []
  }
}

// 주간 전체 랭킹 조회 (baseDate 제거, API가 쿼리 없이 작동 시)
export async function fetchWeeklyRanking() {
  try {
    const res = await axios.get('/api/ranking/weekly')
    if (!Array.isArray(res.data)) {
      console.error('Weekly ranking 응답이 배열이 아닙니다:', res.data)
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

// 성향 그룹별 랭킹 조회 (baseDate 제거)
export async function fetchGroupedWeeklyRanking() {
  try {
    const res = await axios.get('/api/ranking/weekly/grouped')

    const rawGrouped = res.data
    const transformed = {}

    for (const group in rawGrouped) {
      transformed[group] = rawGrouped[group].map((user) => ({
        userId: user.userId,
        nickname: user.nickname,
        gainRate: user.gainRate,
        trait: group,
        originalTrait: user.originalTrait,
        image: `/images/profile${(user.userId % 5) + 1}.png`,
      }))
    }

    return transformed
  } catch (error) {
    console.error('fetchGroupedWeeklyRanking error:', error)
    return {}
  }
}
//                     종목 분석 페이지

// (1) 성향별 보유 비중
export async function fetchTraitStockAnalysis(userId) {
  console.log('[DEBUG] fetchTraitStockAnalysis userId:', userId)
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

// (2) 내 수익률 분포 위치
export async function fetchMyStockDistribution(userId) {
  try {
    const res = await axios.get('/api/ranking/analysis/my-distribution', {
      params: { userId },
    })

    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.gainRate,
      positionIndex: stock.positionIndex,
      positionLabel: stock.positionLabel,
      distribution: stock.distributionBins,
      color: '#3b82f6', // 기본 파란색
    }))
  } catch (error) {
    console.error('fetchMyStockDistribution error:', error)
    return []
  }
}

// (3) 유사 성향 투자자 인기 종목
export async function fetchPopularStocksByTrait(traitGroup) {
  try {
    const res = await axios.get('/api/ranking/analysis/popular-stocks', {
      params: { traitGroup },
    })

    return res.data.map((stock) => ({
      name: stock.stockName,
      gain: stock.transactionCount, // 또는 avgGainRate가 있다면 수정
      logo: stock.stockCode
        ? `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
        : '/images/stocks/default.png',
      trait: `${stock.ranking}위`, // 예: "1위", "2위"
    }))
  } catch (error) {
    console.error('fetchPopularStocksByTrait error:', error)
    return []
  }
}
