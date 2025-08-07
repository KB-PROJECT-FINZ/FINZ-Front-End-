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
    <div class="today-transactions mt-2">
      <h2 class="text-lg font-bold ml-1 mb-2">오늘의 투자 내역</h2>
      <div v-if="todayGroupedTransactions.length">
        <div
          v-for="stock in todayGroupedTransactions.slice(0, showAllStocks ? undefined : 1)"
          :key="stock.stockName"
          class="mb-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="font-semibold text-base mb-2">{{ stock.stockName }}</div>
          <div class="flex flex-row gap-4">
            <!-- 매수 테이블 -->
            <div class="flex-1 min-w-[120px]">
              <table class="w-full text-xs text-center border border-black">
                <thead>
                  <tr>
                    <th class="border border-black px-2 py-1 bg-gray-100 text-red-700" colspan="2">매수</th>
                  </tr>
                  <tr>
                    <th class="border border-black px-2 py-1 bg-gray-50">가격</th>
                    <th class="border border-black px-2 py-1 bg-gray-50">수량</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in stock.buy" :key="i">
                    <td class="border border-black px-2 py-1 text-black">{{ row.price }}원</td>
                    <td class="border border-black px-2 py-1 text-black">{{ row.quantity }}</td>
                  </tr>
                  <!-- 매수내역이 없을 때 '-' 행 제거 -->
                </tbody>
              </table>
            </div>
            <!-- 매도 테이블 -->
            <div class="flex-1 min-w-[120px]">
              <table class="w-full text-xs text-center border border-black">
                <thead>
                  <tr>
                    <th class="border border-black px-2 py-1 bg-gray-100 text-blue-700" colspan="2">매도</th>
                  </tr>
                  <tr>
                    <th class="border border-black px-2 py-1 bg-gray-50">가격</th>
                    <th class="border border-black px-2 py-1 bg-gray-50">수량</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in stock.sell" :key="i">
                    <td class="border border-black px-2 py-1 text-black">{{ row.price }}원</td>
                    <td class="border border-black px-2 py-1 text-black">{{ row.quantity }}</td>
                  </tr>
                  <!-- 매도내역이 없을 때 '-' 행 제거 -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="todayGroupedTransactions.length > 1" class="flex justify-center">
          <button
            @click="showAllStocks = !showAllStocks"
            class="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm flex items-center gap-1"
          >
            <span v-if="!showAllStocks">더보기</span>
            <span v-else>접기</span>
            <svg
              v-if="!showAllStocks"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="flex flex-col items-center text-gray-400 text-base py-6">
        거래 내역이 없습니다.
      </div>
    </div>
    <div class="today-journal mt-2 mb-2">
      <h2 class="text-lg font-bold ml-1 mb-2">오늘의 일지</h2>
      <div
        v-if="selectedDateJournals.length === 0"
        class="flex flex-col items-center text-gray-400 text-base py-6"
      >
        <span class="text-3xl mb-2">📝</span>
        지금 바로 일지를 작성해보세요!
      </div>
    </div>
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
        <div class="mb-1 flex justify-between items-center">
          <p><strong>감정 |</strong> {{ journal.emotion }}</p>
          <p class="font-semibold text-sm text-gray-700">{{ journal.journalDate }}</p>
        </div>

        <p><strong>이유 |</strong> {{ journal.reason }}</p>
        <p><strong>실수 |</strong> {{ journal.mistake }}</p>

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
const showAllStocks = ref(false)

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

const todayGroupedTransactions = computed(() => {
  if (!transactions.value || transactions.value.length === 0) return []

  // 1. 날짜 필터
  const filtered = transactions.value.filter((t) => {
    if (!t.executedAt) return false
    const localDate = new Date(t.executedAt)
    const yyyy = localDate.getFullYear()
    const mm = String(localDate.getMonth() + 1).padStart(2, '0')
    const dd = String(localDate.getDate()).padStart(2, '0')
    const formattedDate = `${yyyy}-${mm}-${dd}`
    return formattedDate === selectedDate.value
  })

  // 2. 종목별 그룹화
  const grouped = {}
  filtered.forEach((t) => {
    if (!grouped[t.stockName]) grouped[t.stockName] = { BUY: {}, SELL: {} }
    const typeGroup = grouped[t.stockName][t.type]
    if (!typeGroup[t.price]) typeGroup[t.price] = 0
    typeGroup[t.price] += t.quantity
  })

  // 3. 배열로 변환
  return Object.entries(grouped).map(([stockName, types]) => ({
    stockName,
    buy: Object.entries(types.BUY).map(([price, quantity]) => ({ price, quantity })),
    sell: Object.entries(types.SELL).map(([price, quantity]) => ({ price, quantity })),
  }))
})

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
