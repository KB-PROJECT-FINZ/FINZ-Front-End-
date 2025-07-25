/**
 * 주식 차트 API 테스트 유틸리티
 * API 문서에 명시된 엔드포인트들의 동작을 테스트합니다.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * API 서버 헬스체크
 * @returns {Promise<object>} 헬스체크 결과
 */
export const checkApiHealth = async () => {
  console.log(`🔍 API 서버 헬스체크 시작: ${API_BASE_URL}`)

  // 일반적인 헬스체크 엔드포인트들 시도
  const healthEndpoints = [
    `${API_BASE_URL}/health`,
    `${API_BASE_URL}/actuator/health`,
    `${API_BASE_URL}/api/health`,
    `${API_BASE_URL}/`,
  ]

  for (const endpoint of healthEndpoints) {
    try {
      console.log(`🏥 헬스체크 시도: ${endpoint}`)
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
      })

      console.log(`📊 ${endpoint} 응답: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        let responseData = null

        try {
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json()
          } else {
            responseData = await response.text()
          }
        } catch {
          responseData = 'Response parsing failed'
        }

        return {
          success: true,
          endpoint,
          status: response.status,
          data: responseData,
          message: '✅ API 서버 연결 성공',
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint} 연결 실패:`, error.message)
    }
  }

  return {
    success: false,
    message: '❌ 모든 헬스체크 엔드포인트 연결 실패. API 서버가 실행 중인지 확인하세요.',
    checkedEndpoints: healthEndpoints,
  }
}

/**
 * API 요청 공통 함수
 * @param {string} url - 요청 URL
 * @param {object} options - fetch 옵션
 * @returns {Promise<object>} API 응답
 */
