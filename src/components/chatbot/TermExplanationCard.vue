<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 max-w-sm">
    <!-- 용어 제목 -->
    <div class="flex items-center space-x-3 mb-4">
      <div class="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center">
        <span class="text-white font-semibold text-lg">{{ term.charAt(0).toUpperCase() }}</span>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-800">{{ term.toUpperCase() }}</h3>
        <p class="text-sm text-gray-500">{{ definition }}</p>
      </div>
    </div>

    <!-- 의미 설명 -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <span class="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
        의미
      </h4>
      <p class="text-gray-600 text-sm leading-relaxed">{{ meaning }}</p>
    </div>

    <!-- 초보자 팁 -->
    <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <span class="text-yellow-600 mr-2">💡</span>
        초보자 팁
      </h4>
      <p class="text-gray-600 text-sm leading-relaxed">{{ beginnerTip }}</p>
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