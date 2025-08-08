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
      class="flex items-center justify-center gap-4 w-full bg-gray-50 rounded-xl p-2 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span class="text-base font-semibold text-black">주간 AI 피드백 보기</span>
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

      <div v-if="todayGroupedTransactions.length" class="transactions-container">
        <!-- 스와이프 가능한 종목 카드 -->
        <div
          class="stock-display relative"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        >
          <div
            v-if="currentStock"
            class="stock-item bg-white p-4 rounded-lg mx-auto max-w-[400px] shadow-sm"
            :style="{ transform: `translateX(${dragOffset}px)` }"
          >
            <!-- 종목 헤더 -->
            <div class="flex items-center gap-3 mb-2">
              <span
                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="getStockImageUrl(currentStock) && !imageErrors[currentStock.stockCode]"
                  :src="getStockImageUrl(currentStock)"
                  :alt="`${currentStock.stockName} 로고`"
                  class="w-full h-full object-cover rounded-full"
                  @error="handleImageError(currentStock.stockCode)"
                />
                <span
                  v-else
                  class="w-full h-full rounded-full flex items-center justify-center text-sm font-bold border-2 text-center flex-shrink-0"
                  style="border-color: #2272eb; color: #2272eb; background: #fff"
                >
                  {{ getStockInitial(currentStock.stockName) }}
                </span>
              </span>
              <div class="flex-1">
                <div class="text-lg font-semibold text-gray-900">{{ currentStock.stockName }}</div>
              </div>
            </div>

            <!-- 매수/매도 한 줄 리스트(시간순) -->
            <div class="space-y-2 mt-1">
              <div
                v-for="(row, i) in mergedTransactions"
                :key="i"
                :class="[
                  'flex items-center justify-between p-3 rounded-lg',
                  row.type === 'BUY' ? 'bg-red-50' : 'bg-blue-50',
                ]"
              >
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      row.type === 'BUY' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
                    ]"
                  >
                    {{ row.type === 'BUY' ? '매수' : '매도' }}
                  </span>
                  <span class="text-sm text-gray-700">
                    {{ row.quantity }}주 {{ row.type === 'BUY' ? '구매' : '판매' }}
                  </span>
                </div>
                <div
                  :class="[
                    'text-sm font-semibold',
                    row.type === 'BUY' ? 'text-red-600' : 'text-blue-600',
                  ]"
                >
                  주당 {{ row.price.toLocaleString() }}원
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 인디케이터 -->
        <div v-if="todayGroupedTransactions.length > 1" class="flex justify-center mt-3">
          <div class="flex space-x-2">
            <button
              v-for="(_, index) in todayGroupedTransactions"
              :key="index"
              class="w-2 h-2 rounded-full transition-colors"
              :class="{
                'bg-indigo-500': index === currentStockIndex,
                'bg-gray-300': index !== currentStockIndex,
              }"
              @click="currentStockIndex = index"
              aria-label="go-to-stock"
            />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center text-gray-400 text-base py-6">
        거래 내역이 없습니다.
      </div>
    </div>

    <div class="today-journal mt-4 mb-2">
      <h2 class="text-lg font-bold ml-1 mb-2">오늘의 일지</h2>
      <div
        v-if="selectedDateJournals.length === 0"
        class="flex flex-col items-center text-gray-400 text-base py-6"
      >
        <span class="text-3xl mb-2">📝</span>
        지금 바로 일지를 작성해보세요!
        <button
          class="mt-4 bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition"
          @click="showWriteModal = true"
        >
          글쓰기
        </button>
      </div>
    </div>

    <div v-if="selectedDateJournals.length" class="journal-list mt-3 flex flex-col gap-3 pb-24">
      <div
        v-for="journal in selectedDateJournals"
        :key="journal.id"
        class="journal-item relative p-3 rounded-xl bg-gray-50 transition-all duration-200 hover:shadow-sm cursor-pointer"
        :class="isSelected(journal) ? 'shadow-md' : ''"
        @click="selectJournal(journal)"
      >
        <div class="mb-1 flex justify-between items-center">
          <p class="text-gray-800"><strong>감정 |</strong> {{ journal.emotion }}</p>
          <p class="font-semibold text-sm text-gray-600">{{ journal.journalDate }}</p>
        </div>

        <p class="text-gray-800"><strong>이유 |</strong> {{ journal.reason }}</p>
        <p class="text-gray-800"><strong>실수 |</strong> {{ journal.mistake }}</p>

        <!-- 액션 바: 아래에 딱 붙는 버튼 행 -->
        <div
          v-if="isSelected(journal)"
          class="mt-3 pt-2 border-t border-gray-200 flex items-center justify-end gap-2"
          @click.stop
        >
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 active:scale-[0.99] transition"
            @click="editJournal(journal)"
          >
            ✏️ 수정하기
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 active:scale-[0.99] transition"
            @click="deleteJournal(journal.id)"
          >
            🗑 삭제하기
          </button>
        </div>
      </div>
    </div>
  </div>

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
import { useRouter, useRoute } from 'vue-router'
import { Calendar } from 'v-calendar'
import SuccessModal from '@/components/SuccessModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { fetchJournals, deleteJournalById } from '@/services/journal.js'
import { useTransactionsData } from '@/services/useTranscationsData.js'
import JournalWriteModal from './JournalWriteModal.vue'
const showWriteModal = ref(false)
const { transactionsData, fetchTransactions } = useTransactionsData()
const router = useRouter()
const journals = ref([])
const transactions = ref([])
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const selectedJournal = ref(null)
const showSuccess = ref(false)
const successMessage = ref('')
const showConfirm = ref(false)
const targetJournalId = ref(null)
const currentStockIndex = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const imageErrors = ref({})
const route = useRoute()

