import axios from 'axios'

export async function fetchMyRanking(userId) {
  try {
    const res = await axios.get('/api/ranking/my', {
      params: { userId },
    })

    const data = res.data

    return {
      rank: data.ranking,
      gainRate: data.gainRate,
      topPercent: data.topPercent,
      trait: data.traitGroup || 'N/A',
    }
  } catch (error) {
    console.error('fetchMyRanking error:', error)
    return null
  }
}

export async function fetchTop5Stocks() {
  try {
    const res = await axios.get('/api/ranking/popular-stocks')
    console.log('Top5 응답:', res.data)

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

export async function fetchWeeklyRanking() {
  try {
    const res = await axios.get('/api/ranking/all')

    if (!Array.isArray(res.data)) {
      console.error('Weekly ranking 응답이 배열이 아닙니다:', res.data)
      return []
    }

    return res.data.map((user) => ({
      userId: user.userId,
      nickname: user.name,
      gainRate: user.gainRate,
      trait: user.traitGroup || '기타',
      originalTrait: user.originalTrait || 'N/A',
      // user 객체에 stockCode 필드 없으면 기본 프로필 이미지로 처리
      image: `/images/profile${(user.userId % 5) + 1}.png`,
    }))
  } catch (error) {
    console.error('fetchWeeklyRanking error:', error)
    return []
  }
}

export async function fetchGroupedWeeklyRanking() {
  try {
    const res = await axios.get('/api/ranking/weekly/grouped')

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
  } catch (error) {
    console.error('fetchGroupedWeeklyRanking error:', error)
    return {}
  }
}
