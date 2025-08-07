<template>
  <header
    class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
  >
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
        <div class="mb-1">
          <p class="font-semibold text-sm text-gray-700">{{ journal.journalDate }}</p>
        </div>

        <div class="flex flex-wrap gap-1 mb-3 ml-2">
          <div
            v-for="(t, idx) in getCurrentPageTransactions(journal.journalDate, journal.id)"
            :key="`${journal.id}-${currentPageMap[journal.id] || 0}-${idx}`"
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-medium shadow-sm',
              t.type === 'BUY' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800',
            ]"
          >
            {{ t.type === 'BUY' ? '매수' : '매도' }} {{ t.stockName }} {{ t.quantity }}주
          </div>
        </div>
        <div class="flex gap-1 mt-1 w-full justify-center">
          <span
            v-for="(_, dotIndex) in chunkTransactions(
              getGroupedTransactionsForDate(journal.journalDate),
            )"
            :key="dotIndex"
            @click.stop="changePage(journal.id, dotIndex)"
            class="w-2 h-2 rounded-full cursor-pointer"
            :class="
              (currentPageMap[journal.id] || 0) === dotIndex
                ? 'bg-gray-800'
                : 'bg-gray-400 opacity-50'
            "
          ></span>
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

  <button
    class="write-btn absolute bottom-30 right-2 w-15 h-15 rounded-full bg-indigo-500 text-white text-3xl border-none shadow-lg cursor-pointer z-10 sm:bottom-20 sm:right-4 sm:w-12 sm:h-12 sm:text-2xl"
    @click="showWriteModal = true"
  >
    ＋
  </button>

  <JournalWriteModal
    v-if="showWriteModal"
    :id="selectedJournal?.id"
    :emotion="selectedJournal?.emotion"
    :reason="selectedJournal?.reason"
    :mistake="selectedJournal?.mistake"
    :journal-date="selectedDate"
    @close="((showWriteModal = false), (selectedJournal = null))"
    @saved="refreshJournals"
  />

  <SuccessModal :visible="showSuccess" :message="successMessage" />
  <ConfirmModal :visible="showConfirm" @confirm="handleDelete" @cancel="showConfirm = false" />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from 'v-calendar'
import SuccessModal from '@/components/SuccessModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { fetchJournals, deleteJournalById } from '@/services/journal.js'
import { useTransactionsData } from '@/services/useTranscationsData.js'
import JournalWriteModal from './JournalWriteModal.vue'
const showWriteModal = ref(false)
const { transactionsData, fetchTransactions } = useTransactionsData()
const currentPageMap = ref({})
const router = useRouter()
const journals = ref([])
const transactions = ref([])
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const selectedJournal = ref(null)
const showSuccess = ref(false)
const successMessage = ref('')
const showConfirm = ref(false)
const targetJournalId = ref(null)

//거래내역을 6개씩 나눠서 배열로 반환
function chunkTransactions(transactions, chunkSize = 6) {
  const chunks = []
  for (let i = 0; i < transactions.length; i += chunkSize) {
    chunks.push(transactions.slice(i, i + chunkSize))
  }
  return chunks
}

//날짜 클릭 시 날짜랑 일지 초기화 , currentPage를 0으로 초기화
function onDayClick(day) {
  selectedDate.value = day.id
  selectedJournal.value = null

  selectedDateJournals.value.forEach((j) => {
    currentPageMap.value[j.id] = 0
  })
}
onMounted(async () => {
  try {
    await fetchTransactions()
    transactions.value = transactionsData.value || []
    journals.value = await fetchJournals()

    // 초기 페이지맵 설정
    if (journals.value.length > 0) {
      journals.value.forEach((journal) => {
        if (!currentPageMap.value[journal.id]) {
          currentPageMap.value[journal.id] = 0
        }
      })
    }
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

//거래내역 데이터를 날짜별로 그룹화 + 같은 종목 매수/매도 시 합쳐서 거래 리스트 반환
function getGroupedTransactionsForDate(date) {
  if (!transactions.value || transactions.value.length === 0) {
    return []
  }

  const grouped = {}

  transactions.value.forEach((t) => {
    if (!t.executedAt) return

    const localDate = new Date(t.executedAt)
    const yyyy = localDate.getFullYear()
    const mm = String(localDate.getMonth() + 1).padStart(2, '0')
    const dd = String(localDate.getDate()).padStart(2, '0')
    const formattedDate = `${yyyy}-${mm}-${dd}`

    if (formattedDate !== date) return

    const key = `${t.stockCode}_${t.type}`

    if (!grouped[key]) {
      grouped[key] = {
        stockName: t.stockName,
        stockCode: t.stockCode,
        type: t.type,
        quantity: t.quantity,
      }
    } else {
      grouped[key].quantity += t.quantity
    }
  })

  return Object.values(grouped)
}

function selectJournal(journal) {
  selectedJournal.value = journal
}

function editJournal(journal) {
  selectedJournal.value = journal
  showWriteModal.value = true
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

//dot 클릭 시 해당 일지의 페이지
function changePage(journalId, pageIndex) {
  currentPageMap.value[journalId] = pageIndex
}

function getCurrentPageTransactions(journalDate, journalId) {
  const transactions = getGroupedTransactionsForDate(journalDate)
  const chunks = chunkTransactions(transactions)
  const currentPage = currentPageMap.value[journalId] || 0
  return chunks[currentPage] || []
}

function goBack() {
  router.push({ name: 'profile' })
}

function refreshJournals() {
  fetchTransactions().then(() => {
    transactions.value = transactionsData.value || []
  })
  fetchJournals().then((data) => {
    journals.value = data
  })
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
.transactions-container {
  overflow-x: auto;
  overflow-y: hidden;
  max-height: 4.5rem; /* 약 3줄 정도 높이 */
  padding-bottom: 2px;
  scroll-behavior: smooth;
}

.transactions-scroll {
  display: flex;
  flex-wrap: nowrap;
}
</style>
