<template>
  <div>
    <!-- 챗봇 패널 (하단에서 올라옴) -->
    <transition name="chat-panel" appear>
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end" @click="closeChat">
        <!-- 배경 오버레이 -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        <!-- 챗봇 패널 -->
        <div
          class="relative w-full max-w-[430px] mx-auto bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl border border-white/40 overflow-hidden"
          @click.stop
        >
          <!-- 헤더 -->
          <div
            class="flex items-center justify-between bg-gradient-to-r from-blue-400/90 to-purple-500/90 backdrop-blur-sm px-6 py-4"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <img src="@/assets/finz.png" alt="FINZ" class="w-full h-full object-contain" />
              </div>
              <div>
                <h1 class="text-white text-base font-semibold">AI 투자 어시스턴트</h1>
                <p class="text-white/90 text-xs">투자 상담을 도와드려요</p>
              </div>
            </div>
            <button
              @click="closeChat"
              class="p-2 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 챗봇 컨테이너 -->
          <div class="h-[70vh] bg-gradient-to-br from-gray-50/80 to-blue-50/60 backdrop-blur-sm">
            <ChatBox :fixedIntent="null" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/counter.js'
import ChatBox from '@/components/chatbot/ChatBox.vue'

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
