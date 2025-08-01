<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-none border-none text-2xl text-gray-800 cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">투자 일지</h1>
  </header>
  <div class="journal-page px-4 py-4">
    <router-link
      to="/feedback"
      class="flex items-center gap-4 w-full bg-white rounded-xl p-4 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span class="text-3xl">📊</span>
      <div class="flex flex-col items-start">
        <span class="text-base font-semibold text-gray-800">AI 피드백 보러가기</span>
      </div>
    </router-link>
    <Calendar
      class="custom-calendar w-full mt-4 mb-4"
      :attributes="calendarAttrs"
      @dayclick="onDayClick"
      is-expanded
      :title-position="'center'"
      :show-arrows="true"
      :first-day-of-week="0"
    />
    <div v-if="selectedDateJournals.length" class="journal-list mt-3 flex flex-col gap-3 pb-24">
      <div
        v-for="journal in selectedDateJournals"
        :key="journal.id"
        class="journal-item bg-gray-100 p-3 rounded-lg"
        :class="{
          'border-2 border-indigo-500': selectedJournal && selectedJournal.id === journal.id,
        }"
        @click="selectJournal(journal)"
      >
        <p>
          <strong>{{ journal.journalDate }}</strong>
        </p>
        <p>감정: {{ journal.emotion }}</p>
        <p>이유: {{ journal.reason }}</p>
        <p>실수: {{ journal.mistake }}</p>
        <div
          v-if="selectedJournal && selectedJournal.id === journal.id"
          class="edit-delete-btns flex justify-between mt-2"
        >
          <button
            class="edit-btn bg-indigo-500 text-white rounded px-4 py-1 mr-2 hover:bg-indigo-700"
            @click.stop="editJournal(journal)"
          >
            수정하기
          </button>
          <button
            class="delete-btn bg-red-500 text-white rounded px-4 py-1 hover:bg-red-700"
            @click.stop="deleteJournal(journal.id)"
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  </div>
  <router-link to="/journalwrite">
    <button
      class="write-btn fixed bottom-24 right-5 w-14 h-14 rounded-full bg-indigo-500 text-white text-3xl border-none shadow-lg cursor-pointer z-10 md:bottom-24 md:right-5 sm:bottom-20 sm:right-3 sm:w-12 sm:h-12 sm:text-2xl"
      @click="goToWrite"
    >
      ＋
    </button>
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

<!-- Tailwind로 커스텀해야 하는 부분(예: v-calendar 내부)은 아래처럼 추가로 덮어써도 됩니다 -->
<style>
@import 'v-calendar/style.css';
.selected-date-circle {
  color: #fff !important;
  border-radius: 50% !important;
}
.vc-container {
  width: 100% !important;
}
</style>