const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    console.log(`🔗 요청 URL: ${url}`)
    console.log(`📤 요청 옵션:`, { ...defaultOptions, ...options })

    const response = await fetch(url, { ...defaultOptions, ...options })

    // 응답 Content-Type 확인
    const contentType = response.headers.get('content-type')
    console.log(`📥 응답 Content-Type: ${contentType}`)
    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      // 에러 상태에서도 응답 내용 확인
      const errorText = await response.text()
      console.log(`❌ 에러 응답 내용:`, errorText.substring(0, 200) + '...')

      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}`,
      )
    }

    // JSON 응답인지 확인
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text()
      console.warn('⚠️ JSON이 아닌 응답 수신:', responseText.substring(0, 200) + '...')

      // HTML 응답인 경우 특별 처리
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
        throw new Error('API 서버가 HTML 페이지를 반환했습니다. 서버가 실행 중인지 확인하세요.')
      }

      throw new Error(`예상하지 못한 응답 형식입니다. Content-Type: ${contentType}`)
    }

    const data = await response.json()
    console.log(`✅ 응답 데이터 수신 성공:`, data)

    return { success: true, data, status: response.status }
  } catch (error) {
    console.error(`💥 API 요청 실패:`, error)

    // 네트워크 오류인지 확인
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: `네트워크 연결 실패: API 서버(${url})에 접근할 수 없습니다. 서버가 실행 중인지 확인하세요.`,
        status: null,
      }
    }

    return { success: false, error: error.message, status: null }
  }
} /**
 * 1. GET /api/chart/minute/{stockCode} - 현재 시각 기준 분봉 차트 데이터 조회
 * @param {string} stockCode - 종목 코드 (예: '005930')
 * @returns {Promise<object>} 테스트 결과
 */
export const testGetMinuteChart = async (stockCode = '005930') => {
  console.log(`🧪 [TEST] GET /api/chart/minute/${stockCode}`)

  const url = `${API_BASE_URL}/api/chart/minute/${stockCode}`
  const result = await apiRequest(url, { method: 'GET' })

  if (result.success) {
    console.log('✅ 현재 시각 기준 분봉 차트 조회 성공:', result.data)

    // 응답 데이터 구조 검증
    if (result.data.output1 && result.data.output2) {
      console.log('📊 output1 (종목 정보):', result.data.output1)
      console.log('📈 output2 (차트 데이터):', `${result.data.output2.length}개 데이터`)
    } else {
      console.warn('⚠️ 예상과 다른 응답 구조입니다.')
    }
  } else {
    console.error('❌ 현재 시각 기준 분봉 차트 조회 실패:', result.error)
  }

  return result
}

/**
 * 2. POST /api/chart/minute/{stockCode} - 특정 시각까지 분봉 차트 조회
 * @param {string} stockCode - 종목 코드
 * @param {string} endTime - 종료 시각 (HHMMSS 형식, 예: '153000')
 * @returns {Promise<object>} 테스트 결과
 */
export const testPostMinuteChart = async (stockCode = '005930', endTime = '153000') => {
  console.log(`🧪 [TEST] POST /api/chart/minute/${stockCode}`)

  const url = `${API_BASE_URL}/api/chart/minute/${stockCode}`
  const body = { endTime }

  const result = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (result.success) {
    console.log(`✅ 특정 시각(${endTime})까지 분봉 차트 조회 성공:`, result.data)

    if (result.data.output2) {
      console.log(`📈 차트 데이터: ${result.data.output2.length}개`)
      // 마지막 데이터의 시간 확인
      const lastData = result.data.output2[result.data.output2.length - 1]
      if (lastData && lastData.stck_cntg_hour) {
        console.log(`🕐 마지막 데이터 시간: ${lastData.stck_cntg_hour}`)
      }
    }
  } else {
    console.error('❌ 특정 시각까지 분봉 차트 조회 실패:', result.error)
  }

  return result
}

/**
 * 3. POST /api/chart/minute/{stockCode}/batch - 여러 시간대 분봉 차트 일괄 조회
 * @param {string} stockCode - 종목 코드
 * @param {Array<string>} endTimes - 종료 시각 배열 (예: ['143000', '153000'])
 * @returns {Promise<object>} 테스트 결과
 */
export const testBatchMinuteChart = async (
  stockCode = '005930',
  endTimes = ['143000', '153000'],
) => {
  console.log(`🧪 [TEST] POST /api/chart/minute/${stockCode}/batch`)

  const url = `${API_BASE_URL}/api/chart/minute/${stockCode}/batch`
  const body = { endTimes }

  const result = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (result.success) {
    console.log(`✅ 일괄 분봉 차트 조회 성공:`, result.data)

    if (Array.isArray(result.data)) {
      console.log(`📊 총 ${result.data.length}개 시간대 데이터 수신`)
      result.data.forEach((chartData, index) => {
        if (chartData.output2) {
          console.log(`📈 시간대 ${index + 1}: ${chartData.output2.length}개 데이터`)
        }
      })
    } else {
      console.warn('⚠️ 배열 형태의 응답이 아닙니다.')
    }
  } else {
    console.error('❌ 일괄 분봉 차트 조회 실패:', result.error)
  }

  return result
}

/**
 * 4. GET /api/chart/minute/{stockCode}/test - 분봉 차트 테스트
 * @param {string} stockCode - 종목 코드
 * @returns {Promise<object>} 테스트 결과
 */
export const testMinuteChartTest = async (stockCode = '005930') => {
  console.log(`🧪 [TEST] GET /api/chart/minute/${stockCode}/test`)

  const url = `${API_BASE_URL}/api/chart/minute/${stockCode}/test`
  const result = await apiRequest(url, { method: 'GET' })

  if (result.success) {
    console.log('✅ 분봉 차트 테스트 성공:', result.data)
  } else {
    console.error('❌ 분봉 차트 테스트 실패:', result.error)
  }

  return result
}

/**
 * 모든 API 엔드포인트를 순차적으로 테스트
 * @param {string} stockCode - 테스트할 종목 코드
 * @returns {Promise<object>} 전체 테스트 결과
 */
export const runAllApiTests = async (stockCode = '005930') => {
  console.log('🚀 주식 차트 API 전체 테스트 시작')
  console.log('='.repeat(50))

  const results = {}

  try {
    // 0. API 서버 헬스체크 먼저 수행
    console.log('🔍 API 서버 연결 상태 확인 중...')
    results.healthCheck = await checkApiHealth()

    if (!results.healthCheck.success) {
      console.warn('⚠️ API 서버 헬스체크 실패. 테스트를 계속 진행하지만 실패할 가능성이 높습니다.')
      console.warn(results.healthCheck.message)
    } else {
      console.log('✅ API 서버 연결 확인됨:', results.healthCheck.endpoint)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 1. 현재 시각 기준 분봉 차트 조회
    results.getCurrentChart = await testGetMinuteChart(stockCode)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 1초 대기

    // 2. 특정 시각까지 분봉 차트 조회
    results.getSpecificTimeChart = await testPostMinuteChart(stockCode, '153000')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 3. 일괄 분봉 차트 조회
    results.getBatchCharts = await testBatchMinuteChart(stockCode, ['143000', '153000'])
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 4. 분봉 차트 테스트
    results.testEndpoint = await testMinuteChartTest(stockCode)
  } catch (error) {
    console.error('🔥 테스트 실행 중 오류 발생:', error)
    results.error = error.message
  }

  console.log('='.repeat(50))
  console.log('📋 테스트 결과 요약:')

  const testNames = {
    healthCheck: 'API 서버 헬스체크',
    getCurrentChart: '현재 시각 기준 분봉 차트',
    getSpecificTimeChart: '특정 시각까지 분봉 차트',
    getBatchCharts: '일괄 분봉 차트',
    testEndpoint: '분봉 차트 테스트',
  }

  Object.entries(results).forEach(([key, result]) => {
    if (key !== 'error') {
      const status = result.success ? '✅ 성공' : '❌ 실패'
      console.log(`${testNames[key]}: ${status}`)
      if (!result.success) {
        console.log(`  └─ 오류: ${result.error}`)
      }
    }
  })

  if (results.error) {
    console.log(`전체 테스트 오류: ❌ ${results.error}`)
  }

  console.log('🏁 테스트 완료')

  return results
}

/**
 * 특정 시간 형식 생성 유틸리티
 * @param {Date} date - 날짜 객체
 * @returns {string} HHMMSS 형식 문자열
 */
export const formatTimeToHHMMSS = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}${minutes}${seconds}`
}

/**
 * 테스트용 시간 배열 생성
 * @param {number} count - 생성할 시간 개수
 * @param {number} intervalMinutes - 간격 (분)
 * @returns {Array<string>} 시간 배열
 */
export const generateTestTimes = (count = 3, intervalMinutes = 30) => {
  const times = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const testTime = new Date(now.getTime() - i * intervalMinutes * 60 * 1000)
    times.push(formatTimeToHHMMSS(testTime))
  }

  return times.reverse() // 시간순 정렬
}

// 개발 환경에서 콘솔 명령어로 테스트 실행 가능하도록 전역 등록
if (import.meta.env.DEV) {
  window.stockApiTest = {
    runAllTests: runAllApiTests,
    testGet: testGetMinuteChart,
    testPost: testPostMinuteChart,
    testBatch: testBatchMinuteChart,
    testEndpoint: testMinuteChartTest,
    generateTimes: generateTestTimes,
  }

  console.log('🔧 개발 모드: window.stockApiTest 로 API 테스트 함수들에 접근 가능')
}
