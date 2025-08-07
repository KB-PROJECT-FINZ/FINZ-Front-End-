<template>
  <div class="min-h-screen bg-white">
    <!-- 헤더 -->
    <header class="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
      <div class="flex items-center justify-center">
        <h1 class="text-lg font-semibold text-gray-900">개념 학습</h1>
      </div>
    </header>
    <div class="px-4 py-6 pb-20">
      <!-- 사용자 맞춤 추천 타이틀 -->
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ user.name }}님을 위한</h2>
      <!-- 추천 학습 콘텐츠 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">추천 학습 콘텐츠</h2>
        <div v-if="recommendedContents.length === 0" class="text-center py-12">
          <div
            class="w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600">콘텐츠를 불러오는 중입니다...</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in formattedRecommendedContents.slice(0, recommendedViewCount)"
            :key="item.contentId"
            class="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition border-t border-b border-r border-gray-200 border-l-4 border-indigo-300"
            @click="goToDetail(item.contentId)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    v-if="item.creditReward"
                    class="inline-block text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-full px-3 py-1"
                  >
                    {{ item.creditReward }}크레딧
                  </span>
                  <span class="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">추천</span>
                </div>
                <h3 class="text-base font-medium text-gray-900 truncate">
                  {{ item.title }}
                </h3>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 ml-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          <div
            v-if="recommendedViewCount < formattedRecommendedContents.length"
            class="flex justify-center pt-2"
          >
            <button
              class="w-full text-gray-600 font-medium border border-gray-200 rounded-lg px-6 py-3 hover:text-gray-800 hover:bg-gray-50 transition"
              @click="recommendedViewCount += 3"
            >
              더보기
            </button>
          </div>
        </div>
      </div>

      <!-- 완료한 학습 콘텐츠 -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">완료한 학습 콘텐츠</h2>
        <div v-if="completedContents.length === 0" class="text-center py-12">
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p class="text-gray-600">완료한 콘텐츠가 없습니다.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in formattedCompletedContents.slice(0, completedViewCount)"
            :key="item.contentId"
            class="bg-gray-50 rounded-xl border border-gray-200 p-5 cursor-pointer transition hover:bg-gray-100"
            @click="goToDetail(item.contentId)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center flex-1 min-w-0">
                <div
                  class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-medium text-gray-900 truncate">{{ item.title }}</h3>
                  <p class="text-sm text-gray-500 mt-1">학습 완료</p>
                </div>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 ml-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div
            v-if="completedViewCount < formattedCompletedContents.length"
            class="flex justify-center pt-2"
          >
            <button
              class="w-full text-gray-600 font-medium border border-gray-200 rounded-lg px-6 py-3 hover:text-gray-800 hover:bg-gray-50 transition"
              @click="completedViewCount += 3"
            >
              더보기
            </button>
          </div>
        </div>
      </div>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'
import axios from 'axios'
import ticketIcon from '../../components/icons/ticket-box.svg'

const router = useRouter()
const recommendedContents = ref([])
const completedContents = ref([])
const user = ref({
  name: '',
  riskType: '',
  userId: 0,
  groupCode: '',
})
const recommendedCount = ref(0)
const completedViewCount = ref(3)

const recommendedViewCount = ref(3)

// 제목에서 \n 문자 제거하는 computed 속성들
const formattedRecommendedContents = computed(() => {
  return recommendedContents.value.map((content) => ({
    ...content,
    title: content.title?.replace(/\\n|\n/g, '') || '',
  }))
})

const formattedCompletedContents = computed(() => {
  return completedContents.value.map((content) => ({
    ...content,
    title: content.title?.replace(/\\n|\n/g, '') || '',
  }))
})

const fetchCreditRewards = async (contents) => {
  await Promise.all(
    contents.map(async (content) => {
      try {
        const res = await axios.get(`/api/learning/${content.contentId}/quiz`, {
          withCredentials: true,
        })
        content.creditReward = res.data?.creditReward ?? 0
      } catch (e) {
        console.warn(`❌ contentId=${content.contentId}에 대한 크레딧 조회 실패`, e)
        content.creditReward = 0
      }
    }),
  )
}

const fetchContents = async () => {
  try {
    console.log('[📡] /recommend/list + /complete/list 요청 시작')

    const [recommendRes, completeRes] = await Promise.all([
      axios.get('/api/learning/recommend/list', {
        withCredentials: true,
      }),
      axios.get('/api/learning/history/complete/list', {
        withCredentials: true,
      }),
    ])

    recommendedContents.value = recommendRes.data
    completedContents.value = completeRes.data
    recommendedCount.value = recommendedContents.value.length

    console.log(
      `[📦] 추천 콘텐츠 ${recommendedCount.value}개, 완료 콘텐츠 ${completedContents.value.length}개`,
    )

    await Promise.all([
      fetchCreditRewards(recommendedContents.value),
      fetchCreditRewards(completedContents.value),
    ])
  } catch (e) {
    console.error('❌ 콘텐츠 로딩 실패:', e)
  }
}

// 👉 polling으로 추천 콘텐츠 확보
const pollUntilContentReady = async (maxRetry = 5, delay = 3500) => {
  let retry = 0
  console.log('[🔁] Polling 시작')
  while (retry < maxRetry) {
    console.log(`[⏳] 시도 ${retry + 1}/${maxRetry}...`)
    await fetchContents()
    console.log(`[📊] 현재 추천 콘텐츠 개수: ${recommendedCount.value}`)
    if (recommendedCount.value >= 5) {
      console.log('[✅] 추천 콘텐츠 5개 이상 확보됨 → polling 종료')
      break
    }
    retry++
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  if (retry >= maxRetry) {
    console.warn('[⚠️] polling 끝났지만 추천 콘텐츠가 부족함')
  }
}

// 👉 진입 시 초기화
onMounted(async () => {
  try {
    console.log('[🚀] mounted 실행')
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const data = res.data
    user.value = {
      name: data.name,
      riskType: data.riskType,
      userId: data.userId,
      groupCode: data.groupCode,
    }
    console.log('[👤] 사용자 정보:', user.value)

    await pollUntilContentReady()
  } catch (e) {
    console.error('❌ 사용자 정보 로딩 실패:', e)
  }
})

// 👉 상세 페이지로 이동
function goToDetail(id) {
  router.push(`/learning/${id}`)
}

// 👉 프로필 페이지로 이동
function goToProfile() {
  router.push('/profile')
}
</script>
