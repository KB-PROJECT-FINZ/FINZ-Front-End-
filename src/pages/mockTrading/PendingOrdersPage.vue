<template>
  <div class="min-h-[100vh] pb-20 bg-white">
    <!-- 상단 헤더 -->
    <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900"
        >체결 대기 목록</span
      >
      <button
        class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        @click="refreshData"
      >
        &#8635;
      </button>
    </header>
    <div class="w-full h-px bg-gray-200 shadow-sm mx-0" />

    <!-- 필터 및 기간 선택 -->
    <section class="bg-white mx-4 mt-2 pt-4 px-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-base font-semibold text-gray-900">체결 대기 조회</h3>
        <span class="text-sm text-gray-500">총 --건</span>
      </div>
      <!-- 기간 선택 -->
      <div class="mb-3">
        <button
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-gray-100 text-gray-900"
        >
          <span>기간 선택</span>
          <svg
            class="w-4 h-4 ml-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </section>

    <!-- 체결 대기 리스트 -->
    <section class="mx-4 mt-0 space-y-1.5">
      <!-- 스켈레톤 UI: 로딩 중일 때 보여줌 -->
      <template v-if="false">
        <div v-for="n in 5" :key="n" class="bg-white p-3 animate-pulse">
          <div class="flex items-center justify-between mb-1">
            <div class="flex-shrink-0 w-10 text-left">
              <div class="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
              ></span>
              <div class="flex-1 min-w-0">
                <div class="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div class="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div class="h-3 bg-gray-100 rounded w-12"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- 실제 체결 대기 카드 -->
      <template v-else>
        <!-- 데이터 바인딩은 추후 추가 -->
      </template>

      <!-- 더보기 버튼 -->
      <button
        class="block w-full py-3 bg-gray-100 text-gray-800 border-none border-t border-gray-200 text-[14px] font-medium cursor-pointer transition-colors hover:bg-gray-200 mt-2"
        style="display: none"
      >
        더보기
      </button>
    </section>

    <!-- 빈 상태: 로딩 중이 아닐 때만 표시 -->
    <div class="flex flex-col items-center justify-center py-16" style="display: none">
      <div class="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-center mb-4">선택한 기간의 체결 대기 주문이 없습니다</p>
      <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        모의투자 시작하기
      </button>
    </div>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'

const router = useRouter()

function goBack() {
  router.back()
}

function refreshData() {
  // 데이터 새로고침 로직은 추후 구현
}
</script>
