<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-lg shadow-lg z-[2000] text-base min-w-[180px] text-center pointer-events-none"
      :style="'background: rgba(103, 114, 116, 0.92);'"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  message: String,
  duration: {
    type: Number,
    default: 2000,
  },
})

const visible = ref(false)
let timer = null

watch(
  () => props.show,
  (val) => {
    if (val) {
      visible.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        visible.value = false
      }, props.duration)
    }
  },
)

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
