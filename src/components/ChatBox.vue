<template>
  <!--  intent 선택 버튼 UI -->
  <div class="flex justify-center gap-2 mb-4">
    <button
      v-for="intent in intents"
      :key="intent.value"
      @click="setIntent(intent.value)"
      :class="[
        'px-3 py-2 rounded-full text-sm',
        currentIntent === intent.value
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      ]"
    >
      {{ intent.label }}
    </button>
  </div>

  <!--  메시지 영역 + 입력창 -->
  <div class="p-4 border rounded">
    <div class="h-64 overflow-y-auto mb-2">
      <div
        v-for="(msg, i) in chatStore.messages"
        :key="i"
        :class="msg.role === 'user' ? 'text-right' : 'text-left'"
      >
        <p
          :class="msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'"
          class="inline-block p-2 rounded m-1"
        >
          {{ msg.content }}
        </p>
      </div>
    </div>

    <!--  메시지 입력창 -->
    <form @submit.prevent="handleSubmit">
      <input
        v-model="input"
        placeholder="메시지를 입력하세요..."
        class="w-full p-2 border rounded"
      />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChatStore } from '@/stores/counter.js'

const input = ref('')
const chatStore = useChatStore()

//  intent 목록 및 선택값 상태
const intents = [
  { label: '종목 추천', value: 'RECOMMEND_PROFILE' },
  { label: '종목 분석', value: 'STOCK_ANALYZE' },
  { label: '용어 설명', value: 'FIN_TERM_EXPLAIN' },
  { label: '투자 피드백', value: 'PORTFOLIO_ANALYZE' },
]
const currentIntent = ref('RECOMMEND_PROFILE')

function setIntent(intent) {
  currentIntent.value = intent
}

//  메시지 전송 함수
async function handleSubmit() {
  if (!input.value.trim()) return
  await chatStore.sendMessage(input.value, currentIntent.value)
  input.value = ''
}
</script>
