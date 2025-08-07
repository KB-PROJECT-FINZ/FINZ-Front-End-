<template>
  <div>
    <!-- 챗봇 패널 (하단에서 올라옴) -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end"
      @click="closeChat"
    >
      <!-- 배경 오버레이 -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <!-- 챗봇 패널 -->
      <div
        class="relative w-full max-w-[430px] mx-auto bg-white rounded-t-3xl shadow-2xl border border-white/30 overflow-hidden"
        @click.stop
      >
        <!-- 헤더 -->
        <div class="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <img src="@/assets/finz.png" alt="FINZ" class="w-full h-full object-contain" />
            </div>
            <h1 class="text-white text-lg font-bold">
              AI 투자 어시스턴트
            </h1>
          </div>
          <button 
            @click="closeChat"
            class="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 챗봇 컨테이너 -->
        <div class="h-[70vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <ChatBox :fixedIntent="null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/counter.js'
import ChatBox from '@/components/ChatBox.vue'

const isOpen = ref(false)
const chatStore = useChatStore()

const openChat = () => {
  isOpen.value = true
}

const closeChat = () => {
  isOpen.value = false
  // 대화 내용 유지 (초기화하지 않음)
}

// 하단바 챗봇 버튼 클릭 이벤트 리스너
const handleOpenChatBot = () => {
  openChat()
}

onMounted(() => {
  window.addEventListener('openChatBot', handleOpenChatBot)
})

onUnmounted(() => {
  window.removeEventListener('openChatBot', handleOpenChatBot)
})
</script>

<style scoped>
/* 애니메이션 효과 */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.3s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style> 