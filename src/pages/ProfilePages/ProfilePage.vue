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
        class="w-[60px] h-[60px] rounded-full object-cover mr-5"
        :src="profile.image"
        alt="프로필"
      />
      <div
        v-else
        class="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 mr-5"
      >
        <span>👤</span>
      </div>
      <div>
        <div class="text-base font-bold text-gray-900">{{ profile.name }}</div>
        <div class="text-sm text-gray-500 my-1">{{ profile.type }}</div>
        <span class="bg-indigo-100 text-indigo-800 rounded px-3 py-0.5 text-xs mt-1 inline-block"
          >Level {{ profile.level }}</span
        >
      </div>
    </section>

    <!-- 자산 카드 -->
    <section class="bg-white rounded-xl mx-4 mb-5 px-5 py-5 shadow">
      <div class="text-gray-500 text-sm mb-1">총 보유자산</div>
      <div class="flex items-center justify-between mb-1">
        <span class="text-2xl font-bold text-gray-900">₩{{ asset.amount.toLocaleString() }}</span>
        <button
          class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-800 transition"
          @click="goToAssetStatus"
        >
          내 자산 현황 바로가기
        </button>
      </div>
      <div
        :class="
          asset.change > 0 ? 'text-green-500' : asset.change < 0 ? 'text-red-500' : 'text-gray-500'
        "
        class="text-sm font-bold ml-1"
      >
        {{ asset.change > 0 ? '+' : '' }}{{ asset.change }}% (이번 달)
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

    <!-- 모의투자 내역 카드 -->
    <section class="bg-white rounded-xl mx-4 mb-5 shadow overflow-hidden">
      <div class="bg-gray-50 px-5 py-4 border-b border-gray-200">
        <div class="text-base font-bold text-gray-900">모의투자 내역</div>
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
                <div class="text-xs font-bold text-red-600">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
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
                <div class="text-xs font-bold text-blue-600">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
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
import { ref, onMounted } from 'vue'
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

//const investHistory = ref([])
const buyHistory = ref([]) // 매수
const sellHistory = ref([]) // 매도
const goToAssetStatus = () => {
  router.push('/mock-trading/asset-status')
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
      const response = await axios.get(`/api/trading/transactions`, { withCredentials: true })

      if (response.data && response.data.length > 0) {
        const buyTransactions = response.data.filter(
          (t) => t.transactionType === 'BUY' || t.transactionType === 'HOLDING',
        )
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매수 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매도 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))

        console.log('✅ 매수 내역:', buyHistory.value)
        console.log('✅ 매도 내역:', sellHistory.value)
      } else {
        // 데이터가 없으면 빈 배열로 설정
        console.log('📝 거래 내역 없음')
        buyHistory.value = []
        sellHistory.value = []

        console.log('✅ 매수 내역:', buyHistory.value)
        console.log('✅ 매도 내역:', sellHistory.value)
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
    asset.value.amount = totalCredit * 1000 // 1크레딧 = 1,000원
  } catch (e) {
    console.error('❌ 세션 기반 사용자 정보 로딩 실패:', e)

    // 세션 실패 시 로컬스토리지 fallback
    profile.value.name = localStorage.getItem('name') || '사용자'
    profile.value.type = localStorage.getItem('riskType') || '정보 없음'

    const userId = Number(localStorage.getItem('userId') || 1)
    try {
      console.log('🔍 fallback 모의투자 내역 조회 시작:', userId)
      const response = await axios.get(`/api/trading/transactions/${userId}`)
      console.log('📊 fallback 받은 거래 데이터:', response.data)

      if (response.data && response.data.length > 0) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const buyTransactions = response.data.filter(
          (t) => t.transactionType === 'BUY' || t.transactionType === 'HOLDING',
        )
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매수 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매도 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
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
      asset.value.amount = totalCredit * 1000
    } catch (err) {
      console.error('❌ 크레딧 조회 에러:', err)
      asset.value.amount = 0
    }
  }
})
</script>
