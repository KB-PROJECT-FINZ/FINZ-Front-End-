<template>
  <div class="bg-[#f7f8fa] min-h-screen pb-16">
    <!-- 상단 헤더 -->
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10"
    >
      <div class="w-10"></div>
      <span class="text-lg font-bold text-gray-800">마이페이지</span>
      <img
        src="https://cdn-icons-png.flaticon.com/512/157/157316.png"
        alt="설정 아이콘"
        class="w-6 h-6 cursor-pointer"
        @click="handleLogout"
      />
    </header>

    <!-- 프로필 박스 -->
    <section class="flex items-center bg-[#f3f6fb] rounded-2xl mx-4 my-5 px-5 py-6 shadow">
      <img
        v-if="profile.image"
        class="w-[50px] h-[50px] rounded-full object-cover mr-4"
        :src="profile.image"
        alt="프로필"
      />
      <div
        v-else
        class="w-[50px] h-[50px] rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400 mr-4"
      >
        <span>👤</span>
      </div>
      <div class="flex-1">
        <div class="text-base font-bold text-gray-900">{{ profile.name }}</div>
        <div class="text-sm text-gray-500 my-1">{{ profile.type }}</div>
        <div class="flex gap-2 mt-1">
          <span class="bg-indigo-100 text-indigo-800 rounded px-3 py-0.5 text-xs mt-1 inline-block"
            >Level {{ profile.level }}</span
          >
          <span class="bg-yellow-100 text-yellow-800 rounded px-3 py-0.5 text-xs mt-1 inline-block"
            >{{ asset.amount }}크레딧</span
          >
        </div>
      </div>
    </section>

    <!-- 모의투자 금액 카드 -->
    <section class="bg-white rounded-xl mx-4 mb-5 px-5 py-5 shadow">
      <div class="text-gray-500 text-sm mb-1">총 보유자산</div>
      
      <!-- 로딩 중일 때 스켈레톤 UI -->
      <div v-if="!dataLoaded" class="flex items-center justify-between mb-1">
        <div class="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        <button
          class="bg-gray-300 text-gray-500 rounded px-4 py-2 text-sm font-bold cursor-not-allowed"
          disabled
        >
          내 자산 현황 바로가기
        </button>
      </div>
      
      <!-- 실제 데이터 -->
      <div v-else class="flex items-center justify-between mb-1">
        <span class="text-2xl font-bold text-gray-900"
          >₩{{ calculatedTotalAssetValue.toLocaleString() }}</span
        >
        <button
          class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-800 transition"
          @click="goToAssetStatus"
        >
          내 자산 현황 바로가기
        </button>
      </div>
      
      <!-- 수익률 표시 -->
      <div v-if="dataLoaded"
        :class="
          calculatedProfitRate > 0
            ? 'text-green-500'
            : calculatedProfitRate < 0
              ? 'text-red-500'
              : 'text-gray-500'
        "
        class="text-sm font-bold ml-1"
      >
        {{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%
      </div>
      <div v-else class="w-16 h-4 bg-gray-200 rounded animate-pulse ml-1"></div>
    </section>

    <!-- 메뉴 카드 -->
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/journal"
        class="flex items-center bg-white rounded-xl shadow px-4 py-4 hover:shadow-lg transition text-inherit no-underline"
      >
        <span class="text-xl mr-4">📒</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">투자 일지</div>
          <div class="text-sm text-gray-500">나의 투자 기록을 확인해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
      <router-link
        to="/investment-test/retest"
        class="flex items-center bg-white rounded-xl shadow px-4 py-4 hover:shadow-lg transition text-inherit no-underline"
      >
        <span class="text-xl mr-4">📝</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">나의 투자 성향 알아보기</div>
          <div class="text-sm text-gray-500">투자 성향을 분석해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>

    <!-- 내 투자내역 카드 -->
    <section class="bg-white rounded-xl mx-4 mb-5 shadow overflow-hidden">
      <div class="flex items-center justify-between bg-gray-50 px-5 py-4 border-b border-gray-200">
        <div class="text-base font-bold text-gray-900">내 투자내역</div>
        <button
          class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-800 transition"
          @click="goToTransactions"
        >
          최근 투자 내역 바로가기
        </button>
      </div>
      <div class="px-5 py-4">
        <!-- 매수 내역 -->
        <div class="mb-4">
          <div class="text-sm font-bold text-red-600 mb-2 pl-1">매수 내역</div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in buyHistory"
              :key="`buy-${index}`"
              class="flex items-center justify-between bg-white rounded-lg px-3 py-3 shadow border-l-4 border-red-600 hover:shadow-md transition"
            >
              <div class="flex flex-col flex-1">
                <div class="text-sm font-bold text-gray-900 mb-0.5">{{ item.name }}</div>
                <div class="text-xs text-gray-500">{{ item.desc }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-gray-900 mb-0.5">
                  ₩{{ item.amount.toLocaleString() }}
                </div>
                <div
                  class="text-xs font-bold"
                  :class="item.profitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
                >
                  {{ item.profitRate >= 0 ? '+' : '' }}{{ item.profitRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 매도 내역 -->
        <div>
          <div class="text-sm font-bold text-blue-600 mb-2 pl-1">매도 내역</div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in sellHistory"
              :key="`sell-${index}`"
              class="flex items-center justify-between bg-white rounded-lg px-3 py-3 shadow border-l-4 border-blue-600 hover:shadow-md transition"
            >
              <div class="flex flex-col flex-1">
                <div class="text-sm font-bold text-gray-900 mb-0.5">{{ item.name }}</div>
                <div class="text-xs text-gray-500">{{ item.desc }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-gray-900 mb-0.5">
                  ₩{{ item.amount.toLocaleString() }}
                </div>
                <div
                  class="text-xs font-bold"
                  :class="item.profitRate >= 0 ? 'text-red-600' : 'text-blue-600'"
                >
                  {{ item.profitRate >= 0 ? '+' : '' }}{{ item.profitRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import FooterNavigation from '../../components/FooterNavigation.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { getUserCredit } from '../../services/learning'

const router = useRouter()

const profile = ref({
  image: '',
  name: '',
  type: '',
  level: 3,
})

const asset = ref({
  amount: 0,
  change: 2.3,
})

// AssetStatus.vue와 동일한 userAccount 구조
const userAccount = ref({
  accountId: null,
  accountNumber: '',
  currentBalance: 0,
  totalAssetValue: 0,
  totalProfitLoss: 0,
  profitRate: 0,
})

// AssetStatus.vue와 동일한 holdingsData 구조
const holdingsData = ref([])

// 로딩 상태 관리 (AssetStatus.vue와 동일)
const dataLoaded = ref(false)

// 모의투자 금액 관련 (기존 변수들 유지)
const mockTradingAmount = ref(0)
const mockTradingProfitRate = ref(0)

const buyHistory = ref([]) // 매수
const sellHistory = ref([]) // 매도

// AssetStatus.vue와 동일한 safeNumber 함수
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue
  }
  return Number(value)
}

// AssetStatus.vue와 동일한 계산 로직들
const stockValue = computed(() => {
  return holdingsData.value.reduce((total, holding) => {
    return total + safeNumber(holding.currentValue, 0)
  }, 0)
})

const totalInvestment = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + safeNumber(holding.averagePrice, 0) * safeNumber(holding.quantity, 0)
  }, 0)
})

const totalProfitLoss = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + safeNumber(holding.profitLoss, 0)
  }, 0)
})

