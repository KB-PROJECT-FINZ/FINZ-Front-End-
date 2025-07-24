import axios from 'axios'

export async function fetchMyRanking(userId) {
  const res = await axios.get(`/api/ranking/user/${userId}`)
  const data = res.data

  return {
    rank: data.ranking,
    gainRate: data.gainRate,
    topPercent: data.topPercent,
    trait: data.traitGroup || 'N/A', // 보조 처리 (실제 성향)
  }
}

export async function fetchTop5Stocks(week) {
  const res = await axios.get('/api/ranking/top5', {
    params: { week },
  })

  return res.data.map((stock) => ({
    name: stock.stockName,
    gain: stock.avgGainRate,
    image: `/images/stocks/${stock.stockCode}.png`,
  }))
}

export async function fetchWeeklyRanking(week) {
  const res = await axios.get('/api/ranking/weekly', {
    params: { week },
  })

  if (!Array.isArray(res.data)) {
    console.error('Weekly ranking 응답이 배열이 아닙니다:', res.data)
    return [] // 빈 배열 반환하거나 에러 처리
  }

  return res.data.map((user) => ({
    userId: user.userId,
    nickname: user.name,
    gainRate: user.gainRate,
    trait: user.traitGroup || '기타',
    originalTrait: user.originalTrait || 'N/A',
    image: `/images/profile${(user.userId % 5) + 1}.png`,
  }))
}
export async function fetchGroupedWeeklyRanking(week) {
  const res = await axios.get('/api/ranking/weekly/grouped', {
    params: { week },
  })

  // 예: { 보수형: [ {...}, {...} ], 적극형: [...] }
  const rawGrouped = res.data
  const transformed = {}

  for (const group in rawGrouped) {
    transformed[group] = rawGrouped[group].map((user) => ({
      userId: user.userId,
      nickname: user.name,
      gainRate: user.gainRate,
      trait: group,
      originalTrait: user.originalTrait || 'N/A',
      image: `/images/profile${(user.userId % 5) + 1}.png`,
    }))
  }

  return transformed
}
