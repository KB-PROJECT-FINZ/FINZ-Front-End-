<template>
  <div class="bg-[#f7f8fa] min-h-screen pb-20">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-center bg-white py-5 shadow-sm mb-2">
      <h1 class="text-xl font-bold text-gray-800 tracking-tight">개념 학습</h1>
    </header>

    <!-- 프로필 박스 -->
    <section
      class="flex items-center bg-gradient-to-r from-indigo-400 via-blue-300 to-teal-200 rounded-2xl mx-4 my-5 px-5 py-6 shadow"
    >
      <div
        class="w-[54px] h-[54px] rounded-full bg-white/30 flex items-center justify-center text-3xl mr-4"
      >
        <span>👤</span>
      </div>
      <div class="text-white">
        <div class="text-base font-bold">{{ user.name }}님은</div>
        <div class="text-sm mt-1">{{ user.riskType }} 사고 유형입니다</div>
      </div>
    </section>

    <!-- 추천 학습 콘텐츠 -->
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-3 ml-2 text-gray-900">추천 학습 콘텐츠</h2>
      <div v-if="recommendedContents.length === 0" class="text-center text-gray-400 py-8">
        콘텐츠를 불러오는 중입니다...
      </div>
      <div v-else class="flex flex-col gap-4 mx-2">
        <div
          v-for="(item, index) in recommendedContents.slice(0, recommendedViewCount)"
          :key="item.contentId"
          class="bg-white rounded-2xl flex items-center shadow px-5 py-6 cursor-pointer transition hover:-translate-y-1 hover:shadow-lg min-h-[110px] mb-4"
          @click="goToDetail(item.contentId)"
        >
          <div class="flex-1 min-w-0">
            <span
              v-if="item.creditReward"
              class="inline-block text-[0.92rem] text-yellow-700 bg-yellow-50 rounded px-2 py-1 mr-2 font-bold"
              >{{ item.creditReward }}크레딧</span
            >
            <div class="text-base font-bold text-gray-900 mt-1">{{ item.title }}</div>
          </div>
          <span class="text-2xl text-gray-300 ml-4">&#8250;</span>
        </div>
        <div
          v-if="recommendedViewCount < recommendedContents.length"
          class="flex justify-center mt-2"
        >
          <button
            class="bg-indigo-100 text-indigo-700 font-bold rounded-lg px-5 py-2 hover:bg-indigo-200 transition"
            @click="recommendedViewCount += 3"
          >
            더보기
          </button>
        </div>
      </div>
    </section>

    <!-- 완료한 학습 콘텐츠 -->
    <section>
      <h2 class="text-lg font-bold mb-3 ml-2 text-gray-900">완료한 학습 콘텐츠</h2>
      <div v-if="completedContents.length === 0" class="text-center text-gray-400 py-8">
        완료한 콘텐츠가 없습니다.
      </div>
      <div v-else class="flex flex-col gap-4 mx-2">
        <div
          v-for="(item, index) in completedContents.slice(0, completedViewCount)"
          :key="item.contentId"
          class="bg-gray-100 rounded-2xl flex items-center shadow px-5 py-6 cursor-pointer opacity-90 min-h-[110px] mb-4"
          @click="goToDetail(item.contentId)"
        >
          <div class="flex-1 min-w-0">
            <span
              v-if="item.creditReward"
              class="inline-block text-[0.92rem] text-yellow-700 bg-yellow-50 rounded px-2 py-1 mr-2 font-bold"
              >{{ item.creditReward }}크레딧</span
            >
            <div class="text-base font-bold text-gray-900 mt-1">{{ item.title }}</div>
          </div>
          <span class="text-2xl text-gray-300 ml-4">&#8250;</span>
        </div>
        <div v-if="completedViewCount < completedContents.length" class="flex justify-center mt-2">
          <button
            class="bg-indigo-100 text-indigo-700 font-bold rounded-lg px-5 py-2 hover:bg-indigo-200 transition"
            @click="completedViewCount += 3"
          >
            더보기
          </button>
        </div>
      </div>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'
import axios from 'axios'

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
</script>
