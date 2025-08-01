<template>
  <div
    class="min-h-screen max-w-[430px] mx-auto border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)]"
  >
    <TopNavigation />

    <main class="relative pb-[60px]">
      <SearchBar />
      <TradingVolumeRanking />
    </main>
  </div>
  <FooterNavigation />
</template>

<script setup>
import TopNavigation from '@/components/mockTrading/TopNavigation.vue'
import SearchBar from '@/components/mockTrading/SearchBar.vue'
import TradingVolumeRanking from '@/components/mockTrading/TradingVolumeRanking.vue'
import FooterNavigation from '@/components/FooterNavigation.vue'
</script>
