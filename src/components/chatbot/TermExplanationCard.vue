<template>
  <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40 max-w-sm">
    <!-- 용어 제목 -->
    <div class="flex items-center space-x-3 mb-4">
      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
        <span class="text-white font-bold text-lg">{{ term.charAt(0).toUpperCase() }}</span>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800">{{ term.toUpperCase() }}</h3>
        <p class="text-sm text-gray-500">{{ definition }}</p>
      </div>
    </div>

    <!-- 의미 설명 -->
    <div class="mb-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        의미
      </h4>
      <p class="text-gray-600 text-sm leading-relaxed">{{ meaning }}</p>
    </div>

    <!-- 초보자 팁 -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
      <h4 class="text-sm font-semibold text-blue-700 mb-2 flex items-center">
        <span class="text-yellow-500 mr-2">💡</span>
        초보자 팁
      </h4>
      <p class="text-blue-600 text-sm leading-relaxed">{{ beginnerTip }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// JSON 파싱
const parsedData = computed(() => {
  try {
    return JSON.parse(props.content)
  } catch (error) {
    console.error('JSON 파싱 실패:', error)
    return null
  }
})

const term = computed(() => parsedData.value?.term || '')
const definition = computed(() => parsedData.value?.definition || '')
const meaning = computed(() => parsedData.value?.meaning || '')
const beginnerTip = computed(() => parsedData.value?.beginnerTip || '')
</script> 