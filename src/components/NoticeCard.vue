<template>
  <div
    class="bg-white rounded-2xl shadow mx-5 px-5 py-4 flex flex-col items-center mb-4 max-w-[360px]"
  >
    <slot />
    <button
      class="mt-3 bg-[#0063f7] text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-yellow-500 transition-all text-sm w-full max-w-xs"
      style="border-radius: 0.5rem"
      @click="$emit('goToStudy')"
    >
      <slot name="button">퀴즈 풀러가기</slot>
    </button>
  </div>
</template>

<script setup>
defineEmits(['goToStudy'])
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
