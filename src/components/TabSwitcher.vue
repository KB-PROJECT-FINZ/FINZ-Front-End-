<!-- src/components/TabSwitcher.vue -->
<template>
  <div class="flex gap-2 mb-4">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      @click="goTo(tab.route)"
      :class="[
        'flex-1 py-2 rounded-md text-sm font-semibold transition',
        $route.path === tab.route
          ? 'bg-blue-600 text-white shadow'
          : 'bg-white text-gray-800 border border-gray-300 hover:bg-blue-100',
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  tabs: Array,
})

const router = useRouter()

function goTo(route) {
  if (router.currentRoute.value.path !== route) {
    router.push(route)
  }
}
</script>

<style scoped></style>
