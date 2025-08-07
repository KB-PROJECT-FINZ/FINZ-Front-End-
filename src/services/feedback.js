import axios from 'axios'

export async function fetchAiFeedback() {
  const res = await axios.get('/api/gpt')
  return res.data
}
export async function fetchFeedbackList() {
  const res = await axios.get('/api/feedback', { withCredentials: true })
  return res.data
}
