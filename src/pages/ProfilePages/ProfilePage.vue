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
      <!-- 이모지 + 이름 -->
      <div class="flex items-center mb-3">
        <div
          class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-400 mr-2"
        >
          👤
        </div>
        <div class="text-base font-bold text-gray-900">{{ profile.name }}</div>
      </div>

      <!-- 투자 성향 & 포인트 박스 (줄바꿈 없이, 여백 좁게) -->
      <div class="flex flex-nowrap gap-2">
        <div class="w-1/2 bg-white shadow rounded-lg px-4 py-2 text-sm text-gray-700">
          <div class="text-gray-500 text-xs mb-0.5">투자 성향</div>
          <div class="font-semibold text-indigo-600 truncate">{{ profile.type }} 신중한 안정형</div>
        </div>

        <div class="w-1/2 bg-white shadow rounded-lg px-4 py-2 text-sm text-gray-700">
          <div class="text-gray-500 text-xs mb-0.5">포인트</div>
          <div class="font-semibold text-yellow-600 truncate">{{ asset.amount }}P</div>
        </div>
      </div>
    </section>

    <!-- 자산 섹션 -->
    <section class="bg-white rounded-xl mx-4 mb-5 px-5 py-5 border border-gray-200">
      <div class="text-gray-500 text-sm mb-2">총 보유자산</div>

      <div v-if="!dataLoaded" class="flex items-center justify-between mb-1">
        <div class="w-40 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div class="w-32 h-9 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div v-else class="flex items-baseline gap-x-4 mb-4">
        <span class="text-[28px] font-bold text-gray-900 leading-none">
          {{ calculatedTotalAssetValue.toLocaleString() }}원
        </span>
        <span
          :class="
            calculatedProfitRate > 0
              ? 'text-red-600'
              : calculatedProfitRate < 0
                ? 'text-blue-600'
                : 'text-gray-600'
          "
          class="text-base font-medium leading-none"
        >
          {{ calculatedProfitRate > 0 ? '+' : '' }}{{ calculatedProfitRate }}%
        </span>
      </div>

      <div class="flex justify-center">
        <button
          class="bg-blue-600 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-blue-800 transition"
          style="width: 320px"
          @click="goToAssetStatus"
        >
          내 자산 현황 바로가기
        </button>
      </div>
    </section>

    <!-- 메뉴 -->
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

    <!-- 내 투자내역 카드 -->
    <section class="bg-white rounded-xl mx-4 mb-5 overflow-hidden border border-gray-200">
      <div class="flex items-center justify-between bg-gray-50 px-5 py-4 border-b border-gray-200">
        <div class="text-base font-bold text-gray-900">내 투자내역</div>
        <button
          class="bg-white text-black border border-gray-300 rounded px-3 py-1 text-sm font-medium hover:bg-gray-100 transition"
          @click="goToTransactions"
        >
          최근 투자 내역 바로가기
        </button>
      </div>

      <div class="px-5 py-4">
        <!-- 로딩 중 -->
        <div v-if="!dataLoaded">
          <div class="text-sm font-bold text-red-600 mb-2 pl-1">매수 내역</div>
          <div class="flex flex-col gap-2 mb-4">
            <div
              v-for="i in 2"
              :key="i"
              class="w-full h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          </div>
          <div class="text-sm font-bold text-blue-600 mb-2 pl-1">매도 내역</div>
          <div class="flex flex-col gap-2">
            <div
              v-for="i in 2"
              :key="i"
              class="w-full h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          </div>
        </div>

        <!-- 실제 데이터 -->
        <div v-else>
          <!-- 매수 -->
          <div class="mb-4">
            <div class="text-sm font-bold text-red-600 mb-2 pl-1">매수 내역</div>
            <div v-if="buyHistory.length === 0" class="text-sm text-gray-500 text-center py-4">
              매수 내역이 없습니다
            </div>
            <div v-else>
              <div
                v-for="(item, index) in buyHistory"
                :key="`buy-${index}`"
                class="flex items-center justify-between px-3 py-3 shadow border-l-4 border-red-600 rounded-lg mb-2"
              >
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3"
                  >
                    <img
                      v-if="item.imageUrl && !imageErrors[item.stockCode]"
                      :src="item.imageUrl"
                      class="w-full h-full object-cover"
                      @error="handleImageError(item.stockCode)"
                    />
                    <span v-else class="text-xs font-bold" style="color: #2272eb">
                      {{ getStockInitial(item.name) }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ item.desc }}</div>
                  </div>
                </div>
                <div class="text-sm font-bold text-gray-900">
                  {{ item.amount.toLocaleString() }}원
                </div>
              </div>
            </div>
          </div>

          <!-- 매도 -->
          <div>
            <div class="text-sm font-bold text-blue-600 mb-2 pl-1">매도 내역</div>
            <div v-if="sellHistory.length === 0" class="text-sm text-gray-500 text-center py-4">
              매도 내역이 없습니다
            </div>
            <div v-else>
              <div
                v-for="(item, index) in sellHistory"
                :key="`sell-${index}`"
                class="flex items-center justify-between px-3 py-3 shadow border-l-4 border-blue-600 rounded-lg mb-2"
              >
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3"
                  >
                    <img
                      v-if="item.imageUrl && !imageErrors[item.stockCode]"
                      :src="item.imageUrl"
                      class="w-full h-full object-cover"
                      @error="handleImageError(item.stockCode)"
                    />
                    <span v-else class="text-xs font-bold" style="color: #2272eb">
                      {{ getStockInitial(item.name) }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ item.desc }}</div>
                  </div>
                </div>
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
