<template>
  <div id="app">
    <div class="mobile-container">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>

      <!-- TradeResultModal 전역 등록 -->
      <TradeResultModal
        :visible="tradeResultModal.visible"
        :type="tradeResultModal.type"
        :stockName="tradeResultModal.stockName"
        :isFilled="tradeResultModal.isFilled"
        @goHistory="goToTransactionHistory"
      />

      <!-- 챗봇 패널 (전역에서 사용 가능) -->
      <ChatBotPanel />
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import ChatBotPanel from './components/chatbot/ChatBotPanel.vue'
import TradeResultModal from '@/components/mockTrading/TradeResultModal.vue'
import { useTradeResultModalStore } from './stores/tradeResultModal'
import { useRouter } from 'vue-router'
import { checkExecution } from './services/checkExecution'

export default {
  components: {
    ChatBotPanel,
    TradeResultModal,
  },
  setup() {
    const tradeResultModal = useTradeResultModalStore()
    const router = useRouter()

    const goToTransactionHistory = () => {
      tradeResultModal.close()
      router.push('/mock-trading/transactions')
    }

    onMounted(async () => {
      const userStore = useUserStore()

      if (userStore.userId) return

      try {
        const res = await axios.get('/api/auth/me')

        const user = res.data
        if (!user || (!user.id && !user.userId)) return

        userStore.setUser({
          userId: user.id ?? user.userId,
          username: user.username,
          name: user.name,
          riskType: user.riskType,
        })
      } catch (err) {
        console.warn('로그인된 사용자 정보 없음 또는 세션 만료됨', err)
      }
      await checkExecution()
    })
    return {
      tradeResultModal,
      goToTransactionHistory,
    }
  },
}
</script>

<style scoped>
/* 기존 스타일 유지 */
#app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.mobile-container {
  max-width: 430px;
  width: 100vw;
  height: 100dvh;
  overflow: auto;
  position: relative;
  background-color: white;
}
/* @font-face {
  font-family: 'Paperlogy4Regular';
  src: url('./fonts/Paperlogy-5Medium.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.mobile-container {
  font-family: 'Paperlogy4Regular';
} */
</style>
