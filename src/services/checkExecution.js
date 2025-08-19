import axios from 'axios'
import { useTradeResultModalStore } from '@/stores/tradeResultModal'

export async function checkExecution() {
  const tradeResultModal = useTradeResultModalStore()

  const response = await axios.post('/api/stock/orders/settle')
  const data = response.data
  // console.log(data)

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
