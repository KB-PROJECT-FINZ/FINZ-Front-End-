<template>
  <div
    class="bg-white rounded-2xl shadow mx-5 my-2 px-5 py-4 flex flex-col items-center max-w-[360px] relative"
  >
    <!-- X 닫기 버튼 -->
    <button
      class="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
      @click="$emit('close')"
      aria-label="닫기"
      type="button"
    >
      ×
    </button>
    <slot />
    <button
      class="mt-3 bg-[#0063f7] text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-800 transition-all text-sm w-full max-w-xs"
      style="border-radius: 0.5rem"
      @click="$emit('goToLearning')"
    >
      <slot name="button">여기에 텍스트 입력</slot>
    </button>
  </div>
</template>

<script setup>
defineEmits(['goToLearning', 'close'])
</script>

<style scoped>
.animate-bounce-smooth {
  animation: bounce-smooth 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
@keyframes bounce-smooth {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
</style>
