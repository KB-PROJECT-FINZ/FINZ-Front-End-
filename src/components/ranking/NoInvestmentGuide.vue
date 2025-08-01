<template>
  <div class="flex flex-col items-center justify-center text-center mt-20 space-y-5 px-6">
    <!-- 아이콘 또는 일러스트 -->
    <div class="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
      <svg
        class="w-14 h-14 text-gray-400"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </div>

    <!-- 텍스트 메시지 -->
    <div>
      <p class="text-lg font-semibold text-gray-800">아직 투자를 시작하지 않으셨네요!</p>
      <p class="text-sm text-gray-500 mt-1 leading-relaxed">
        지금 바로 투자를 시작하고<br />
        다른 투자자들과 수익률을 비교해보세요
      </p>
    </div>

    <!-- 버튼 -->
    <button
      @click="goToSimulation"
      class="px-6 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition duration-200"
    >
      모의 투자 시작하기
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToSimulation() {
  router.push('/mock-trading') // 실제 모의 투자 경로로 변경
}
</script>
