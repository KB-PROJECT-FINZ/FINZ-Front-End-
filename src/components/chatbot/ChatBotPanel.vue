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
          <div class="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <!-- finz 로고 -->
            <div class="flex items-center">
              <img src="@/assets/finz.png" alt="finz" class="h-6 w-auto" />
            </div>
            <!-- 닫기 버튼 -->
            <button
              @click="closeChat"
              class="w-6 h-6 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 챗봇 컨테이너 -->
          <div class="h-[70vh] bg-gradient-to-br from-gray-50/80 to-blue-50/60 backdrop-blur-sm">
            <ChatBox :fixedIntent="initialIntent" :risk="recommendRisk" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ChatBox from '@/components/chatbot/ChatBox.vue'

const isOpen = ref(false)
const chatStore = useChatStore()

const recommendRisk = ref('')
const initialIntent = ref(null)

const openChat = (risk, intent) => {
  recommendRisk.value = risk || ''
  initialIntent.value = intent || null
  isOpen.value = true
}
const closeChat = () => {
  isOpen.value = false
}

// 하단바 챗봇 버튼 클릭 이벤트 리스너
const handleOpenChatBot = (e) => {
  openChat(e.detail?.risk, e.detail?.intent)
}

onMounted(() => {
  window.addEventListener('openChatBot', handleOpenChatBot)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('openChatBot', handleOpenChatBot)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* 패널: 아래에서 위로 슬라이드 */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition:
    transform 0.32s ease-out,
    opacity 0.32s ease-out;
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
