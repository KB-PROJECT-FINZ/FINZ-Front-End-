const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'

  if (isDevelopment) {
    return '/api'
  } else {
    return '/api'
  }
}

const API_BASE_URL = getApiBaseUrl()

const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

// 시장 지수 정보 조회
export const getMarketIndices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/market/indices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await handleApiResponse(response)

    // 백엔드 응답을 프론트엔드 형식에 맞게 변환
    return {
      success: true,
      data: [
        {
          name: data.kospi?.name || 'KOSPI',
          value: data.kospi?.value || 0,
          change: data.kospi?.change || 0,
          changePercent: data.kospi?.changePercent || 0,
          isPositive: data.kospi?.isPositive || false,
        },
        {
          name: data.kosdaq?.name || 'KOSDAQ',
          value: data.kosdaq?.value || 0,
          change: data.kosdaq?.change || 0,
          changePercent: data.kosdaq?.changePercent || 0,
          isPositive: data.kosdaq?.isPositive || false,
        },
      ],
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 시장 지수 조회 오류:', error)

    // 에러 시 더미 데이터 반환 (fallback)
    return {
      success: false,
      data: [
        {
          name: 'KOSPI',
          value: 2634.15,
          change: 15.23,
          changePercent: 0.58,
          isPositive: true,
        },
        {
          name: 'KOSDAQ',
          value: 851.47,
          change: -8.32,
          changePercent: -0.97,
          isPositive: false,
        },
      ],
      message: 'API 연결 실패, 더미 데이터 사용',
      timestamp: new Date().toISOString(),
    }
  }
}

// 거래대금 순위 조회 - 탭 기능 추가
export const getVolumeRanking = async (limit = 10, blngClsCode = '3') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/market/ranking/volume?limit=${limit}&blngClsCode=${blngClsCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const data = await handleApiResponse(response)

    return {
      success: true,
      data: data,
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 거래 순위 조회 오류:', error)

    // 에러 시 더미 데이터 반환 (fallback)
    const dummyData = generateDummyVolumeRanking(limit, blngClsCode)
    return {
      success: false,
      data: dummyData,
      message: 'API 연결 실패, 더미 데이터 사용',
      timestamp: new Date().toISOString(),
    }
  }
}

// 더미 데이터 생성 함수 (fallback용)
const generateDummyVolumeRanking = (limit, blngClsCode = '3') => {
  const stockNames = [
    '삼성전자',
    'SK하이닉스',
    'NAVER',
    '현대차',
    'LG화학',
    '삼성SDI',
    '카카오',
    '삼성바이오로직스',
    '셀트리온',
    '카카오뱅크',
    'POSCO홀딩스',
    'LG에너지솔루션',
    '삼성물산',
    'KB금융',
    '신한지주',
  ]

  const stockCodes = [
    '005930',
    '000660',
    '035420',
    '005380',
    '051910',
    '006400',
    '035720',
    '207940',
    '068270',
    '323410',
    '005490',
    '373220',
    '028260',
    '105560',
    '055550',
  ]

  return stockNames.slice(0, limit).map((name, index) => {
    const currentPrice = Math.floor(Math.random() * 100000) + 10000
    const volume = Math.floor(Math.random() * 50000000) + 1000000

    // 탭별로 특화된 데이터 생성
    let specialValue
    switch (blngClsCode) {
      case '0': // 거래량
        specialValue = volume * (1.5 + Math.random() * 2) // 평균거래량 대비
        break
      case '3': // 거래대금
        specialValue = volume * currentPrice
        break
      default:
        specialValue = volume * currentPrice
    }

    return {
      code: stockCodes[index],
      name: name,
      currentPrice: currentPrice,
      change: Math.floor(Math.random() * 5000) - 2500,
      changePercent: Math.random() * 10 - 5,
      isPositive: Math.random() > 0.5,
      tradingVolume: volume * currentPrice,
      volume: volume,
      volumeRate: Math.random() * 200 + 50,
      turnoverRate: Math.random() * 60 + 5,
      amountTurnoverRate: Math.random() * 40 + 5,
      rank: index + 1,
      imageUrl: `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stockCodes[index]}.png`,

      specialValue: specialValue,
      rankingType: blngClsCode,
    }
  })
}

// 종목 검색
export const searchStocks = async (query, limit = 10) => {
  try {
    if (!query || !query.trim()) {
      return { success: true, data: [] }
    }
    const response = await fetch(
      `${API_BASE_URL}/market/stocks/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const data = await handleApiResponse(response)

    return {
      success: true,
      data: data,
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 종목 검색 오류:', error)

    // 에러 시 더미 데이터 반환 (fallback)
    const { stockList } = await import('@/utils/dummyData')
    const filtered = stockList.filter(
      (stock) =>
        stock.name.toLowerCase().includes(query.toLowerCase()) || stock.code.includes(query),
    )

    return {
      success: false,
      data: filtered.slice(0, limit),
      message: 'API 연결 실패, 더미 데이터 사용',
      timestamp: new Date().toISOString(),
    }
  }
}
