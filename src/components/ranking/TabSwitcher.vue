<template>
  <div class="relative max-w-md mx-auto">
    <!-- 탭 텍스트 -->
    <div class="grid grid-cols-2 text-center text-m font-semibold">
      <button
        v-for="tab in tabs"
        :key="tab.route"
        @click="go(tab.route)"
        class="py-2 transition-colors"
        :class="isActive(tab.route) ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 전체 밑줄 -->
    <div class="border-b border-gray-200"></div>

    <!-- 파란 인디케이터 -->
    <div
      class="absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-transform duration-300"
      :style="{
        width: 100 / tabs.length + '%',
        transform: `translateX(${activeIndex * 100}%)`,
      }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  tabs: { type: Array, required: true }, // [{label, route}]
})

const router = useRouter()
const route = useRoute()

const activeIndex = computed(() =>
  Math.max(
    0,
    props.tabs.findIndex((t) => t.route === route.path),
  ),
)

function isActive(path) {
  return route.path === path
}

function go(path) {
  if (!isActive(path)) router.push(path)
}
</script>
