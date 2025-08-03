import axios from 'axios'

export async function fetchLearningContents() {
  const response = await axios.get('/api/learning/contents')
  return response.data
}

export async function fetchLearningContentById(id) {
  const response = await axios.get(`/api/learning/contents/${id}`)
  return response.data
}

export async function fetchLearningQuizById(id) {
  const response = await axios.get(`/api/learning/${id}/quiz`)
  return response.data
}

export async function fetchLearningContentsByGroup(groupCode) {
  const response = await axios.get('/api/learning/contents/by-group', {
    params: { groupCode },
    withCredentials: true,
  })
  return response.data
}

export async function giveCredit(quizId, selectedAnswer) {
  const response = await axios.post('/api/learning/quiz/credit', null, {
    withCredentials: true,
    params: { quizId, selectedAnswer },
  })
  return response.data
}

export async function getUserCredit(userId) {
  const response = await axios.get(`/api/learning/user/credit`)
  return response.data
}

export async function checkQuiz(quizId) {
  const response = await axios.get('/api/learning/quiz/result', {
    withCredentials: true,
    params: { quizId },
  })
  return response.data
}
