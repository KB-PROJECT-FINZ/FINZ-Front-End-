// 주식 관련 API 서비스 함수들

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// 공통 API 호출 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error)
    throw error
  }
}

// 종목 정보 조회 (Swagger 문서에 맞게 수정)
export async function getStockInfo(stockCode) {
  try {
    // Swagger 문서의 /api/mock/price/{code} 엔드포인트 사용
    const response = await fetch(`${API_BASE_URL}/mock/price/${stockCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('getStockInfo API 응답:', data)
    return data
  } catch (error) {
    console.error(`getStockInfo API Error:`, error)
    throw error
  }
}

// 호가 정보 조회 (매도/매수호가)
export async function getOrderBook(stockCode) {
  return await apiCall(`/stocks/${stockCode}/orderbook`)
}

// 체결 강도 조회
export async function getVolumeStrength(stockCode) {
  return await apiCall(`/stocks/${stockCode}/volume-strength`)
}

// 실시간 거래 내역 조회
export async function getRecentTrades(stockCode, limit = 5) {
  return await apiCall(`/stocks/${stockCode}/trades?limit=${limit}`)
}

// 사용자 보유 주식 정보 조회
export async function getUserHoldings(userId) {
  return await apiCall(`/users/${userId}/holdings`)
}

// 사용자 계좌 정보 조회 (구매 가능 금액)
export async function getUserAccount(userId) {
  return await apiCall(`/users/${userId}/account`)
}

// 대기중인 주문 조회
export async function getPendingOrders(userId) {
  return await apiCall(`/users/${userId}/orders/pending`)
}

// 주문 제출
export async function submitOrder(orderData) {
  return await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

// 주문 취소
export async function cancelOrder(orderId) {
  return await apiCall(`/orders/${orderId}`, {
    method: 'DELETE',
  })
}

// 시장 상태 조회
export async function getMarketStatus() {
  return await apiCall('/market/status')
}

// 실시간 데이터 WebSocket 연결 (추후 구현용)
export function connectWebSocket(stockCode, callbacks) {
  // WebSocket 연결 로직
  // 실시간 호가, 체결 내역 등 업데이트
  console.log(`WebSocket connection for ${stockCode}`, callbacks)
  // TODO: WebSocket 구현
}
