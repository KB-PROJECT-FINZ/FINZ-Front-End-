<template>
  <div class="bg-white min-h-screen pb-16">
    <!-- 상단 헤더 -->
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
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
    <section class="rounded-2xl mt-5 px-5 py-5 bg-white">
      <!-- 프로필 이미지 + 이름 (가운데 정렬) -->
      <div class="flex flex-col items-center mb-3">
        <div
          class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2"
        >
          <img
            src="@/assets/finz.png"
            alt="프로필"
            style="
              width: 100%;
              height: 100%;
              object-fit: contain;
              object-position: center;
              background: transparent;
            "
          />
        </div>
        <div class="text-base font-bold text-gray-900">{{ profile.name }}</div>
      </div>

      <!-- 투자 성향 & 포인트 박스 (줄바꿈 없이, 여백 좁게) -->
      <div class="flex flex-nowrap gap-2">
        <div class="w-1/2 bg-white shadow rounded-lg px-4 py-2 text-sm text-gray-700">
          <div class="text-gray-500 text-xs mb-0.5">투자 성향</div>
          <div class="font-semibold text-indigo-600 truncate">{{ profile.type }} {{ nameKr }}</div>
        </div>

        <div class="w-1/2 bg-white shadow rounded-lg px-4 py-2 text-sm text-gray-700">
          <div class="text-gray-500 text-xs mb-0.5">크레딧</div>
          <div class="font-semibold text-yellow-600 truncate">{{ asset.amount }}C</div>
        </div>
      </div>
    </section>
    <!-- 투자 일지 & 나의 투자 성향 알아보기 -->
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/journal"
        class="flex items-center bg-white rounded-xl px-4 py-4 border border-gray-200 text-inherit no-underline"
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
        class="flex items-center bg-white rounded-xl px-4 py-4 border border-gray-200 text-inherit no-underline"
      >
        <span class="text-xl mr-4">📝</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">나의 투자 성향 알아보기</div>
          <div class="text-sm text-gray-500">투자 성향을 분석해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import FooterNavigation from '@/components/FooterNavigation.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { getUserCredit } from '@/services/learning'
import { useUserStore } from '@/stores/user'
import { useAssetDataStore } from '@/services/useAssetData'

const router = useRouter()
const userStore = useUserStore()
const imageErrors = ref({})

const { dataLoaded, userAccount, calculatedProfitRate, loadUserData, safeNumber } =
  useAssetDataStore()

const profile = ref({ image: '', name: '', type: '', level: 3 })
const asset = ref({ amount: 0 })
const buyHistory = ref([])
const sellHistory = ref([])
const nameKr = ref('')
const calculatedTotalAssetValue = computed(() => safeNumber(userAccount.value.totalAssetValue, 0))

const goToAssetStatus = () => router.push('/mock-trading/asset-status')
const goToTransactions = () => router.push('/mock-trading/transactions')

const handleLogout = async () => {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true })
  } catch (e) {
    console.warn('서버 세션 종료 실패', e)
  }

  userStore.clearUser()
  localStorage.removeItem('user')
  router.push('/login-form')
}

const handleImageError = (code) => {
  imageErrors.value[code] = true
}

const getStockInitial = (name) => {
  return name ? name[0] : '?'
}

onMounted(async () => {
  try {
    const me = await axios.get('/api/auth/me', { withCredentials: true })
    profile.value = {
      name: me.data.name,
      type: me.data.riskType,
      level: typeof me.data.level === 'number' ? me.data.level : 3,
      image: me.data.profileImage || '',
    }

    const credit = await getUserCredit(me.data.userId)
    asset.value.amount = credit

    await loadUserData()
    const detailRes = await axios.get(`/api/user/risk-type-detail/${profile.value.type}`, {
      withCredentials: true,
    })
    nameKr.value = detailRes.data.nameKr

    const txRes = await axios.get('/api/mocktrading/transactions', { withCredentials: true })
    if (txRes.data && txRes.data.length > 0) {
      const buyTx = txRes.data.filter((t) => t.transactionType === 'BUY')
      const sellTx = txRes.data.filter((t) => t.transactionType === 'SELL')

      buyHistory.value = buyTx.slice(0, 2).map((tx) => ({
        name: tx.stockName,
        desc: `매수 ${tx.quantity}주`,
        amount: tx.totalAmount,
        stockCode: tx.stockCode,
        imageUrl: tx.imageUrl,
      }))
      sellHistory.value = sellTx.slice(0, 2).map((tx) => ({
        name: tx.stockName,
        desc: `매도 ${tx.quantity}주`,
        amount: tx.totalAmount,
        stockCode: tx.stockCode,
        imageUrl: tx.imageUrl,
      }))
    }
  } catch (e) {
    console.error('로딩 실패:', e)
    // 세션 실패 시 로컬스토리지 fallback
    try {
      profile.value.name = localStorage.getItem('name') || '사용자'
      profile.value.type = localStorage.getItem('riskType') || '정보 없음'

      const userId = Number(localStorage.getItem('userId') || 1)
      const credit = await getUserCredit(userId)
      asset.value.amount = credit

      await loadUserData()
    } catch (fallbackError) {
      console.error('Fallback 로딩도 실패:', fallbackError)
    }
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
