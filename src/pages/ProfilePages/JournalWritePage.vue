<template>
  <header class="header">
    <button class="back-btn" @click="goBack">&#8592;</button>
    <h1 class="app-title">투자 일지</h1>
  </header>

  <div class="journal-write-page">
    <h2>오늘의 투자 일지 작성</h2>

    <form @submit.prevent="submitJournal" class="journal-form">
      <label>감정</label>
      <input v-model="form.emotion" type="text" placeholder="예: 불안, 기쁨 등" />

      <label>이유</label>
      <textarea v-model="form.reason" placeholder="이유를 입력하세요" />

      <label>실수</label>
      <textarea v-model="form.mistake" placeholder="실수 내용을 입력하세요" />

      <label>날짜</label>
      <input v-model="form.journalDate" type="date" />

      <button type="submit">저장</button>
    </form>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
function goBack() {
  router.back()
}
const form = ref({
  emotion: '',
  reason: '',
  mistake: '',
  journalDate: '',
  userId: 1, // 하드코딩
})

// 페이지 진입 시 query 값이 있으면 폼에 세팅
onMounted(() => {
  if (route.query.emotion) form.value.emotion = route.query.emotion
  if (route.query.reason) form.value.reason = route.query.reason
  if (route.query.mistake) form.value.mistake = route.query.mistake
  if (route.query.journalDate) form.value.journalDate = route.query.journalDate
})

const submitJournal = async () => {
  try {
    if (route.query.id) {
      // 수정(put)
      await axios.put(`http://localhost:8080/api/journals/${route.query.id}`, form.value)
      alert('수정 완료!')
    } else {
      // 새로 작성(post)
      await axios.post('http://localhost:8080/api/journals', form.value)
      alert('저장 완료!')
    }
    router.push('/journal')
  } catch (err) {
    console.error(err)
    alert('저장 실패')
    router.push('/journal')
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #fff;
  padding: 18px 0 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}
.back-btn {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
}
.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
  letter-spacing: -1px;
}
.journal-write-page {
  padding: 20px;
}
.journal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  background-color: #6166cc;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>
