<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 py-6 pb-20">
      <div class="mb-8">
        <!-- 타이틀 -->
        <h1 class="text-xl font-semibold text-gray-900 mb-3 mt-3 ml-1">오늘의 콘텐츠</h1>

        <div
          class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm mb-6"
        >
          <!-- 왼쪽: 아이콘 + 텍스트 -->
          <div class="flex items-center gap-2">
            <img :src="coinIcon" alt="" class="w-5 h-5 shrink-0" />
            <span class="text-sm font-semibold text-gray-800">
              보유 크레딧 | {{ asset.amount }}C
            </span>
          </div>

          <!-- 오른쪽: 전환하기 -->
          <button
            type="button"
            class="text-sm font-semibold text-blue-600 hover:underline"
            @click="showChargeModal = true"
          >
            전환하기
          </button>
          <!-- 크레딧 충전 모달 -->
          <div
            v-if="showChargeModal"
            class="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm"
          >
            <div
              class="bg-white w-full max-w-sm rounded-t-2xl p-6 pb-8 shadow-lg relative animate-slide-up"
              @click.stop
            >
              <!-- 닫기 버튼 -->
              <button
                class="absolute right-4 top-4 text-gray-400 text-2xl"
                @click="showChargeModal = false"
              >
                &times;
              </button>
              <div class="mb-4 text-center text-lg font-bold">사용할 수 있는 포인트</div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-700">내 크레딧</span>
                <span class="font-bold text-gray-700">{{ asset.amount }}P</span>
              </div>
              <div class="mt-6 mb-2 text-gray-700 font-medium">전환신청 크레딧 입력</div>
              <div class="flex justify-end mb-2">
                <button
                  class="border border-gray-300 text-gray-700 bg-white rounded px-2 py-1 text-xs font-normal hover:bg-gray-100 transition-colors"
                  style="min-width: 60px"
                  @click="chargeCreditInput = asset.amount"
                >
                  보유크레딧 전체
                </button>
              </div>
              <div class="relative mb-4">
                <input
                  v-model.number="chargeCreditInput"
                  type="number"
                  min="1"
                  :max="asset.amount"
                  class="border rounded-lg px-3 py-2 w-full text-right font-bold text-lg pr-7 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="0"
                />
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-lg font-bold pointer-events-none"
                  >P</span
                >
              </div>
              <div class="my-6 text-center text-gray-700">
                내 계좌에
                <span class="font-bold text-blue-600">{{
                  (chargeCreditInput * 1000).toLocaleString()
                }}</span>
                원이 추가됩니다.
              </div>
              <button
                class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:text-gray-400"
                :disabled="
                  !chargeCreditInput || chargeCreditInput < 1 || chargeCreditInput > asset.amount
                "
                @click="onChargeNext"
              >
                확인 &gt;
              </button>
            </div>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-if="recommendedContents.length === 0" class="text-center py-12">
          <div
            class="w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600">콘텐츠를 불러오는 중입니다...</p>
        </div>

        <!-- 추천 캐러셀 -->
        <div v-else>
          <div
            ref="recoTrack"
            class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-4 hide-scrollbar cursor-grab active:cursor-grabbing"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
          >
            <article
              v-for="item in formattedRecommendedContents"
              :key="item.contentId"
              class="min-w-[225px] h-[200px] snap-start rounded-2xl p-4 relative shadow-sm bg-[#f2f6fd]"
              @click="goToDetail(item.contentId)"
            >
              <div class="flex items-center gap-1 mb-2">
                <span
                  class="text-[11px] text-gray-600 bg-white/70 border border-gray-200 rounded-full px-2 py-0.5"
                  >추천</span
                >
                <span
                  v-if="item.creditReward"
                  class="text-[11px] font-semibold text-yellow-800 bg-amber-100 border border-amber-200 rounded-full px-2.5 py-0.5"
                >
                  {{ item.creditReward }} 크레딧
                </span>
              </div>
              <h3 class="text-m font-semibold text-gray-900 leading-5 line-clamp-3">
                {{ item.title }}
              </h3>
            </article>
          </div>
        </div>
      </div>
      <!-- 성향별 콘텐츠 -->
      <div class="mt-10 -mx-4 -mb-5">
        <div class="bg-white rounded-2xl border border-gray-200 px-5 py-5">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">성향별 콘텐츠</h2>

          <!-- 탭바 -->
          <!-- 탭바 (아티클 폭과 동일, 풀-폭 베이스라인) -->
          <div class="pt-1 mb-4">
            <div class="relative w-full">
              <div class="grid grid-cols-5 text-base md:text-base font-semibold">
                <button
                  v-for="t in riskTabs"
                  :key="t"
                  @click="onChangeTab(t)"
                  class="relative py-2 text-center"
                  :class="
                    activeRiskTab === t ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  "
                >
                  {{ t }}
                  <!-- 활성 탭 언더바(탭 셀 내부 거의 꽉 차게) -->
                  <span
                    v-if="activeRiskTab === t"
                    class="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-11/12 h-[3px] md:h-[4px] rounded-full bg-blue-600"
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="isRiskLoading" class="text-center py-10">
            <div
              class="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"
            ></div>
          </div>

          <div v-else-if="filteredByRisk.length === 0" class="text-center py-10">
            <p class="text-gray-500">해당 성향의 콘텐츠가 없습니다.</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in filteredByRisk.slice(0, riskViewCount)"
              :key="item.contentId"
              class="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-4 shadow-sm cursor-pointer hover:shadow-md transition"
              @click="goToDetail(item.contentId)"
            >
              <div class="flex items-center gap-2 mb-2">
                <span
                  v-if="item.creditReward"
                  class="text-[11px] font-semibold text-yellow-800 bg-amber-100 border border-amber-200 rounded-full px-2.5 py-0.5"
                >
                  {{ item.creditReward }}크레딧
                </span>
              </div>
              <h3 class="text-base font-medium text-gray-900 leading-6 truncate">
                {{ item.title }}
              </h3>
            </div>

            <!-- 더보기 -->
            <div v-if="riskViewCount < filteredByRisk.length" class="flex justify-center pt-2">
              <button
                class="w-full text-gray-600 font-medium border border-gray-200 rounded-lg px-6 py-3 hover:text-gray-800 hover:bg-gray-50 transition"
                @click="riskViewCount += 3"
              >
                더보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterNavigation />
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
</style>

