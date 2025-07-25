import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'


export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: []  // [{ role: 'user'|'bot', content: '' }]
  }),

  actions: {
    async sendMessage(message) {
      // 1. 사용자 메시지 추가
      this.messages.push({ role: 'user', content: message })

      try {
        // 2. DTO 구조에 맞춰 전송
        const res = await axios.post('/api/chatbot/message', {
          userId: 1,
          sessionId: this.sessionId,
          message: message,
          // intentType: 'RECOMMEND_PROFILE'  // 또는 UI에서 선택
        })

        console.log('GPT 응답:', res.data) //디버깅
        this.sessionId = res.data.sessionId

        // 3. 응답 처리
        const reply = res.data.content  // ✅ DTO 필드명: content
        this.messages.push({ role: 'bot', content: reply })

      } catch (e) {
        console.error('GPT 응답 오류:', e)
        this.messages.push({ role: 'bot', content: '⚠️ 서버 오류가 발생했습니다.' })
      }
    }
  }
})
