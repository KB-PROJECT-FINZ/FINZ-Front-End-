<template>
  <div class="stock-card">
    <div class="stock-header">
      <h3>{{ name }}</h3>
      <span :class="{ positive: gain > 0, negative: gain < 0 }"> {{ gain.toFixed(2) }}% </span>
    </div>
    <!-- <div class="stock-position">{{ positionLabel }}</div> -->
    <StockDistributionChart :distribution="distribution" :positionIndex="positionIndex" />
  </div>
</template>

<script setup>
import StockDistributionChart from './StockDistributionChart.vue'

defineProps({
  name: String,
  gain: Number,
  positionIndex: Number,
  positionLabel: String,
  distribution: Array,
})
</script>

<style scoped>
.stock-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  background: white;
}
.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.positive {
  color: red;
}
.negative {
  color: blue;
}
.stock-position {
  font-size: 0.85rem;
  margin-bottom: 8px;
  color: #666;
}
</style>
