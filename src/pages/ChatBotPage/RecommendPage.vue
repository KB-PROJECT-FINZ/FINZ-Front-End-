<template>
  <div class="min-h-screen bg-gray-50 pb-20 px-5 pt-6 max-w-[430px] mx-auto">
    <!-- 상단 안내 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-purple-700 mb-1">📈 종목 추천</h2>
      <p class="text-sm text-gray-500">
        투자 성향이나 키워드를 기반으로 나에게 맞는 종목을 추천받아보세요.
      </p>
    </div>

    <!-- 추천 방식 카드 -->
    <div class="flex flex-col gap-4">
      <!-- 성향 기반 추천 -->
      <div
        class="bg-white rounded-xl border border-purple-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('profile')"
      >
        <p class="text-sm font-semibold text-purple-700 mb-1">💡 성향 기반 추천</p>
        <p class="text-xs text-gray-500">나의 투자 성향에 맞는 종목을 추천해드릴게요.</p>
      </div>

      <!-- 키워드 기반 추천 -->
      <div
        class="bg-white rounded-xl border border-blue-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        @click="goTo('keyword')"
      >
        <p class="text-sm font-semibold text-blue-700 mb-1">🔍 키워드 기반 추천</p>
        <p class="text-xs text-gray-500">관심 있는 키워드를 입력하면 관련 종목을 추천해드려요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(type) {
  const map = {
    profile: 'ChatBotRecommendByProfilePage',
    keyword: 'ChatBotRecommendByKeywordPage',
  }
  router.push({ name: map[type] })
}
</script>