function onDayClick(day) {
  selectedDate.value = day.id
  selectedJournal.value = null
  currentStockIndex.value = 0
}
function isSelected(journal) {
  return selectedJournal.value && selectedJournal.value.id === journal.id
}

function handleTouchStart(e) {
  const touch = e.touches[0]
  startX.value = touch.clientX
  currentX.value = touch.clientX
  isDragging.value = true
  dragOffset.value = 0
}
function handleTouchMove(e) {
  if (!isDragging.value) return
  e.preventDefault()
  const touch = e.touches[0]
  currentX.value = touch.clientX
  dragOffset.value = currentX.value - startX.value
}
function handleTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  const threshold = 50
  const diff = currentX.value - startX.value
  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentStockIndex.value > 0) {
      currentStockIndex.value--
    } else if (diff < 0 && currentStockIndex.value < todayGroupedTransactions.value.length - 1) {
      currentStockIndex.value++
    }
  }
  dragOffset.value = 0
}
function handleMouseDown(e) {
  startX.value = e.clientX
  currentX.value = e.clientX
  isDragging.value = true
  dragOffset.value = 0
}
function handleMouseMove(e) {
  if (!isDragging.value) return
  currentX.value = e.clientX
  dragOffset.value = currentX.value - startX.value
}
function handleMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  const threshold = 50
  const diff = currentX.value - startX.value
  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentStockIndex.value > 0) {
      currentStockIndex.value--
    } else if (diff < 0 && currentStockIndex.value < todayGroupedTransactions.value.length - 1) {
      currentStockIndex.value++
    }
  }
  dragOffset.value = 0
}

function getStockImageUrl(stock) {
  if (!stock || !stock.stockCode) return null
  return `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${stock.stockCode}.png`
}
function handleImageError(stockCode) {
  imageErrors.value[stockCode] = true
}
function getStockInitial(stockName) {
  if (!stockName) return ''
  return stockName.charAt(0)
}

onMounted(async () => {
  try {
    // URL 쿼리 파라미터에서 날짜 가져오기
    if (route.query.date) {
      selectedDate.value = route.query.date
    }

    await fetchTransactions()
    transactions.value = transactionsData.value || []
    journals.value = await fetchJournals()
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

  // 1) 선택 날짜만 필터
  const filtered = transactions.value.filter((t) => {
    if (!t.executedAt) return false
    const d = new Date(t.executedAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === selectedDate.value
  })

  // 2) 종목별 그룹화
  const grouped = {}
  filtered.forEach((t) => {
    if (!grouped[t.stockName]) {
      grouped[t.stockName] = { stockCode: t.stockCode, BUY: [], SELL: [] }
    }
    grouped[t.stockName][t.type].push({
      price: t.price,
      quantity: t.quantity,
      executedAt: t.executedAt,
    })
  })

  // 3) 배열로 변환
  return Object.entries(grouped).map(([stockName, data]) => ({
    stockName,
    stockCode: data.stockCode,
    buy: data.BUY.sort((a, b) => new Date(a.executedAt) - new Date(b.executedAt)),
    sell: data.SELL.sort((a, b) => new Date(a.executedAt) - new Date(b.executedAt)),
  }))
})

const currentStock = computed(() => {
  if (todayGroupedTransactions.value.length === 0) return null
  return todayGroupedTransactions.value[currentStockIndex.value]
})

//매수/매도 합쳐서 시간순 정렬된 리스트
const mergedTransactions = computed(() => {
  if (!currentStock.value) return []
  const merged = [
    ...currentStock.value.buy.map((x) => ({ ...x, type: 'BUY' })),
    ...currentStock.value.sell.map((x) => ({ ...x, type: 'SELL' })),
  ]
  return merged.sort((a, b) => new Date(a.executedAt) - new Date(b.executedAt))
})

function selectJournal(journal) {
  // 같은 카드를 다시 누르면 선택 해제
  if (selectedJournal.value && selectedJournal.value.id === journal.id) {
    selectedJournal.value = null
  } else {
    selectedJournal.value = journal
  }
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
    setTimeout(() => (showSuccess.value = false), 1500)
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stock-display {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.stock-item {
  width: 100%;
  max-width: 400px;
  transition: transform 0.1s ease-out;
  user-select: none;
  cursor: grab;
}
.stock-item:active {
  cursor: grabbing;
}
</style>
