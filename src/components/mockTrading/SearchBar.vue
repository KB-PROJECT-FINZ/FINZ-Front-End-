<template>
  <div class="search-market-container">
    <div class="search-market-wrapper">
      <div class="search-section">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="종목명 또는 종목코드 입력"
            @input="handleSearch"
            @focus="showResults = true"
            @blur="hideResults"
          />
          <button class="search-button">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div v-if="showResults && filteredStocks.length > 0" class="search-results">
          <div
            v-for="stock in filteredStocks"
            :key="stock.code"
            class="search-result-item"
            @mousedown="selectStock(stock)"
          >
            <span class="stock-name">{{ stock.name }}</span>
            <span class="stock-code">{{ stock.code }}</span>
          </div>
        </div>
      </div>
      <div class="market-section">
        <MarketIndexTicker />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { stockList } from '@/utils/dummyData'
import MarketIndexTicker from './MarketIndexTicker.vue'

const searchQuery = ref('')
const showResults = ref(false)

// ✅ 간단한 로컬 필터링 (API 호출 제거)
const filteredStocks = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase()
  return stockList.filter(stock =>
    stock.name.toLowerCase().includes(query) ||
    stock.code.includes(query)
  ).slice(0, 8)
})

const handleSearch = () => {
  showResults.value = true
}

const selectStock = (stock) => {
  searchQuery.value = `${stock.name} (${stock.code})`
  showResults.value = false

  // ✅ 선택된 종목 이벤트 emit (필요시 부모 컴포넌트에서 처리)
  console.log('선택된 종목:', stock)

  // TODO: 추후 종목 상세 페이지로 라우팅 또는 부모 컴포넌트로 이벤트 전달
}

const hideResults = () => {
  // 약간의 지연을 주어 클릭 이벤트가 먼저 처리되도록 함
  setTimeout(() => {
    showResults.value = false
  }, 200)
}
</script>

<style scoped>
.search-market-container {
  padding: 12px;
  background: #ffffff;
}

.search-market-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.search-section {
  position: relative;
  flex: 3;
}

.market-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.search-input-container {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease;
  height: 44px;
}

.search-input-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-button {
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.3s ease;
}

.search-button:hover {
  color: #3b82f6;
}

.search-icon {
  width: 18px;
  height: 18px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  margin-top: 4px;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8fafc;
}

.stock-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.stock-code {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

@media (max-width: 430px) {
  .search-market-container {
    padding: 10px;
  }

  .search-market-wrapper {
    gap: 8px;
  }

  .search-input-container {
    height: 40px;
  }

  .search-input {
    padding: 10px 12px;
    font-size: 13px;
  }

  .search-button {
    padding: 10px 12px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }

  .stock-name {
    font-size: 13px;
  }

  .stock-code {
    font-size: 11px;
  }
}
</style>
