<template>
  <div class="p-3 bg-white max-w-full">
    <div class="flex gap-3 items-start max-w-full">
      <div class="relative flex-3 w-full">
        <div
          class="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden h-11 transition-colors focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
        >
          <input
            :value="searchQuery"
            type="text"
            class="flex-1 px-3 py-3 bg-transparent border-none text-[14px] outline-none placeholder:text-gray-400"
            placeholder="종목명 또는 종목코드 입력"
            @input="handleInput"
            @focus="showResults = true"
            @blur="hideResults"
          />
          <button
            class="px-3 py-3 border-none bg-transparent text-gray-500 cursor-pointer transition-colors hover:text-blue-500"
            type="button"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- 검색 결과 드롭다운 -->
        <div
          v-if="showResults && (filteredStocks.length > 0 || isSearching)"
          class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[250px] overflow-y-auto mt-1"
        >
          <!-- 로딩 상태 -->
          <div v-if="isSearching" class="flex items-center justify-center py-4 text-gray-500">
            <div class="mini-spinner mr-2"></div>
            <span class="text-sm">검색 중...</span>
          </div>

          <!-- 검색 결과 -->
          <div
            v-else
            v-for="stock in filteredStocks"
            :key="stock.code"
            class="flex justify-between items-center px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            @mousedown="selectStock(stock)"
          >
            <div class="flex items-center gap-2">
              <!-- 종목 이미지 -->
              <span
                class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="stock.imageUrl && !imageErrors[stock.code]"
                  :src="stock.imageUrl"
                  :alt="`${stock.name} 로고`"
                  class="w-full h-full object-cover rounded-full"
                  @error="handleImageError(stock.code)"
                />
                <span
                  v-else
                  class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold"
                >
                  {{ getStockInitial(stock.name) }}
                </span>
              </span>
              <span class="font-medium text-gray-800 text-[14px]">{{ stock.name }}</span>
            </div>
            <span class="text-[12px] text-gray-500 font-mono">{{ stock.code }}</span>
          </div>

          <!-- 검색 결과 없음 -->
          <div
            v-if="!isSearching && filteredStocks.length === 0 && searchQuery.trim()"
            class="px-3 py-4 text-center text-gray-500 text-sm"
          >
            '{{ searchQuery }}'에 대한 검색 결과가 없습니다.
          </div>
        </div>
      </div>
      <div class="flex-1 flex items-center min-w-[120px]">
        <MarketIndexTicker />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchStocks } from '@/services/mockTradingApi'
import MarketIndexTicker from './MarketIndexTicker.vue'

const router = useRouter()
const searchQuery = ref('')
const showResults = ref(false)
const filteredStocks = ref([])
const isSearching = ref(false)
const imageErrors = ref({}) // 이미지 로딩 에러 추적

let searchTimeout = null

// 입력 이벤트 핸들러 - v-model 대신 사용
const handleInput = (e) => {
  searchQuery.value = e.target.value
  handleSearch()
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()

  showResults.value = true
  if (!query) {
    filteredStocks.value = []
    return
  }

  // 검색 디바운싱 (300ms 지연)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true

    try {
      console.log('🔍 종목 검색 시작:', query)
      const response = await searchStocks(query, 8)

      if (response.success && response.data) {
        filteredStocks.value = response.data
        console.log('✅ 종목 검색 성공:', response.data.length, '건')

        // 검색 결과에 이미지 URL 로깅 (디버깅용)
        response.data.forEach((stock, index) => {
          if (index < 3) { // 상위 3개만 로깅
            console.log(`🖼️ 검색결과 ${stock.name} (${stock.code}): ${stock.imageUrl || '이미지 없음'}`)
          }
        })
      } else {
        console.warn('⚠️ 종목 검색 API 실패:', response.message)
        filteredStocks.value = []
      }
    } catch (error) {
      console.error('❌ 종목 검색 오류:', error)
      filteredStocks.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const selectStock = async (stock) => {
  searchQuery.value = `${stock.name} (${stock.code})`
  showResults.value = false
  filteredStocks.value = []

  console.log('📊 선택된 종목:', stock.name, `(${stock.code})`)

  try {
    // 종목 차트 페이지로 라우팅
    await router.push({
      name: 'ChartPage',
      params: {
        stockCode: stock.code
      },
      query: {
        stockName: stock.name
      }
    })

    console.log('🔀 종목 차트 페이지로 이동:', `/mock-trading/${stock.code}/chart`)
  } catch (error) {
    console.error('❌ 라우팅 오류:', error)
  }
}

const hideResults = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

// 이미지 로딩 에러 처리
const handleImageError = (stockCode) => {
  console.warn(`🚫 검색결과 이미지 로딩 실패: ${stockCode}`)
  imageErrors.value[stockCode] = true
}

// 종목명에서 이니셜 추출 (이미지 대체용)
const getStockInitial = (stockName) => {
  if (!stockName) return '?'

  // 한글 종목명의 경우 첫 글자 사용
  if (/[가-힣]/.test(stockName)) {
    return stockName.charAt(0)
  }

  // 영문의 경우 첫 글자 대문자 사용
  return stockName.charAt(0).toUpperCase()
}

onMounted(() => {
  console.log('🔍 SearchBar 컴포넌트 초기화 - DB 기반 검색 활성화')
})
</script>

<style scoped>
.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(107, 114, 128, 0.2);
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
