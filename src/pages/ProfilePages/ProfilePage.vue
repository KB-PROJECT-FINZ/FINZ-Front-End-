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
      <div class="flex items-center justify-between mb-1">
        <span class="text-2xl font-bold text-gray-900"
          >₩{{ mockTradingAmount.toLocaleString() }}</span
        >
        <button
          class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-800 transition"
          @click="goToAssetStatus"
        >
          내 자산 현황 바로가기
        </button>
      </div>
      <div
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

// 모의투자 금액 관련
const mockTradingAmount = ref(0)
const mockTradingProfitRate = ref(0)
const holdingsData = ref([])

// AssetStatus.vue와 동일한 userAccount 구조
const userAccount = ref({
  accountId: null,
  accountNumber: '',
  currentBalance: 0,
  totalAssetValue: 0,
  totalProfitLoss: 0,
  profitRate: 0,
})

// AssetStatus.vue와 동일한 수익률 계산 방식
const totalInvestment = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + (holding.averagePrice || 0) * (holding.quantity || 0)
  }, 0)
})

const totalProfitLoss = computed(() => {
  return holdingsData.value.reduce((sum, holding) => {
    return sum + (holding.profitLoss || 0)
  }, 0)
})

const calculatedProfitRate = computed(() => {
  if (totalInvestment.value === 0) return 0
  return Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2))
})

// AssetStatus.vue와 동일한 총 보유자산 계산
const stockValue = computed(() => {
  return holdingsData.value.reduce((total, holding) => {
    return total + (holding.currentValue || 0)
  }, 0)
})

const calculatedTotalAssetValue = computed(() => {
  return (userAccount.value?.currentBalance || 0) + stockValue.value
})

