import axios from 'axios'

/**
 * AI 분석 리포트 관련 API 서비스
 */
export const analysisService = {
  /**
   * 현재 로그인한 사용자의 최신 AI 분석 리포트 조회
   * @returns {Promise<Object>} 분석 리포트 데이터
   */
  async fetchLatestAnalysisReport() {
    try {
      const response = await axios.get('/api/feedback/behavior', {
        withCredentials: true, // 세션 기반 인증을 위해 필요
      })

      console.log('API 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('AI 분석 리포트 조회 실패:', error)

      if (error.response?.status === 401) {
        throw new Error('로그인이 필요합니다.')
      } else if (error.response?.status === 404) {
        throw new Error('분석 결과를 찾을 수 없습니다.')
      } else {
        throw new Error('분석 결과 조회 중 오류가 발생했습니다.')
      }
    }
  },

  /**
   * 분석 리포트 데이터를 Vue 컴포넌트에서 사용하는 형태로 변환
   * @param {Object} reportData - 백엔드에서 받은 분석 리포트 데이터
   * @returns {Object} Vue 컴포넌트용 데이터 구조
   */
  transformReportData(reportData) {
    if (!reportData || !reportData.data) {
      return null
    }

    const data = reportData.data

    return {
      stats: {
        transactionCount: data.stats?.transactionCount || 0,
        analysisPeriod: data.stats?.analysisPeriod || 0,
        startDate: data.stats?.startDate || '',
        endDate: data.stats?.endDate || '',
        totalReturn: data.stats?.totalReturn || 0.0,
      },
      aiAnalysis: {
        strategy: data.aiAnalysis?.strategy || '',
        risks: data.aiAnalysis?.risks || '',
        advice: data.aiAnalysis?.advice || '',
      },
    }
  },

  /**
   * 목데이터
   */
  getMockAnalysisData() {
    return {
      stats: {
        transactionCount: 116,
        analysisPeriod: 370,
        startDate: '2024-08-01',
        endDate: '2025-08-07',
        totalReturn: -67.27,
      },
      aiAnalysis: {
        strategy: `**단기 매매 중심의 활발한 거래 패턴**을 보이고 있습니다.

- 월평균 28건의 거래로 *높은 거래 빈도*를 유지
- 기술적 분석을 활용한 **차트 기반 매매** 선호
- 소액 분할 매수를 통한 위험 분산 시도`,
        risks: `**과도한 거래 빈도**로 인한 수수료 부담이 우려됩니다.

- 잦은 매매로 인한 **거래비용 증가**
- *감정적 매매*로 인한 손실 확대 가능성
- 충분한 분석 없는 **충동적 거래** 위험`,
        advice: `**장기 투자 관점**을 갖고 접근하시기 바랍니다.

- 월 거래 횟수를 *15건 이하*로 제한
- **포트폴리오 다양화**를 통한 위험 분산
- 손실 한도 설정으로 *리스크 관리* 강화`,
      },
    }
  },
}
