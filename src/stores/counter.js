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
    sessionId: null,
  }),

  actions: {
    async sendMessage(message, intentType = null) {
      if (message) {
        this.messages.push({ role: 'user', content: message })
      }

      try {
        const res = await axios.post('/api/chatbot/message', {
          userId: 1,
          sessionId: this.sessionId,
          message: message,
          intentType: intentType,
        })

        const reply = res.data.content
        this.sessionId = res.data.sessionId

        this.messages.push({ role: 'bot', content: reply })

        if (reply === '⚠️ 서버 오류 발생') {
          console.error('서버 오류 발생:', res.data)
        }
      } catch (e) {
        console.error('메시지 전송 중 오류 발생:', e)
        this.messages.push({ role: 'bot', content: '⚠️ 서버 오류 발생' })
      }
    },

    clearMessages() {
      this.messages = []
    },
  },
})
