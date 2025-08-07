<template>
  <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">투자 일지</span>
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
        <div class="flex items-center flex-wrap gap-2 mb-1">
          <p class="font-semibold text-sm text-gray-700">{{ journal.journalDate }}</p>
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
      class="write-btn absolute bottom-30 right-2 w-15 h-15 rounded-full bg-indigo-500 text-white text-3xl border-none shadow-lg cursor-pointer z-10 sm:bottom-20 sm:right-4 sm:w-12 sm:h-12 sm:text-2xl"
      @click="goToWrite"
    >
      ＋
    </button>
  </router-link>

  <SuccessModal :visible="showSuccess" :message="successMessage" />
  <ConfirmModal :visible="showConfirm" @confirm="handleDelete" @cancel="showConfirm = false" />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from 'v-calendar'
import SuccessModal from '@/components/SuccessModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { fetchJournals, fetchTransactions, deleteJournalById } from '@/services/journal.js'

const router = useRouter()

const journals = ref([])
const transactions = ref([])
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const selectedJournal = ref(null)
const showSuccess = ref(false)
const successMessage = ref('')
const showConfirm = ref(false)
const targetJournalId = ref(null)

onMounted(async () => {
  try {
    journals.value = await fetchJournals()
    transactions.value = await fetchTransactions()
  } catch (err) {
    console.error('❌ 데이터 로딩 실패:', err)
  }
})

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

const selectedDateJournals = computed(() =>
  journals.value.filter((j) => j.journalDate === selectedDate.value),
)

function getTransactionsForDate(date) {
  return transactions.value.filter((t) => t.executedAt?.slice(0, 10) === date)
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

function deleteJournal(id) {
  showConfirm.value = true
  targetJournalId.value = id
}

async function handleDelete() {
  try {
    await deleteJournalById(targetJournalId.value)
    journals.value = journals.value.filter((j) => j.id !== targetJournalId.value)
    selectedJournal.value = null
    showConfirm.value = false
    successMessage.value = '삭제 완료되었습니다.'
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
