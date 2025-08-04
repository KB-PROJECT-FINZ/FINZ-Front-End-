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
          'border border-gray-400': selectedJournal && selectedJournal.id === journal.id,
        }"
        @click="selectJournal(journal)"
      >
        <!-- 날짜 + 거래내역 pill을 한 줄에 정렬 -->
        <div class="flex items-center flex-wrap gap-2 mb-1">
          <p class="font-semibold text-sm text-gray-700">
            {{ journal.journalDate }}
          </p>
          <div class="flex flex-wrap gap-1">
            <div
              v-for="(t, idx) in getTransactionsForDate(journal.journalDate)"
              :key="idx"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium shadow-sm',
                t.transactionType === 'BUY'
                  ? 'bg-red-200 text-red-800'
                  : 'bg-blue-200 text-blue-800',
              ]"
            >
              {{ t.transactionType === 'BUY' ? '매수' : '매도' }} {{ t.stockName }}
              {{ t.quantity }}주
            </div>
          </div>
        </div>

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

  <router-link :to="{ path: '/journalwrite', query: { journalDate: selectedDate } }">
    <button
      class="write-btn fixed bottom-24 right-5 w-14 h-14 rounded-full bg-indigo-500 text-white text-3xl border-none shadow-lg cursor-pointer z-10 md:bottom-24 md:right-5 sm:bottom-20 sm:right-3 sm:w-12 sm:h-12 sm:text-2xl"
      @click="goToWrite"
    >
      ＋
    </button> </router-link
  ><SuccessModal :visible="showSuccess" :message="successMessage" />
  <ConfirmModal :visible="showConfirm" @confirm="handleDelete" @cancel="showConfirm = false" />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Calendar } from 'v-calendar'
import SuccessModal from '@/components/SuccessModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const showSuccess = ref(false)
const successMessage = ref('삭제')

const showConfirm = ref(false)
const targetJournalId = ref(null)
const router = useRouter()
const journals = ref([])
const transactions = ref([])
const selectedJournal = ref(null)
const selectedDate = ref(new Date().toISOString().slice(0, 10))

onMounted(async () => {
  try {
    const journalRes = await axios.get(`/api/journals/user`, { withCredentials: true })
    journals.value = journalRes.data

    const txRes = await axios.get(`/api/trading/transactions`, { withCredentials: true })
    transactions.value = txRes.data
  } catch (err) {
    console.error('❌ 데이터 로딩 실패:', err)
  }
})

// 날짜별 동그라미 표시
const calendarAttrs = computed(() => {
  const attrs = journals.value.map((j) => ({
    key: j.id,
    dates: j.journalDate,
    dot: { color: '#6166cc', backgroundColor: '#6166cc' },
  }))
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

const selectedDateJournals = computed(() => {
  if (!selectedDate.value) return []
  return journals.value.filter((j) => j.journalDate === selectedDate.value)
})

function getTransactionsForDate(date) {
  return transactions.value.filter((t) => t.executedAt?.slice(0, 10) === date)
}
function deleteJournal(id) {
  showConfirm.value = true
  targetJournalId.value = id
}

function onDayClick(day) {
  selectedDate.value = day.id
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
async function handleDelete() {
  try {
    await axios.delete(`http://localhost:8080/api/journals/${targetJournalId.value}`)
    journals.value = journals.value.filter((j) => j.id !== targetJournalId.value)
    selectedJournal.value = null
    showConfirm.value = false
    successMessage.value = '삭제'
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 1500)
  } catch (err) {
    alert('삭제 실패')
  }
}

function goToWrite() {
  selectedJournal.value = null
}

function goBack() {
  router.push({ name: 'profile' })
}
</script>

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
