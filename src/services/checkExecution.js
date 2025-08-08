import axios from 'axios'

export async function checkExecution() {
  const response = await axios.post('/api/stock/orders/settle')
  return response.data
}