const calculatedProfitRate = computed(() => {
  if (totalInvestment.value === 0) return 0
  return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
})

const calculatedTotalAssetValue = computed(() => {
  return safeNumber(userAccount.value?.currentBalance, 0) + stockValue.value
})

// AssetStatus.vue와 동일한 배치 가격 조회 함수
const fetchMultipleStockPrices = async (stockCodes) => {
  try {
    const codesString = stockCodes.join(',')
    const response = await axios.get(`/api/stock/prices/${codesString}`)

    if (response.data && response.data.success) {
      console.log(
        `배치 가격 조회 완료: ${response.data.successCount}/${response.data.requestedCount} 성공`,
      )

      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('⚠️ 일부 종목 조회 실패:', response.data.errors)
      }

      return response.data.data
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('❌ 배치 주식 가격 조회 실패:', error)
    return null
  }
}

// AssetStatus.vue와 동일한 보유 종목 실시간 가격 업데이트 함수
const updateHoldingsWithRealTimePrice = async (holdings) => {
  if (holdings.length === 0) return holdings

  // 모든 종목코드 추출
  const stockCodes = holdings.map((holding) => holding.stockCode)

  // 배치로 모든 종목의 가격을 한번에 조회
  const pricesData = await fetchMultipleStockPrices(stockCodes)

  if (!pricesData) {
    console.warn('⚠️ 배치 가격 조회 실패, 기존 데이터 유지')
    return holdings
  }

  const updatedHoldings = holdings.map((holding) => {
    const priceInfo = pricesData[holding.stockCode]

    if (priceInfo && priceInfo.output) {
      const output = priceInfo.output
      const currentPrice = parseInt(output.stck_prpr)

      // 현재 시세로 현재 가치 및 손익 재계산
      const totalValue = holding.quantity * currentPrice
      const totalInvestment = holding.quantity * holding.averagePrice
      const profitLoss = totalValue - totalInvestment
      const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

      return {
        ...holding,
        currentPrice: currentPrice,
        currentValue: totalValue,
        profitLoss: profitLoss,
        profitRate: Number(profitRate.toFixed(2)),
        priceChange: parseInt(output.prdy_vrss),
        changeRate: parseFloat(output.prdy_ctrt),
        changeSign: output.prdy_vrss_sign,
      }
    } else {
      // 해당 종목의 가격 조회 실패 시 기존 데이터 유지
      console.warn(`⚠️ ${holding.stockCode} 가격 조회 실패, 기존 데이터 유지`)
      return holding
    }
  })

  return updatedHoldings
}

