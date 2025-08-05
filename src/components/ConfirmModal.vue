<template>
  <div v-if="visible" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-lg p-6 w-72 text-center">
      <p class="text-base font-semibold text-gray-800 mb-4">정말로 삭제하시겠습니까?</p>
      <div class="flex justify-center gap-4">
        <button
          class="px-4 py-1 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
          @click="$emit('cancel')"
        >
          취소
        </button>
        <button
          class="px-4 py-1 rounded bg-red-500 text-white font-medium hover:bg-red-600"
          @click="$emit('confirm')"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
})
defineEmits(['confirm', 'cancel'])
</script>
