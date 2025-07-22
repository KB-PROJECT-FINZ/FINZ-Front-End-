<template>
  <div class="flex gap-2 bg-white rounded-full border border-gray-300 p-1 max-w-md mx-auto">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="$emit('updateTab', tab)"
      :class="[
        'flex-1 py-2 text-center text-sm rounded-full font-semibold transition-colors duration-200',
        currentTab === tab
          ? 'bg-blue-600 text-white shadow'
          : 'bg-white text-black hover:bg-blue-100',
      ]"
    >
      {{ tab }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    tabs: Array,
    currentTab: String,
  },
  emits: ['updateTab'],
}
</script>