const goToAssetStatus = () => {
  router.push('/mock-trading/asset-status')
}

const goToTransactions = () => {
  router.push('/mock-trading/transactions')
}

import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

const handleLogout = () => {
  userStore.clearUser()
  router.push('/login-form')
}

// 로컬 스토리지 및 API로 데이터 세팅
// 세션 기반 사용자 정보 로딩
onMounted(async () => {
  try {
    // 세션에서 사용자 정보 가져오기
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const data = res.data

    profile.value = {
      name: data.name,
      type: data.riskType,
      level: data.level || 3,
      image: data.profileImage || '',
    }

    //모의투자 내역
    try {
      console.log('🔍 모의투자 내역 조회 시작')
      const response = await axios.get('/api/mocktrading/transactions', { withCredentials: true })
      console.log('📊 받은 거래 데이터:', response.data)

      if (response.data && response.data.length > 0) {
        // Holdings 데이터도 함께 가져오기 (에러 처리 개선)
        let holdings = []
        try {
          const holdingsResponse = await axios.get('/api/mocktrading/holdings')
          holdings = holdingsResponse.data || []
          console.log('📊 Holdings 데이터 로드 성공:', holdings.length)
          console.log('📊 Holdings 데이터 상세:', holdings)
          
          // AssetStatus.vue와 동일한 방식으로 holdingsData 설정
          const basicHoldings = holdings.map((holding) => ({
            stockCode: holding.stockCode,
            stockName: holding.stockName,
            quantity: safeNumber(holding.quantity, 0),
            averagePrice: safeNumber(holding.averagePrice, 0),
            currentPrice: safeNumber(holding.currentPrice, 0),
            currentValue: safeNumber(holding.currentValue, 0),
            profitLoss: safeNumber(holding.profitLoss, 0),
            profitRate: safeNumber(holding.profitRate, 0),
          }))

          // 배치로 실시간 가격 업데이트
          holdingsData.value = await updateHoldingsWithRealTimePrice(basicHoldings)
          console.log('배치 실시간 가격 업데이트 완료')
        } catch (holdingsError) {
          console.error('❌ Holdings 데이터 로드 실패:', holdingsError)
          console.log('📝 Holdings 없이 거래 내역만 표시')
          holdings = []
          holdingsData.value = []
        }

        const buyTransactions = response.data.filter((t) => t.transactionType === 'BUY')
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        // 실시간 가격 업데이트 후 holdingsData를 사용하여 수익률 계산
        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => {
          const holding = holdingsData.value.find((h) => h.stockCode === transaction.stockCode)
          console.log('🔍 매수 거래 매칭:', {
            transaction: transaction.stockCode,
            holding: holding ? holding.stockCode : '없음',
            profitRate: holding ? holding.profitRate : '없음',
          })
          return {
            name: transaction.stockName,
            desc: `매수 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => {
          const holding = holdingsData.value.find((h) => h.stockCode === transaction.stockCode)
          console.log('🔍 매도 거래 매칭:', {
            transaction: transaction.stockCode,
            holding: holding ? holding.stockCode : '없음',
            profitRate: holding ? holding.profitRate : '없음',
          })
          return {
            name: transaction.stockName,
            desc: `매도 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
      } else {
        // 데이터가 없으면 빈 배열로 설정
        console.log('📝 거래 내역 없음')
        buyHistory.value = []
        sellHistory.value = []
      }
    } catch (e) {
      console.error('❌ 모의투자 내역 로딩 실패:', e)
      // 에러 시 빈 배열로 설정
      console.log('📝 에러로 인해 빈 배열 설정')
      buyHistory.value = []
      sellHistory.value = []
    }

    // 크레딧 조회 및 보유자산 계산
    const totalCredit = await getUserCredit(data.userId)
    asset.value.amount = totalCredit // 크레딧 그대로 사용

    // AssetStatus.vue와 동일한 모의투자 계좌 정보 로드
    try {
      const mockTradingResponse = await axios.get('/api/mocktrading/account', {
        withCredentials: true,
      })
      console.log('📊 모의투자 계좌 데이터:', mockTradingResponse.data)
      if (mockTradingResponse.data) {
        // userAccount 데이터 설정 (AssetStatus.vue와 동일)
        userAccount.value = {
          accountId: mockTradingResponse.data.accountId,
          accountNumber: mockTradingResponse.data.accountNumber || '',
          currentBalance: safeNumber(mockTradingResponse.data.currentBalance, 0),
          totalAssetValue: safeNumber(mockTradingResponse.data.totalAssetValue, 0),
          totalProfitLoss: safeNumber(mockTradingResponse.data.totalProfitLoss, 0),
          profitRate: safeNumber(mockTradingResponse.data.profitRate, 0),
        }
        
        // 계산된 값들 사용 (기존 변수들도 유지)
        mockTradingAmount.value = calculatedTotalAssetValue.value
        mockTradingProfitRate.value = calculatedProfitRate.value
        
        // 데이터 로딩 완료
        dataLoaded.value = true
        
        console.log('💰 설정된 값들:', {
          currentBalance: userAccount.value.currentBalance,
          stockValue: stockValue.value,
          calculatedTotalAssetValue: calculatedTotalAssetValue.value,
          calculatedProfitRate: calculatedProfitRate.value
        })
      }
    } catch (error) {
      console.log('모의투자 금액 조회 실패:', error)
      mockTradingAmount.value = 0
      mockTradingProfitRate.value = 0
    }
  } catch (e) {
    console.error('❌ 세션 기반 사용자 정보 로딩 실패:', e)

    // 세션 실패 시 로컬스토리지 fallback
    profile.value.name = localStorage.getItem('name') || '사용자'
    profile.value.type = localStorage.getItem('riskType') || '정보 없음'

    const userId = Number(localStorage.getItem('userId') || 1)
    try {
      console.log('🔍 fallback 모의투자 내역 조회 시작')
      const response = await axios.get('/api/mocktrading/transactions', { withCredentials: true })
      console.log('📊 fallback 받은 거래 데이터:', response.data)

      if (response.data && response.data.length > 0) {
        // Holdings 데이터도 함께 가져오기 (에러 처리 개선)
        let holdings = []
        try {
          const holdingsResponse = await axios.get('/api/mocktrading/holdings')
          holdings = holdingsResponse.data || []
          console.log('📊 fallback Holdings 데이터 로드 성공:', holdings.length)
          console.log('📊 fallback Holdings 데이터 상세:', holdings)
          
          // 기본 holdings 데이터만 설정 (실시간 가격 업데이트 제거)
          holdingsData.value = holdings.map((holding) => ({
            stockCode: holding.stockCode,
            stockName: holding.stockName,
            quantity: safeNumber(holding.quantity, 0),
            averagePrice: safeNumber(holding.averagePrice, 0),
            currentPrice: safeNumber(holding.currentPrice, 0),
            currentValue: safeNumber(holding.currentValue, 0),
            profitLoss: safeNumber(holding.profitLoss, 0),
            profitRate: safeNumber(holding.profitRate, 0),
          }))
          console.log('fallback 기본 holdings 데이터 설정 완료')
        } catch (holdingsError) {
          console.error('❌ fallback Holdings 데이터 로드 실패:', holdingsError)
          console.log('📝 fallback Holdings 없이 거래 내역만 표시')
          holdings = []
          holdingsData.value = []
        }

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const buyTransactions = response.data.filter((t) => t.transactionType === 'BUY')
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        // 실시간 가격 업데이트 후 holdingsData를 사용하여 수익률 계산
        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => {
          const holding = holdingsData.value.find((h) => h.stockCode === transaction.stockCode)
          console.log('🔍 fallback 매수 거래 매칭:', {
            transaction: transaction.stockCode,
            holding: holding ? holding.stockCode : '없음',
            profitRate: holding ? holding.profitRate : '없음',
          })
          return {
            name: transaction.stockName,
            desc: `매수 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => {
          const holding = holdingsData.value.find((h) => h.stockCode === transaction.stockCode)
          console.log('🔍 fallback 매도 거래 매칭:', {
            transaction: transaction.stockCode,
            holding: holding ? holding.stockCode : '없음',
            profitRate: holding ? holding.profitRate : '없음',
          })
          return {
            name: transaction.stockName,
            desc: `매도 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
        console.log('✅ fallback 변환된 투자 내역:', buyHistory.value, sellHistory.value)
      } else {
        // 데이터가 없으면 빈 배열로 설정
        console.log('📝 fallback 내역 없음')
        buyHistory.value = []
        sellHistory.value = []
      }
    } catch (e) {
      console.error('❌ fallback 모의투자 내역 로딩 실패:', e)
      // 에러 시에도 빈 배열로 설정
      console.log('📝 fallback 에러로 인해 빈 배열 설정')
      buyHistory.value = []
      sellHistory.value = []
    }

    // 세션 실패 시에도 크레딧 조회 시도
    try {
      const totalCredit = await getUserCredit(userId) // fallback의 userId 사용
      asset.value.amount = totalCredit // 크레딧 그대로 사용
    } catch (err) {
      console.error('❌ 크레딧 조회 에러:', err)
      asset.value.amount = 0
    }

    // fallback 모의투자 금액 조회 (AssetStatus.vue와 동일한 방식)
    try {
      const mockTradingResponse = await axios.get('/api/mocktrading/account', {
        withCredentials: true,
      })
      if (mockTradingResponse.data) {
        // userAccount 데이터 설정 (AssetStatus.vue와 동일)
        userAccount.value = {
          accountId: mockTradingResponse.data.accountId,
          accountNumber: mockTradingResponse.data.accountNumber || '',
          currentBalance: safeNumber(mockTradingResponse.data.currentBalance, 0),
          totalAssetValue: safeNumber(mockTradingResponse.data.totalAssetValue, 0),
          totalProfitLoss: safeNumber(mockTradingResponse.data.totalProfitLoss, 0),
          profitRate: safeNumber(mockTradingResponse.data.profitRate, 0),
        }
        
        // 계산된 값들 사용 (기존 변수들도 유지)
        mockTradingAmount.value = calculatedTotalAssetValue.value
        mockTradingProfitRate.value = calculatedProfitRate.value
        
        // 데이터 로딩 완료
        dataLoaded.value = true
        
        console.log('💰 fallback 설정된 값들:', {
          currentBalance: userAccount.value.currentBalance,
          stockValue: stockValue.value,
          calculatedTotalAssetValue: calculatedTotalAssetValue.value,
          calculatedProfitRate: calculatedProfitRate.value
        })
      }
    } catch (error) {
      console.log('fallback 모의투자 금액 조회 실패:', error)
      mockTradingAmount.value = 0
      mockTradingProfitRate.value = 0
    }
  }
})
</script>