<script setup>
// 크레딧 충전 모달 상태 및 입력값
const showChargeModal = ref(false)
const chargeCreditInput = ref(0)

function onChargeNext() {
  // 실제 충전 로직은 필요에 따라 구현
  showChargeModal.value = false
  chargeCreditInput.value = 0
  // 예시: alert('충전 완료!')
}
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'
import axios from 'axios'
import {
  getUserCredit,
  fetchLearningContentsByGroup,
  fetchLearningContents,
} from '@/services/learning'
import coinIcon from '@/components/icons/coin.svg'
const router = useRouter()

/* ------------ state ------------ */
const recommendedContents = ref([])
const completedContents = ref([])
const recommendedCount = ref(0)
const riskContents = ref([])
const isRiskLoading = ref(false)

const groupCodeMap = {
  보수형: 'CONSERVATIVE',
  균형형: 'BALANCED',
  공격형: 'AGGRESSIVE',
  분석형: 'ANALYTICAL',
  감정형: 'EMOTIONAL',
}

const user = ref({
  name: '',
  riskType: '',
  userId: 0,
  groupCode: '',
})
const asset = ref({
  amount: 0,
})
/* 캐러셀 드래그 */
const recoTrack = ref(null)
const isDragging = ref(false)
let startX = 0
let startLeft = 0

/* 탭 & 더보기 */
const riskTabs = ['보수형', '균형형', '공격형', '분석형', '감정형']
const activeRiskTab = ref('보수형')
const riskViewCount = ref(3)

