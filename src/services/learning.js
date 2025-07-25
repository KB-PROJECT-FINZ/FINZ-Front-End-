import axios from 'axios';

export async function fetchLearningContents() {
  const response = await axios.get('/learning/contents');
  return response.data;
}

export async function fetchLearningContentById(id) {
  const response = await axios.get(`/learning/contents/${id}`);
  return response.data;
}

export async function fetchLearningQuizById(id) {
  const response = await axios.get(`/learning/${id}/quiz`);
  return response.data;
}

export async function fetchLearningContentsByGroup(groupCode) {
  const response = await axios.get('/learning/contents/by-group', {
    params: { groupCode }
  });
  return response.data;
}