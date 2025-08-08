<template>
  <transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none"
      style="overflow: hidden"
    >
      <div
        class="pointer-events-auto max-w-108 w-full mx-auto rounded-full px-6 py-3 flex items-center justify-between shadow-xl mx-4"
        style="background-color: #7f8286"
      >
        <!-- 왼쪽: 체크 아이콘 + 주문 완료 텍스트 -->
        <div class="flex items-center">
          <div
            class="rounded-full w-6 h-6 flex items-center justify-center mr-3"
            style="background-color: #59bd83"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="text-white flex items-center font-normal">
            <template v-if="type === 'CANCEL'">
              {{ stockName }}
            </template>
            <template v-else>
              {{ stockName }}
              <span class="ml-2 text-white font-normal">
                {{ resultMessage }}
              </span>
            </template>
          </div>
        </div>
        <!-- 오른쪽: 내역 보기 버튼 -->
        <button
          @click="$emit('goHistory')"
          class="ml-4 rounded-full px-3 py-2 text-white text-sm font-normal hover:opacity-80 transition"
          style="height: 36px; background-color: #505866"
        >
          내역 보기
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: Boolean,
  type: String,
  stockName: String,
  isFilled: Boolean,
})

const resultMessage = computed(() => {
  const type = (props.type || '').toUpperCase()
  if (type === 'CANCEL') return ''
  if (props.isFilled) {
    return type === 'BUY' ? '매수 체결 완료' : '매도 체결 완료'
  } else {
    return type === 'BUY' ? '매수 신청 완료' : '매도 신청 완료'
  }
})
</script>
