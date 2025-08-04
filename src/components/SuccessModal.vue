<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black/30 z-50 transition"
  >
    <div class="bg-white rounded-xl shadow-lg px-6 py-8 w-72 text-center">
      <div class="text-4xl mb-2">✅</div>
      <p class="text-lg font-semibold text-gray-800">{{ message }} 완료되었습니다!</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '저장',
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
</script>
