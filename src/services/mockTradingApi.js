const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'

  if (isDevelopment) {
    return '/api'
  } else {
    return '/api'
  }
}

const API_BASE_URL = getApiBaseUrl()

console.log('🔧 현재 환경:', import.meta.env.MODE)
console.log('🌐 API Base URL:', API_BASE_URL)

const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

// 시장 지수 정보 조회 (실제 백엔드 연동)
export const getMarketIndices = async () => {
  try {
    console.log('🔍 시장 지수 API 호출:', `${API_BASE_URL}/market/indices`)

    const response = await fetch(`${API_BASE_URL}/market/indices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await handleApiResponse(response)
    console.log('✅ 시장 지수 API 응답:', data)

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

    // 개발 환경에서는 에러 상세 정보 표시
    if (import.meta.env.MODE === 'development') {
      console.error('🔍 개발 환경 디버깅 정보:')
      console.error('- 백엔드 서버가 실행 중인지 확인: http://localhost:8080')
      console.error('- 프록시 설정 확인: vite.config.js')
      console.error('- CORS 설정 확인: ServletConfig.java')
    }

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

// 거래대금 순위 조회 (실제 백엔드 연동) - 탭 기능 추가
export const getVolumeRanking = async (limit = 10, blngClsCode = '3') => {
  try {
    console.log(
      '🔍 거래 순위 API 호출:',
      `${API_BASE_URL}/market/ranking/volume?limit=${limit}&blngClsCode=${blngClsCode}`,
    )

    const response = await fetch(
      `${API_BASE_URL}/market/ranking/volume?limit=${limit}&blngClsCode=${blngClsCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await handleApiResponse(response)
    console.log('✅ 거래 순위 API 응답:', data)

    // 백엔드 응답이 이미 올바른 형식이므로 그대로 사용
    return {
      success: true,
      data: data,
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 거래 순위 조회 오류:', error)

    // 개발 환경에서는 에러 상세 정보 표시
    if (import.meta.env.MODE === 'development') {
      console.error('🔍 개발 환경 디버깅 정보:')
      console.error('- 백엔드 서버 상태:', 'http://localhost:8080/api/market/health')
      console.error('- 프록시 로그를 확인하세요')
    }

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

// 시장 전체 현황 조회 (통합 API)
export const getMarketOverview = async () => {
  try {
    console.log('🔍 시장 현황 API 호출:', `${API_BASE_URL}/market/overview`)

    const response = await fetch(`${API_BASE_URL}/market/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await handleApiResponse(response)
    console.log('✅ 시장 현황 API 응답:', data)

    return {
      success: true,
      data: {
        indices: data.indices,
        topVolume: data.topVolume,
        updateTime: new Date().toISOString(),
      },
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 시장 현황 조회 오류:', error)

    // 개별 API 호출로 fallback
    const [indicesResult, volumeResult] = await Promise.all([
      getMarketIndices(),
      getVolumeRanking(10),
    ])

    return {
      success: false,
      data: {
        indices: indicesResult.data,
        topVolume: volumeResult.data,
        updateTime: new Date().toISOString(),
      },
      message: '통합 API 실패, 개별 호출로 대체',
      timestamp: new Date().toISOString(),
    }
  }
}

// 더미 데이터 생성 함수 (fallback용) - 탭별 특성 반영
const generateDummyVolumeRanking = (limit, blngClsCode = '3') => {
  const stockNames = [
    '삼성전자', 'SK하이닉스', 'NAVER', '현대차', 'LG화학',
    '삼성SDI', '카카오', '삼성바이오로직스', '셀트리온', '카카오뱅크',
    'POSCO홀딩스', 'LG에너지솔루션', '삼성물산', 'KB금융', '신한지주'
  ]

  const stockCodes = [
    '005930', '000660', '035420', '005380', '051910',
    '006400', '035720', '207940', '068270', '323410',
    '005490', '373220', '028260', '105560', '055550'
  ]

  return stockNames.slice(0, limit).map((name, index) => {
    const currentPrice = Math.floor(Math.random() * 100000) + 10000
    const volume = Math.floor(Math.random() * 50000000) + 1000000

    // 탭별로 특화된 데이터 생성
    let specialValue;
    switch (blngClsCode) {
      case '0': // 거래량
        specialValue = volume * (1.5 + Math.random() * 2) // 평균거래량 대비
        break
      case '1': // 증가율
        specialValue = Math.random() * 300 + 50 // 50~350% 증가율
        break
      case '2': // 회전율
        specialValue = Math.random() * 80 + 10 // 10~90% 회전율
        break
      case '3': // 거래대금
        specialValue = volume * currentPrice
        break
      case '4': // 대금회전율
        specialValue = Math.random() * 50 + 5 // 5~55% 대금회전율
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
      volumeRate: Math.random() * 200 + 50, // 거래량 증가율
      turnoverRate: Math.random() * 60 + 5, // 거래회전율
      amountTurnoverRate: Math.random() * 40 + 5, // 대금회전율
      rank: index + 1,
      imageUrl: `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stockCodes[index]}.png`,

      // 탭별 특화 값
      specialValue: specialValue,
      rankingType: blngClsCode
    }
  })
}

// 종목 검색 (실제 백엔드 연동)
export const searchStocks = async (query, limit = 10) => {
  try {
    if (!query || !query.trim()) {
      return { success: true, data: [] }
    }

    console.log('🔍 종목 검색 API 호출:', `${API_BASE_URL}/market/stocks/search?query=${encodeURIComponent(query)}&limit=${limit}`)

    const response = await fetch(`${API_BASE_URL}/market/stocks/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await handleApiResponse(response)
    console.log('✅ 종목 검색 API 응답:', data)

    return {
      success: true,
      data: data,
      message: 'success',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ 종목 검색 오류:', error)

    // 개발 환경에서는 에러 상세 정보 표시
    if (import.meta.env.MODE === 'development') {
      console.error('🔍 개발 환경 디버깅 정보:')
      console.error('- 백엔드 서버가 실행 중인지 확인: http://localhost:8080')
      console.error('- 종목 검색 API 엔드포인트 확인')
    }

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

// API 연결 상태 확인
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/market/health`, {
      method: 'GET',
      // 타임아웃 설정 (fetch API는 기본적으로 타임아웃이 없음)
      signal: AbortSignal.timeout(5000),
    })

    return response.ok
  } catch (error) {
    console.error('API 헬스체크 실패:', error)
    return false
  }
}

// 에러 로깅 및 사용자 알림
export const logApiError = (endpoint, error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    endpoint,
    error: error.message,
    context,
    environment: import.meta.env.MODE,
  }

  console.error('API 에러:', errorInfo)

  // 추후 에러 리포팅 서비스 연동 가능
  // errorReportingService.log(errorInfo)
}
