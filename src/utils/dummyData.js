// 코스피/코스닥 지수 더미데이터
export const marketIndices = [
  {
    name: 'KOSPI',
    value: 2634.15,
    change: 15.23,
    changePercent: 0.58,
    isPositive: true
  },
  {
    name: 'KOSDAQ',
    value: 851.47,
    change: -8.32,
    changePercent: -0.97,
    isPositive: false
  }
]

// 실시간 차트용 더미데이터 생성 함수
export const generateChartData = (points = 50) => {
  const data = []
  const now = new Date()
  let basePrice = 50000

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000) // 1분 간격
    const variation = (Math.random() - 0.5) * 1000 // ±500 변동
    basePrice += variation

    data.push({
      time: time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      price: Math.round(basePrice),
      timestamp: time.getTime()
    })
  }

  return data
}

// 실시간 업데이트용 새 데이터 포인트 생성
export const generateNewDataPoint = (lastPrice) => {
  const now = new Date()
  const variation = (Math.random() - 0.5) * 1000
  const newPrice = lastPrice + variation

  return {
    time: now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    price: Math.round(newPrice),
    timestamp: now.getTime()
  }
}

// 검색용 더미 종목 데이터
export const stockList = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '005380', name: '현대차' },
  { code: '051910', name: 'LG화학' },
  { code: '006400', name: '삼성SDI' },
  { code: '035720', name: '카카오' },
  { code: '207940', name: '삼성바이오로직스' },
  { code: '068270', name: '셀트리온' },
  { code: '323410', name: '카카오뱅크' }
]
