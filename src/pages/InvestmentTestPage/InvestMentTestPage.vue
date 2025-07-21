<template>
  <div class="min-h-screen bg-white px-6 pt-4 pb-16 max-w-[430px] mx-auto relative">
    <!-- Header -->
    <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
      <div class="font-bold text-black text-lg">finz</div>
      <div class="flex items-center gap-2">
        <button class="text-xs text-blue-500 border border-blue-300 rounded-full px-2 py-0.5">
          처음부터
        </button>
        <span class="text-xs text-gray-500">1/12</span>
      </div>
    </div>

    <!-- Title -->
    <p class="font-semibold text-sm text-gray-800 mb-1">투자성향 테스트</p>

    <!-- Progress Bar -->
    <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
      <div class="bg-purple-500 h-full w-[8.3%]"></div>
      <!-- 1/12 = 약 8.3% -->
    </div>

    <!-- Dot Indicator -->
    <div class="flex justify-center mb-6 gap-2">
      <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
      <span class="w-2 h-2 bg-gray-200 rounded-full"></span>
      <span class="w-2 h-2 bg-gray-200 rounded-full"></span>
      <span class="w-2 h-2 bg-gray-200 rounded-full"></span>
      <span class="w-2 h-2 bg-gray-200 rounded-full"></span>
      <span class="w-2 h-2 bg-gray-200 rounded-full"></span>
    </div>

    <!-- 질문 -->
    <p class="text-center font-semibold text-lg mb-6">투자에서 가장 중요하게 생각하는 것은?</p>

    <!-- 선택지 -->
    <div class="space-y-4">
      <button
        class="w-full py-3 text-sm font-semibold bg-white rounded-2xl shadow-md hover:shadow-lg active:translate-y-[1px] transition"
      >
        A. 안정적인 수익 확보
      </button>
      <button
        class="w-full py-3 text-sm font-semibold bg-white rounded-2xl shadow-md hover:shadow-lg active:translate-y-[1px] transition"
      >
        B. 높은 수익을 추구
      </button>
    </div>

    <!-- 도움말 -->
    <p class="text-xs text-center text-gray-500 mt-6">💡 더 가깝게 느껴지는 선택지를 골라주세요</p>

    <!-- 하단 안내 -->
    <p class="text-[11px] text-blue-500 text-center absolute bottom-3 left-0 right-0">
      🔐 정확한 결과를 위해 솔직하게 답변해주세요
    </p>
  </div>
</template>

<script setup>
// 추후 상태/페이지 전환은 Composition API 또는 Pinia/Vuex로 관리 가능
</script>
