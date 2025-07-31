<template>
  <header class="header">
    <button class="back-btn" @click="goBack">&#8592;</button>
    <h1 class="app-title">투자 일지</h1>
  </header>
  <div class="journal-page">
    <router-link to="/feedback" class="action-btn">
      <span class="action-icon">📊</span>
      <div class="action-texts">
        <span class="action-title">AI 피드백 보러가기</span>
      </div>
    </router-link>
    <Calendar
      class="custom-calendar"
      :attributes="calendarAttrs"
      @dayclick="onDayClick"
      is-expanded
      :title-position="'center'"
      :show-arrows="true"
      :first-day-of-week="0"
    />
    <div v-if="selectedDateJournals.length" class="journal-list">
      <div
        v-for="journal in selectedDateJournals"
        :key="journal.id"
        class="journal-item"
        :class="{ selected: selectedJournal && selectedJournal.id === journal.id }"
        @click="selectJournal(journal)"
      >
        <p>
          <strong>{{ journal.journalDate }}</strong>
        </p>
        <p>감정: {{ journal.emotion }}</p>
        <p>이유: {{ journal.reason }}</p>
        <p>실수: {{ journal.mistake }}</p>
        <div v-if="selectedJournal && selectedJournal.id === journal.id" class="edit-delete-btns">
          <button class="edit-btn" @click.stop="editJournal(journal)">수정하기</button>
          <button class="delete-btn" @click.stop="deleteJournal(journal.id)">삭제하기</button>
        </div>
      </div>
    </div>
  </div>
  <router-link to="/journalwrite">
    <button class="write-btn" @click="goToWrite">＋</button>
  </router-link>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Calendar } from 'v-calendar'
const journals = ref([])
const selectedJournal = ref(null)
const router = useRouter()
const userId = ref(null)
const selectedDate = ref(new Date().toISOString().slice(0, 10)) // 오늘 날짜로 초기화

onMounted(async () => {
  try {
    const journalRes = await axios.get(`/api/journals/user`, {
      withCredentials: true,
    })
    journals.value = journalRes.data
  } catch (err) {
    console.error('❌ 유저 또는 일지 로딩 실패:', err)
  }
})
// 달력에 동그라미 표시
const calendarAttrs = computed(() => {
  const attrs = journals.value.map((j) => ({
    key: j.id,
    dates: j.journalDate,
    dot: { color: '#6166cc', backgroundColor: '#6166cc' },
  }))
  // 선택된 날짜에 동그라미(배경색) 표시
  if (selectedDate.value) {
    attrs.push({
      key: 'selected',
      dates: selectedDate.value,
      highlight: {
        color: '#6166cc',
        fillMode: 'solid',
        contentClass: 'selected-date-circle',
      },
    })
  }
  return attrs
})

// 날짜별로 해당 일지 필터링
const selectedDateJournals = computed(() => {
  if (!selectedDate.value) return []
  return journals.value.filter((j) => j.journalDate === selectedDate.value)
})

function onDayClick(day) {
  selectedDate.value = day.id // v-calendar@next는 day.id가 'YYYY-MM-DD'
  selectedJournal.value = null
}

function selectJournal(journal) {
  selectedJournal.value = journal
}

function editJournal(journal) {
  router.push({
    path: '/journalwrite',
    query: {
      id: journal.id,
      emotion: journal.emotion,
      reason: journal.reason,
      mistake: journal.mistake,
      journalDate: journal.journalDate,
    },
  })
}

async function deleteJournal(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await axios.delete(`http://localhost:8080/api/journals/${id}`)
      journals.value = journals.value.filter((j) => j.id !== id)
      selectedJournal.value = null
    } catch (err) {
      alert('삭제 실패')
    }
  }
}

function goToWrite() {
  selectedJournal.value = null
}
function goBack() {
  router.back()
}
</script>

<!-- scoped 제거함 -->
<style>
@import 'v-calendar/style.css';

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
.profile-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #222;
}
.journal-page {
  padding: 16px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 28px;
}

.action-texts {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.custom-calendar {
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
}

/* 핵심: v-calendar 내부 컨테이너 너비 잡아줌 */
.vc-container {
  width: 100% !important;
}

/* 선택된 날짜 하이라이트 */
.selected-date-circle {
  color: #fff !important;
  border-radius: 50% !important;
}

.journal-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 100px;
}
.journal-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}
.journal-item.selected {
  border: 2px solid #6166cc;
}
.edit-delete-btns {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.edit-btn {
  background: #6166cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  margin-right: 8px;
  cursor: pointer;
}
.delete-btn {
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
}
.edit-btn:hover {
  background: #4b50a7;
}
.delete-btn:hover {
  background: #d9363e;
}
.write-btn {
  position: absolute;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #6166cc;
  color: white;
  font-size: 28px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10;
}
@media (max-width: 430px) {
  .write-btn {
    right: 12px;
    bottom: 80px;
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
</style>
