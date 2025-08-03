<template>
  <div class="flex justify-center mb-4">
    <div class="inline-flex bg-gray-100 rounded-full p-1 w-full max-w-md">
      <button
        v-for="(tab, idx) in tabs"
        :key="idx"
        @click="go(tab.route)"
        :class="[
          'flex-1 text-center px-0 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
          route.path === tab.route
            ? 'bg-blue-600 text-white shadow'
            : 'text-gray-600 hover:bg-white',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

defineProps({
  tabs: {
    type: Array,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()

function go(path) {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>
