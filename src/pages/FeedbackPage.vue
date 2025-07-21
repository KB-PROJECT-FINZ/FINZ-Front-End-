<template>
  <Header />
  <div class="test-page">
    <h1>Test Page</h1>
  </div>
  <BottomNavigation />
</template>

<script setup>
import Header from '@/components/Header.vue'
import BottomNavigation from '@/components/FooterNavigation.vue'
</script>

<style scoped>
.test-page {
  background-color: yellow;
}
</style>
