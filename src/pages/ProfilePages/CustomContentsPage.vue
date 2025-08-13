<template>
  <div class="bg-white min-h-screen pb-16">
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
    >
      <button
        @click="goBack"
        class="w-8 h-8 flex items-center justify-center"
        aria-label="뒤로가기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="#6366f1"
          class="w-6 h-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <span class="text-lg font-bold text-gray-800">맞춤 콘텐츠</span>
      <div class="w-8 h-8"></div>
    </header>

    <div class="px-5 mt-6">
      <div class="mb-2">
        <h2 class="text-md font-bold text-center w-full">{{ riskTypeName }} 맞춤 콘텐츠</h2>
        <div class="flex justify-end w-full mt-5 mb-5">
          <button class="text-xs text-gray-600 underline" @click="goToContents">
            다른 성향도 알아보기 &gt;
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 place-items-center">
        <div
          v-for="(item, index) in recommendedContentsByRisk
            .filter((item) => !item.quizId && !item.hasQuiz)
            .slice(0, 2)"
          :key="item.contentId"
          class="w-full min-w-[160px] bg-white p-3 rounded-xl shadow-sm shrink-0 flex flex-col justify-center mb-2 border border-gray-200"
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
          <p class="text-sm font-semibold mb-1">{{ item.title }}</p>
          <div class="border-b border-gray-200 my-2"></div>
          <p class="text-xs text-gray-700 whitespace-pre-wrap">{{ item.content }}</p>
        </div>
        <div
          v-if="
            recommendedContentsByRisk.filter((item) => !item.quizId && !item.hasQuiz).length === 0
          "
          class="w-full text-center text-gray-400 py-8"
        >
          표시할 맞춤 콘텐츠가 없습니다.
        </div>
      </div>
    </div>
    <footer-navigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import FooterNavigation from '@/components/FooterNavigation.vue'

const router = useRouter()
const riskTypeName = ref('')
const recommendedContentsByRisk = ref([])

const goBack = () => router.back()
const goToContents = () => router.push('/recommend')

onMounted(async () => {
  try {
    // 프로필 정보에서 riskType을 받아옴 (ProfilePage.vue와 동일)
    const me = await axios.get('/api/auth/me', { withCredentials: true })
    const riskType = me.data.riskType
    const detailRes = await axios.get(`/api/user/risk-type-detail/${riskType}`, {
      withCredentials: true,
    })
    riskTypeName.value = detailRes.data.nameKr
    const res = await axios.get(`/api/contents/recommend?riskType=${riskType}`, {
      withCredentials: true,
    })
    recommendedContentsByRisk.value = res.data
  } catch (e) {
    console.error('맞춤 콘텐츠 조회 실패:', e)
    recommendedContentsByRisk.value = []
  }
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
