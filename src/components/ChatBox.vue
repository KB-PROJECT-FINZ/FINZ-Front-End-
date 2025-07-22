<!-- src/components/ChatBox.vue -->
<template>
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

async function handleSubmit() {
  if (!input.value.trim()) return

  console.log('보내는 메시지:', input.value) //디버깅

  await chatStore.sendMessage(input.value)
  input.value = ''
}
</script>
