<template>
  <nav class="bg-white py-4">
    <ul class="flex gap-5 list-none m-0 p-0 justify-center items-center">
      <li
        v-for="item in navItems"
        :key="item.name"
        @click="select(item.name)"
        :class="[
          'text-[#6a7885] font-medium text-[14px] min-w-[100px] text-center py-2 px-3 rounded-xl cursor-pointer transition-colors duration-200 relative box-border',
          current === item.name ? 'bg-[#f2f3f5] text-[#353d4a]' : '',
        ]"
      >
        {{ item.label }}
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();

const navItems = [
  { name: 'home', label: '홈', path: '/mock-trading' },
  { name: 'asset', label: '나의자산현황', path: '/mock-trading/asset-status' },
  { name: 'ai', label: 'AI 분석리포트', path: '/mock-trading/ai-report' },
]

const current = ref('home')

function select(name) {
  current.value = name
  const selectedItem = navItems.find(item => item.name === name)
  if (selectedItem) {
    router.push(selectedItem.path)
  }
}
</script>
