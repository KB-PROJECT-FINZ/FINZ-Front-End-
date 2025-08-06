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
          <span class="bg-indigo-100 text-indigo-800 rounded px-3 py-0.5 text-xs mt-1 inline-block">
            Level {{ profile.level }}
          </span>
          <span class="bg-yellow-100 text-yellow-800 rounded px-3 py-0.5 text-xs mt-1 inline-block">
            {{ asset.amount }}크레딧
          </span>
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
        <span class="text-2xl font-bold text-gray-900">
          {{ calculatedTotalAssetValue.toLocaleString() }}원
        </span>
        <button
          class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-800 transition"
          @click="goToAssetStatus"
        >
          내 자산 현황 바로가기
        </button>
      </div>

      <!-- 수익률 표시 -->
      <div
        v-if="dataLoaded"
        :class="
          calculatedProfitRate > 0
            ? 'text-red-500'
            : calculatedProfitRate < 0
              ? 'text-blue-500'
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
        to="/risk-profile"
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
                <div class="text-sm font-bold text-gray-900">
                  {{ item.amount.toLocaleString() }}원
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
                <div class="text-sm font-bold text-gray-900">
                  {{ item.amount.toLocaleString() }}원
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
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const profile = ref({ image: '', name: '', type: '', level: 3 })
const asset = ref({ amount: 0 })
const userAccount = ref({
  accountId: null,
  accountNumber: '',
  currentBalance: 0,
  totalAssetValue: 0,
  totalProfitLoss: 0,
  profitRate: 0,
})
const holdingsData = ref([])
const dataLoaded = ref(false)
const buyHistory = ref([])
const sellHistory = ref([])

const safeNumber = (v, d = 0) => (isNaN(v) || v == null ? d : Number(v))

const stockValue = computed(() =>
  holdingsData.value.reduce((t, h) => t + safeNumber(h.currentValue), 0),
)
const totalInvestment = computed(() =>
  holdingsData.value.reduce((s, h) => s + safeNumber(h.averagePrice) * safeNumber(h.quantity), 0),
)
const totalProfitLoss = computed(() =>
  holdingsData.value.reduce((s, h) => s + safeNumber(h.profitLoss), 0),
)
const calculatedProfitRate = computed(() =>
  totalInvestment.value === 0
    ? 0
    : Number(((totalProfitLoss.value / totalInvestment.value) * 100).toFixed(2)),
)
const calculatedTotalAssetValue = computed(
  () => safeNumber(userAccount.value.currentBalance) + stockValue.value,
)

const fetchMultipleStockPrices = async (codes) => {
  try {
    const res = await axios.get(`/api/stock/prices/${codes.join(',')}`)
    return res.data?.data || null
  } catch (e) {
    console.error('주식 가격 조회 실패:', e)
    return null
  }
}

const updateHoldingsWithRealTimePrice = async (holdings) => {
  const prices = await fetchMultipleStockPrices(holdings.map((h) => h.stockCode))
  return holdings.map((h) => {
    const p = prices?.[h.stockCode]?.output
    if (!p) return h
    const cur = parseInt(p.stck_prpr)
    const total = cur * h.quantity
    const invest = h.averagePrice * h.quantity
    const loss = total - invest
    return {
      ...h,
      currentPrice: cur,
      currentValue: total,
      profitLoss: loss,
      profitRate: invest ? Number(((loss / invest) * 100).toFixed(2)) : 0,
    }
  })
}

const goToAssetStatus = () => router.push('/mock-trading/asset-status')
const goToTransactions = () => router.push('/mock-trading/transactions')
const handleLogout = () => {
  userStore.clearUser()
  router.push('/login-form')
}

onMounted(async () => {
  try {
    const me = await axios.get('/api/auth/me', { withCredentials: true })
    profile.value = {
      name: me.data.name,
      type: me.data.riskType,
      level: me.data.level || 3,
      image: me.data.profileImage || '',
    }

    const [credit, accountRes, txRes, holdingsRes] = await Promise.all([
      getUserCredit(me.data.userId),
      axios.get('/api/mocktrading/account', { withCredentials: true }),
      axios.get('/api/mocktrading/transactions', { withCredentials: true }),
      axios.get('/api/mocktrading/holdings'),
    ])

    asset.value.amount = credit
    userAccount.value = {
      ...accountRes.data,
      currentBalance: safeNumber(accountRes.data.currentBalance),
      totalAssetValue: safeNumber(accountRes.data.totalAssetValue),
      totalProfitLoss: safeNumber(accountRes.data.totalProfitLoss),
      profitRate: safeNumber(accountRes.data.profitRate),
    }

    const processed = holdingsRes.data.map((h) => ({
      stockCode: h.stockCode,
      stockName: h.stockName,
      quantity: safeNumber(h.quantity),
      averagePrice: safeNumber(h.averagePrice),
      currentPrice: safeNumber(h.currentPrice),
      currentValue: safeNumber(h.currentValue),
      profitLoss: safeNumber(h.profitLoss),
      profitRate: safeNumber(h.profitRate),
    }))
    holdingsData.value = await updateHoldingsWithRealTimePrice(processed)

    const buyTx = txRes.data.filter((t) => t.transactionType === 'BUY')
    const sellTx = txRes.data.filter((t) => t.transactionType === 'SELL')

    buyHistory.value = buyTx.slice(0, 2).map((tx) => {
      return {
        name: tx.stockName,
        desc: `매수 ${tx.quantity}주`,
        amount: tx.totalAmount,
      }
    })
    sellHistory.value = sellTx.slice(0, 2).map((tx) => {
      return {
        name: tx.stockName,
        desc: `매도 ${tx.quantity}주`,
        amount: tx.totalAmount,
      }
    })

    dataLoaded.value = true
  } catch (e) {
    console.error('로딩 실패:', e)
  }
})
</script>
