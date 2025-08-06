import { ref, computed } from 'vue'
import axios from 'axios'

/**
 * 거래 내역 데이터 관리 Composable
 *
 * - API 호출 및 데이터 변환
 * - 이미지 에러 처리
 * - 페이지네이션 로직
 * - 날짜 포맷팅 유틸리티
 */
export function useTransactionsData() {
  // ==================== 상태 관리 ====================
  const transactionsData = ref([])
  const loading = ref(false)
  const imageErrors = ref({})
  const showAll = ref(false)
  const itemsPerPage = 10

  // ==================== 계산된 속성 ====================

  /**
   * 표시할 거래 내역 수 계산
   */
  const visibleItemsCount = computed(() => {
    return showAll.value ? transactionsData.value.length : itemsPerPage
  })

  // ==================== API 호출 ====================

  /**
   * 거래 내역 데이터 불러오기
   */
  async function fetchTransactions() {
    loading.value = true
    try {
      const response = await axios.get('/api/mocktrading/transactions')

      // eslint-disable-next-line no-unused-vars
      let processedCount = 0
      // eslint-disable-next-line no-unused-vars
      let skippedCount = 0

      transactionsData.value = (response.data || []).map((transaction, index) => {
        try {
          // 날짜 우선순위: executedAt > orderCreatedAt > 현재시간
          let executedAt = transaction.executedAt || transaction.orderCreatedAt
          if (!executedAt) {
            console.warn(`⚠️ 트랜잭션 ${index + 1}: 날짜 정보 없음, 현재 시간으로 설정`, transaction)
            executedAt = new Date().toISOString()
          }

          // 가격 우선순위: price > orderPrice > totalAmount/quantity > 0
          let price = transaction.price || 0
          if (!price || price === 0) {
            if (transaction.orderPrice && transaction.orderPrice > 0) {
              price = transaction.orderPrice
            } else if (transaction.totalAmount && transaction.quantity) {
              price = Math.floor(transaction.totalAmount / transaction.quantity)
            }
          }

          const processedTransaction = {
            id: transaction.transactionId || index + 1,
            stockCode: transaction.stockCode,
            stockName: transaction.stockName,
            type: transaction.transactionType, // BUY/SELL
            quantity: transaction.quantity || 0,
            price: price,
            orderType: transaction.orderType,
            totalAmount: transaction.totalAmount || 0,
            executedAt: executedAt,
            status: transaction.status || 'EXECUTED',
            imageUrl: transaction.imageUrl || null
          }

          processedCount++
          return processedTransaction

        } catch (error) {
          console.error(`❌ 트랜잭션 ${index + 1} 변환 오류:`, error, transaction)
          skippedCount++
          return null // null 반환으로 필터링에서 제외
        }
      }).filter(transaction => transaction !== null) // null 제거

      // 날짜순 정렬 (최신순)
      transactionsData.value.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))

      // 날짜가 없는 트랜잭션들 체크
      const noDateTransactions = transactionsData.value.filter(t => !t.executedAt)
      if (noDateTransactions.length > 0) {
        console.warn('⚠️ 날짜 정보가 없는 트랜잭션들:', noDateTransactions.length, '개')
      }

    } catch (error) {
      console.error('❌ 거래 내역 데이터 로딩 실패:', error)

      // 401 인증 오류 처리
      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트')
        return
      }

      transactionsData.value = []
      alert('거래 내역 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      loading.value = false
    }
  }

  // ==================== 이미지 처리 ====================

  /**
   * 주식 이미지 URL 가져오기
   * @param {Object} transaction - 거래 정보
   * @returns {string|null} - 이미지 URL 또는 null
   */
  function getStockImageUrl(transaction) {
    if (!transaction || imageErrors.value[transaction.stockCode]) {
      return null
    }

    // 서버 제공 이미지 URL 우선
    if (transaction.imageUrl) {
      return transaction.imageUrl
    }

    // fallback: AlphaSquare CDN
    if (transaction.stockCode) {
      return `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${transaction.stockCode}.png`
    }

    return null
  }

  /**
   * 주식명에서 초성/첫글자 추출
   * @param {string} stockName - 주식명
   * @returns {string} - 초성 또는 첫글자
   */
  function getStockInitial(stockName) {
    if (!stockName) return '?'

    // 한글인 경우 첫 글자 반환
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(stockName.charAt(0))) {
      return stockName.charAt(0)
    }

    // 영문인 경우 첫 글자 대문자로 반환
    return stockName.substring(0, 1).toUpperCase()
  }

  /**
   * 이미지 로딩 실패 처리
   * @param {string} stockCode - 주식 코드
   */
  function handleImageError(stockCode) {
    if (stockCode) {
      imageErrors.value[stockCode] = true
    }
  }

  // ==================== 날짜 포맷팅 ====================

  /**
   * 날짜를 MM/DD 형식으로 포맷팅
   * @param {string} dateString - ISO 날짜 문자열
   * @returns {string} - 포맷된 날짜 (MM/DD)
   */
  function formatDateOnly(dateString) {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}`
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error)
      return ''
    }
  }

  /**
   * 거래 상태에 따른 텍스트 반환
   * @param {Object} transaction - 거래 정보
   * @returns {string} - 상태 텍스트
   */
  function getTransactionStatusText(transaction) {
    if (!transaction) return ''

    if (transaction.status === 'CANCELLED') {
      return '취소됨'
    }

    const typeText = transaction.type === 'BUY' ? '매수' :
      transaction.type === 'SELL' ? '매도' : '거래'
    const orderTypeText = transaction.orderType === 'MARKET' ? '시장가' :
      transaction.orderType === 'LIMIT' ? '지정가' : ''

    return `${typeText} ${orderTypeText}`.trim()
  }

  /**
   * 거래 상태에 따른 CSS 클래스 반환
   * @param {string} status - 거래 상태
   * @param {string} type - 거래 타입 (BUY/SELL)
   * @returns {string} - CSS 클래스
   */
  function getStatusClass(status, type) {
    if (status === 'CANCELLED') {
      return 'text-gray-400'
    }

    return type === 'BUY' ? 'text-red-600' :
      type === 'SELL' ? 'text-blue-600' :
        'text-gray-600'
  }

  // ==================== 페이지네이션 ====================

  /**
   * 페이지네이션 리셋
   */
  function resetPagination() {
    showAll.value = false
  }

  // ==================== 공개 인터페이스 ====================
  return {
    // 상태
    transactionsData,
    loading,
    imageErrors,
    showAll,
    itemsPerPage,

    // 계산된 속성
    visibleItemsCount,

    // 메서드
    fetchTransactions,
    getStockImageUrl,
    getStockInitial,
    handleImageError,
    formatDateOnly,
    getTransactionStatusText,
    getStatusClass,
    resetPagination
  }
}
