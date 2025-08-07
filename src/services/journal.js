import axios from 'axios'

export async function fetchJournals() {
  const res = await axios.get('/api/journals/user', { withCredentials: true })
  return res.data
}

export async function fetchTransactions() {
  const res = await axios.get('/api/trading/transactions', { withCredentials: true })
  return res.data
}

export async function deleteJournalById(id) {
  return await axios.delete(`/api/journals/${id}`)
}
export async function createJournal(data) {
  return axios.post('/api/journals', data)
}

export async function updateJournal(id, data) {
  return axios.put(`/api/journals/${id}`, data)
}