const buyHistory = ref([]) // 매수
const sellHistory = ref([]) // 매도

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
          
          // Holdings 데이터 설정 (수익률 계산용)
          holdingsData.value = holdings.map((holding) => ({
            stockCode: holding.stockCode,
            stockName: holding.stockName,
            quantity: holding.quantity || 0,
            averagePrice: holding.averagePrice || 0,
            currentPrice: holding.currentPrice || 0,
            currentValue: holding.currentValue || 0,
            profitLoss: holding.profitLoss || 0,
            profitRate: holding.profitRate || 0,
          }))
        } catch (holdingsError) {
          console.error('❌ Holdings 데이터 로드 실패:', holdingsError)
          console.log('📝 Holdings 없이 거래 내역만 표시')
          holdings = []
          holdingsData.value = []
        }

        const buyTransactions = response.data.filter((t) => t.transactionType === 'BUY')
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => {
          // 종목코드로 먼저 매칭 시도
          let holding = holdings.find((h) => h.stockCode === transaction.stockCode)
          
          // 종목코드로 매칭 안 되면 종목명으로 매칭 시도
          if (!holding) {
            holding = holdings.find((h) => h.stockName === transaction.stockName)
          }
          
          console.log('🔍 매수 거래 매칭:', {
            transaction: transaction.stockCode,
            transactionName: transaction.stockName,
            holding: holding ? holding.stockCode : '없음',
            holdingName: holding ? holding.stockName : '없음',
            profitRate: holding ? holding.profitRate : '없음',
            allHoldings: holdings.map(h => ({ code: h.stockCode, name: h.stockName }))
          })
          return {
            name: transaction.stockName,
            desc: `매수 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => {
          // 종목코드로 먼저 매칭 시도
          let holding = holdings.find((h) => h.stockCode === transaction.stockCode)
          
          // 종목코드로 매칭 안 되면 종목명으로 매칭 시도
          if (!holding) {
            holding = holdings.find((h) => h.stockName === transaction.stockName)
          }
          
          console.log('🔍 매도 거래 매칭:', {
            transaction: transaction.stockCode,
            transactionName: transaction.stockName,
            holding: holding ? holding.stockCode : '없음',
            holdingName: holding ? holding.stockName : '없음',
            profitRate: holding ? holding.profitRate : '없음',
            allHoldings: holdings.map(h => ({ code: h.stockCode, name: h.stockName }))
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

    // 모의투자 금액 조회
    try {
      const mockTradingResponse = await axios.get('/api/mocktrading/account', {
        withCredentials: true,
      })
      console.log('📊 모의투자 계좌 데이터:', mockTradingResponse.data)
      if (mockTradingResponse.data) {
        // userAccount 데이터 설정
        userAccount.value = {
          accountId: mockTradingResponse.data.accountId,
          accountNumber: mockTradingResponse.data.accountNumber || '',
          currentBalance: mockTradingResponse.data.currentBalance || 0,
          totalAssetValue: mockTradingResponse.data.totalAssetValue || 0,
          totalProfitLoss: mockTradingResponse.data.totalProfitLoss || 0,
          profitRate: mockTradingResponse.data.profitRate || 0,
        }
        
        // 계산된 값들 사용
        mockTradingAmount.value = calculatedTotalAssetValue.value
        mockTradingProfitRate.value = calculatedProfitRate.value
        
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
          
          // Holdings 데이터 설정 (수익률 계산용)
          holdingsData.value = holdings.map((holding) => ({
            stockCode: holding.stockCode,
            stockName: holding.stockName,
            quantity: holding.quantity || 0,
            averagePrice: holding.averagePrice || 0,
            currentPrice: holding.currentPrice || 0,
            currentValue: holding.currentValue || 0,
            profitLoss: holding.profitLoss || 0,
            profitRate: holding.profitRate || 0,
          }))
        } catch (holdingsError) {
          console.error('❌ fallback Holdings 데이터 로드 실패:', holdingsError)
          console.log('📝 fallback Holdings 없이 거래 내역만 표시')
          holdings = []
          holdingsData.value = []
        }

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const buyTransactions = response.data.filter((t) => t.transactionType === 'BUY')
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => {
          // 종목코드로 먼저 매칭 시도
          let holding = holdings.find((h) => h.stockCode === transaction.stockCode)
          
          // 종목코드로 매칭 안 되면 종목명으로 매칭 시도
          if (!holding) {
            holding = holdings.find((h) => h.stockName === transaction.stockName)
          }
          
          console.log('🔍 fallback 매수 거래 매칭:', {
            transaction: transaction.stockCode,
            transactionName: transaction.stockName,
            holding: holding ? holding.stockCode : '없음',
            holdingName: holding ? holding.stockName : '없음',
            profitRate: holding ? holding.profitRate : '없음',
            allHoldings: holdings.map(h => ({ code: h.stockCode, name: h.stockName }))
          })
          return {
            name: transaction.stockName,
            desc: `매수 ${transaction.quantity}주`,
            amount: transaction.totalAmount,
            profitRate: holding ? holding.profitRate : 0,
          }
        })
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => {
          // 종목코드로 먼저 매칭 시도
          let holding = holdings.find((h) => h.stockCode === transaction.stockCode)
          
          // 종목코드로 매칭 안 되면 종목명으로 매칭 시도
          if (!holding) {
            holding = holdings.find((h) => h.stockName === transaction.stockName)
          }
          
          console.log('🔍 fallback 매도 거래 매칭:', {
            transaction: transaction.stockCode,
            transactionName: transaction.stockName,
            holding: holding ? holding.stockCode : '없음',
            holdingName: holding ? holding.stockName : '없음',
            profitRate: holding ? holding.profitRate : '없음',
            allHoldings: holdings.map(h => ({ code: h.stockCode, name: h.stockName }))
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

    // fallback 모의투자 금액 조회
    try {
      const mockTradingResponse = await axios.get('/api/mocktrading/account', {
        withCredentials: true,
      })
      console.log('📊 fallback 모의투자 계좌 데이터:', mockTradingResponse.data)
      if (mockTradingResponse.data) {
        // userAccount 데이터 설정
        userAccount.value = {
          accountId: mockTradingResponse.data.accountId,
          accountNumber: mockTradingResponse.data.accountNumber || '',
          currentBalance: mockTradingResponse.data.currentBalance || 0,
          totalAssetValue: mockTradingResponse.data.totalAssetValue || 0,
          totalProfitLoss: mockTradingResponse.data.totalProfitLoss || 0,
          profitRate: mockTradingResponse.data.profitRate || 0,
        }
        
        // 계산된 값들 사용
        mockTradingAmount.value = calculatedTotalAssetValue.value
        mockTradingProfitRate.value = calculatedProfitRate.value
        
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
