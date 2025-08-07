/**
 * 종목 코드로 분봉(1분) 차트 데이터를 조회하는 함수
 * @param {string} stockCode
 * @returns {Promise<Array>} 분봉 데이터 배열
 */
export async function fetchStockChartData(stockCode) {
  try {
    const url = `/api/chart/minute/${stockCode}`
    console.log(`[API 요청] ${stockCode} kiwoom 차트 데이터 조회 시작`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API 오류] ${response.status} ${response.statusText}:`, errorText)
      throw new Error(`백엔드 API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.rt_cd && result.rt_cd !== '0') {
      console.error('[API 오류] 응답 오류:', result.msg1)
      throw new Error(`API 오류: ${result.msg1 || 'Unknown error'}`)
    }

    if (!result || !Array.isArray(result)) {
      console.error('[API 오류] 차트 데이터가 없습니다')
      throw new Error(`API 오류: 차트 데이터가 없습니다`)
    }

    console.log(`[API 성공] ${result.length}개 데이터 수신`)
    return result
  } catch (error) {
    console.error('[API 오류] 주식 차트 데이터 조회 실패:', error.message)
    throw error
  }
}

// 일/주/월/년봉 차트 데이터 조회 (한투)
export async function fetchVariousChartData(stockCode, periodCode) {
  // 오늘 날짜를 YYYYMMDD 형식으로 반환
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  try {
    const startDate = '20150101' // 2015년 1월 1일부터 최대 가능한 갯수 호출
    const endDate = getTodayDate() // 오늘까지

    const url = `/api/chart/various/${stockCode}`
    const params = new URLSearchParams({
      periodCode,
      startDate,
      endDate,
    })

    console.log(`[API 요청] ${stockCode} ${periodCode}봉 차트 데이터 조회 시작`)
    console.log(`[요청 파라미터] startDate: ${startDate}, endDate: ${endDate}`)

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API 오류] ${response.status} ${response.statusText}:`, errorText)
      throw new Error(`백엔드 API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.rt_cd && result.rt_cd !== '0') {
      console.error('[API 오류] 응답 오류:', result.msg1)
      throw new Error(`API 오류: ${result.msg1 || 'Unknown error'}`)
    }

    if (!result.output2 || !Array.isArray(result.output2)) {
      console.error('[API 오류] 차트 데이터가 없습니다')
      throw new Error(`API 오류: 차트 데이터가 없습니다`)
    }

    console.log(`[API 성공] ${result.output2.length}개 ${periodCode}봉 데이터 수신`)
    return result
  } catch (error) {
    console.error(`[API 오류] ${periodCode}봉 차트 데이터 조회 실패:`, error.message)
    throw error
  }
}