/* ------------ handlers ------------ */
function onPointerDown(e) {
  if (!recoTrack.value) return
  isDragging.value = true
  startX = e.clientX
  startLeft = recoTrack.value.scrollLeft
  if (recoTrack.value.setPointerCapture) {
    recoTrack.value.setPointerCapture(e.pointerId)
  }
}
function onPointerMove(e) {
  if (!isDragging.value || !recoTrack.value) return
  const delta = startX - e.clientX
  recoTrack.value.scrollLeft = startLeft + delta
}
function onPointerUp(e) {
  if (!recoTrack.value) return
  isDragging.value = false
  if (recoTrack.value.releasePointerCapture) {
    recoTrack.value.releasePointerCapture(e.pointerId)
  }
}
async function loadRiskContentsByTab() {
  try {
    isRiskLoading.value = true
    const code = groupCodeMap[activeRiskTab.value]
    const data = await fetchLearningContentsByGroup(code)
    riskContents.value = Array.isArray(data) ? data : []
    await fetchCreditRewards(riskContents.value)
  } catch (e) {
    console.error('❌ 성향별 콘텐츠 로딩 실패:', e)
    riskContents.value = []
  } finally {
    isRiskLoading.value = false
  }
}

async function onChangeTab(t) {
  activeRiskTab.value = t
  riskViewCount.value = 3
  await loadRiskContentsByTab()
}

/* ------------ computed (순서 중요) ------------ */

const formattedRecommendedContents = computed(() => {
  return recommendedContents.value.map((content) => ({
    ...content,
    title: content.title?.replace(/\\n|\n/g, '') || '',
  }))
})

const formattedRiskContents = computed(() =>
  riskContents.value.map((c) => ({ ...c, title: c.title?.replace(/\\n|\n/g, '') || '' })),
)
const filteredByRisk = computed(() => formattedRiskContents.value)

/* ------------ api ------------ */
const fetchCreditRewards = async (contents) => {
  await Promise.all(
    contents.map(async (content) => {
      try {
        const res = await axios.get(`/api/learning/${content.contentId}/quiz`, {
          withCredentials: true,
        })
        content.creditReward = res.data?.creditReward ?? 0
      } catch (e) {
        console.warn(`❌ credit load fail contentId=${content.contentId}`, e)
        content.creditReward = 0
      }
    }),
  )
}

const fetchContents = async () => {
  try {
    const [recommendRes, completeRes] = await Promise.all([
      axios.get('/api/learning/recommend/list', { withCredentials: true }),
      axios.get('/api/learning/history/complete/list', { withCredentials: true }),
    ])
    recommendedContents.value = recommendRes.data
    completedContents.value = completeRes.data
    recommendedCount.value = recommendedContents.value.length

    await Promise.all([
      fetchCreditRewards(recommendedContents.value),
      fetchCreditRewards(completedContents.value),
    ])
  } catch (e) {
    console.error('❌ 콘텐츠 로딩 실패:', e)
  }
}
async function loadCredit() {
  try {
    const credit = await getUserCredit() // 컨트롤러가 Integer 반환 → 숫자
    asset.value.amount = typeof credit === 'number' ? credit : (credit?.amount ?? 0)
  } catch (err) {
    console.error('❌ 크레딧 조회 실패:', err)
    asset.value.amount = 0
  }
}
/* polling으로 추천 콘텐츠 확보 */
const pollUntilContentReady = async (maxRetry = 5, delay = 3500) => {
  let retry = 0
  while (retry < maxRetry) {
    await fetchContents()
    if (recommendedCount.value >= 5) break
    retry++
    await new Promise((r) => setTimeout(r, delay))
  }
}

/* ------------ lifecycle ------------ */
onMounted(async () => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const data = res.data
    user.value = {
      name: data.name,
      riskType: data.riskType,
      userId: data.userId,
      groupCode: data.groupCode,
    }
    await Promise.all([loadCredit(), pollUntilContentReady()])
    await loadRiskContentsByTab()
  } catch (e) {
    console.error('❌ 사용자 정보 로딩 실패:', e)
  }
})

/* ------------ nav ------------ */
function goToDetail(id) {
  router.push(`/learning/${id}`)
}
function goToExchange() {
  // TODO: 전환하기 페이지/모달 이동 로직
  console.log('전환하기 클릭')
}
</script>
