import axios from 'axios'
import { useTradeResultModalStore } from '@/stores/tradeResultModal'

export async function checkExecution() {
  const tradeResultModal = useTradeResultModalStore()

  // const response = await axios.post('/api/stock/orders/settle')
  // const data = response.data
  // console.log(data)

  // 테스트용: 무조건 모달 띄우기
  // tradeResultModal.open('BUY', '테스트종목', true)

  // 테스트용 데이터
  const data = [
    {
      accountId: 4,
      stockCode: '035420',
      stockName: 'NAVER',
      transactionType: 'SELL',
      orderType: 'LIMIT',
      quantity: 1,
      price: 229500,
      totalAmount: 229500,
      orderCreatedAt: 1754647300000,
      orderPrice: 229500,
      transactionId: 265,
    },
    {
      accountId: 4,
      stockCode: '034020',
      stockName: '두산에너빌리티',
      transactionType: 'BUY',
      orderType: 'LIMIT',
      quantity: 1,
      price: 66400,
      totalAmount: 66400,
      orderCreatedAt: 1754647290000,
      orderPrice: 66400,
      transactionId: 266,
    },
    {
      accountId: 4,
      stockCode: '005930',
      stockName: '삼성전자',
      transactionType: 'SELL',
      orderType: 'LIMIT',
      quantity: 1,
      price: 71700,
      totalAmount: 71700,
      orderCreatedAt: 1754647273000,
      orderPrice: 71700,
      transactionId: 267,
    },
  ]

  // 체결된 거래가 여러 개일 경우를 처리
  if (Array.isArray(data) && data.length > 0) {
    let idx = 0
    function showNext() {
      const item = data[idx]
      if (!item) return

      tradeResultModal.close()
      setTimeout(() => {
        tradeResultModal.open(
          (item.transactionType || 'BUY').toUpperCase(),
          item.stockName || item.name || '',
          item.isFilled ?? true,
        )
        idx++
        if (idx < data.length) {
          setTimeout(showNext, 3500) // 다음 데이터는 3.5초 후
        } else {
          // 마지막 데이터는 transition 시간만큼만 대기 후 닫기
          setTimeout(() => {
            tradeResultModal.close()
          }, 3500) // 3.5초 후 닫기 (transition 시간 포함)
        }
      }, 300)
    }
    showNext()
  }

  return data
}
