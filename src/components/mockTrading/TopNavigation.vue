<template>
  <nav class="top-nav">
    <ul class="nav-list">
      <li
        v-for="item in navItems"
        :key="item.name"
        :class="['nav-item', { active: current === item.name }]"
        @click="select(item.name)"
      >
        {{ item.label }}
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const navItems = [
  { name: 'home', label: '홈' },
  { name: 'asset', label: '나의자산현황' },
  { name: 'ai', label: 'AI 분석리포트' },
]
const current = ref('home')
function select(name) {
  current.value = name
}
</script>

<style scoped>
.top-nav {
  background: white;
  padding: 16px 0;
}

.nav-list {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
}

.nav-item {
  color: #6a7885;
  font-weight: 500;
  font-size: 14px;
  min-width: 100px;
  text-align: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  position: relative;
  box-sizing: border-box;
}
.nav-item.active {
  color: #353d4a;
  background: #f2f3f5;
}
</style>
