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
    messages: [],
  }),

  actions: {
    async sendMessage(message, intentType = null) {
      // 1. 사용자 메시지 추가
      this.messages.push({ role: 'user', content: message })

      try {
        const res = await axios.post('/api/chatbot/message', {
          userId: 1,
          sessionId: this.sessionId,
          message: message,
          // intentType: intentType, // ✅ 여기에 포함됨
        })
        if (intentType) {
          res.intentType = intentType
        }

        const reply = res.data.content
        console.log('GPT 응답:', res.data) //디버깅
        this.sessionId = res.data.sessionId

        // 3. 응답 처리
        this.messages.push({ role: 'bot', content: reply })
        if (reply === '⚠️ 서버 오류 발생') {
          console.error('서버 오류 발생:', res.data)
        }
      } catch (e) {
        console.error('메시지 전송 중 오류 발생:', e)
        this.messages.push({ role: 'bot', content: '⚠️ 서버 오류 발생' })
      }
    }
  }
})
