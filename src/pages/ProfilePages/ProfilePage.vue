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
    <section class="rounded-2xl px-5 mt-5 bg-white">
      <!-- 프로필 이미지 + 투자 성향 + 이름 (가운데 정렬) -->
      <div class="flex flex-col items-center">
        <div
class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2"
        >
          <img
            src="@/assets/finz.png"
            alt="프로필"
            style="
              width: 80%;
              height: 100%;
              object-fit: scale-down;
              object-position: center;
              background: transparent;
            "
          />
        </div>
        <div
          class="inline-block mb-1 px-3 py-1 rounded-full text-xs font-semibold"
          style="
            background: #6366f1;
            color: #fff;
            box-shadow: 0 1px 4px 0 rgba(99, 102, 241, 0.08);
            letter-spacing: 0.01em;
          "
        >
          {{ profile.type }} {{ nameKr }}
        </div>
        <div class="text-base font-bold text-gray-900">{{ profile.name }}님</div>
      </div>
    </section>
    <hr class="my-4 mx-15 border-gray-200" />

    <!-- 추천 콘텐츠 -->
    <div class="px-5">
      <div class="mb-2">
        <h2 class="text-md font-bold text-center w-full">{{ riskTypeName }} 맞춤 콘텐츠</h2>
        <div class="flex justify-end w-full mt-1">
          <button class="text-xs text-gray-600 underline" @click="goToContents">
            다른 성향도 알아보기 >
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 place-items-center">
        <div
          v-for="(item, index) in recommendedContentsByRisk.filter(
            (item) => !item.quizId && !item.hasQuiz,
          )"
          :key="item.contentId"
          class="min-w-[160px] h-28 bg-white p-3 rounded-xl shadow-sm shrink-0 cursor-pointer flex flex-col justify-center mb-6"
          @click="openContentModal(item)"
        >
          <p
            :class="
              index % 2 === 0
                ? 'text-purple-600 text-base font-bold'
                : 'text-blue-600 text-base font-bold'
            "
            class="mb-1"
          >
            {{ item.label || '추천' }}
          </p>
          <p class="text-sm font-semibold">{{ item.title }}</p>
        </div>
      </div>
    </div>
    <hr class="my-2 border-gray-200" />
    <!-- 추천 콘텐츠 상세 모달 -->
    <transition name="fade-scale">
      <div
        v-if="selectedContent"
        class="fixed inset-0 bg-gray-300/40 z-50 flex items-center justify-center"
      >
        <div
          class="bg-white p-6 rounded-xl w-[90%] max-w-md relative shadow-2xl ring-1 ring-gray-200 transition-all duration-300 ease-in-out"
        >
          <p
            v-if="selectedContent.label"
            class="text-xs text-gray-500 mb-1 uppercase tracking-wide"
          >
            {{ selectedContent.label }}
          </p>
          <h2 class="text-lg font-bold mb-1 text-gray-800">
            {{ selectedContent.title }}
          </h2>
          <div class="border-b border-gray-300 my-3"></div>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">
            {{ selectedContent.content }}
          </p>
          <button
            class="absolute top-3 right-4 text-gray-500 hover:text-black"
            @click="selectedContent = null"
          >
            ✕
          </button>
        </div>
      </div>
    </transition>
    <!-- 투자 일지 & 나의 투자 성향 알아보기 -->
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/journal"
        class="flex items-center bg-white rounded-xl px-4 py-4 text-inherit no-underline"
      >
        <span class="text-xl mr-4">📒</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">투자 일지</div>
          <div class="text-sm text-gray-500">나의 투자 기록을 확인해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
      <!-- 달력: 투자 일지/성향 알아보기 바로 위 -->
      <div class="flex justify-center">
        <Calendar
          class="custom-calendar w-full max-w-md mb-2"
          :attributes="calendarAttrs"
          :title-position="'center'"
          :show-arrows="true"
          :first-day-of-week="0"
          @dayclick="
            (day, event) => {
              event.target.blur()
              onCalendarDayClick(day)
            }
          "
        />
      </div>
    </section>
    <hr class="my-2 border-gray-200" />
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/risk-profile"
        class="flex items-center bg-white rounded-xl px-4 py-4 text-inherit no-underline"
      >
        <span class="text-xl mr-4">📝</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">나의 투자 성향 알아보기</div>
          <div class="text-sm text-gray-500">투자 성향을 분석해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>
    <hr class="my-2 border-gray-200" />
    <FooterNavigation />
  </div>
</template>

<script setup>
import FooterNavigation from '@/components/FooterNavigation.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useAssetDataStore } from '@/services/useAssetData'
import { Calendar } from 'v-calendar'

const router = useRouter()
const userStore = useUserStore()

const { loadUserData } =
  useAssetDataStore()

const profile = ref({ image: '', name: '', type: '', level: 3 })
const buyHistory = ref([])
const sellHistory = ref([])
const transactions = ref([])

// 추천 콘텐츠 관련 상태
const riskTypeName = ref('')
const recommendedContentsByRisk = ref([])
const selectedContent = ref(null)
const nameKr = ref('')

const goToContents = () => router.push('/recommend')
const openContentModal = (item) => {
  selectedContent.value = item
}

// 추천 콘텐츠 API 호출 함수 (onMounted 바깥으로 이동)
const fetchRecommendedContentsByRiskType = async (riskType) => {
  try {
    const res = await axios.get(`/api/contents/recommend?riskType=${riskType}`, {
      withCredentials: true,
    })
    recommendedContentsByRisk.value = res.data
  } catch (e) {
    console.error('❌ 추천 콘텐츠 조회 실패:', e)
    recommendedContentsByRisk.value = []
  }
}

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


onMounted(async () => {
  try {
    const me = await axios.get('/api/auth/me', { withCredentials: true })
    profile.value = {
      name: me.data.name,
      type: me.data.riskType,
      level: typeof me.data.level === 'number' ? me.data.level : 3,
      image: me.data.profileImage || '',
    }

    // 투자 성향 한글명
    const detailRes = await axios.get(`/api/user/risk-type-detail/${profile.value.type}`, {
      withCredentials: true,
    })
    nameKr.value = detailRes.data.nameKr
    riskTypeName.value = detailRes.data.nameKr

    // 추천 콘텐츠 불러오기
    await fetchRecommendedContentsByRiskType(profile.value.type)

    await loadUserData()
    const txRes = await axios.get('/api/mocktrading/transactions', { withCredentials: true })
    transactions.value = txRes.data || []
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
      riskTypeName.value = profile.value.type
      await loadUserData()
    } catch (fallbackError) {
      console.error('Fallback 로딩도 실패:', fallbackError)
    }
  }
})

// 거래내역 날짜에 파란 점 찍히는 달력 속성
const calendarAttrs = computed(() => {
  const dates = Array.from(
    new Set(
      transactions.value
        .filter((t) => t.executedAt)
        .map((t) => {
          const d = new Date(t.executedAt)
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        }),
    ),
  )
  return dates.map((date) => ({
    key: date,
    dates: date,
    dot: { color: '#2272eb', backgroundColor: '#2272eb' },
  }))
})

// 달력 날짜 클릭 시 투자 일지로 이동
function onCalendarDayClick(day) {
  if (day && day.id) {
    router.push({ path: '/journal', query: { date: day.id } })
  }
}
</script>

<style scoped>
@import 'v-calendar/style.css';
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
.vc-container {
  width: 100% !important;
}
</style>
