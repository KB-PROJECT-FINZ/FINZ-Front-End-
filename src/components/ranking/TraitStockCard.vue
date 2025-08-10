<template>
  <div class="w-full p-3 bg-white rounded-lg shadow flex flex-col items-center text-center">
    <img :src="logo" alt="logo" class="w-12 h-12 object-contain rounded mb-1" loading="lazy" />
    <div class="text-sm font-semibold mb-2 truncate">{{ name }}</div>

    <div class="w-full h-[220px] sm:h-[240px]">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>

    <div class="mt-3 grid grid-cols-5 gap-2 w-full text-[11px]">
      <div v-for="(value, key) in traitRatio" :key="key" class="flex flex-col items-center">
        <span
          class="w-3 h-3 rounded-full mb-1"
          :style="{ backgroundColor: COLORS[key] || '#ccc' }"
        ></span>
        <span class="truncate">{{ key }}</span>
        <span>{{ value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  name: String,
  gain: Number,
  traitRatio: Object,
  logo: String,
})

const chartCanvas = ref(null)
let chartInstance = null

const COLORS = {
  보수형: '#a855f7',
  균형형: '#3b82f6',
  공격형: '#ef4444',
  특수형: '#10b981',
  기타: '#6b7280',
  미분류: 'rgba(0,0,0,0.08)',
}

function createChart() {
  if (!chartCanvas.value || !props.traitRatio) return

  const labels = Object.keys(props.traitRatio)
  const dataValues = Object.values(props.traitRatio).map((v) => Number(v) || 0)
  const total = dataValues.reduce((a, b) => a + b, 0)

  const adjustedLabels = [...labels]
  const adjustedData = [...dataValues]
  const adjustedColors = adjustedLabels.map((k) => COLORS[k] || '#ccc')

  if (total < 100) {
    adjustedLabels.push('미분류')
    adjustedData.push(100 - total)
    adjustedColors.push(COLORS['미분류'])
  }

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chartCanvas.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: adjustedLabels,
      datasets: [
        {
          data: adjustedData,
          backgroundColor: adjustedColors,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const label = ctx.label || ''
              const value = ctx.parsed || 0
              return `${label}: ${value.toFixed(0)}%`
            },
          },
        },
      },
    },
  })
}

watch(() => props.traitRatio, createChart, { immediate: true })
onMounted(createChart)
onBeforeUnmount(() => chartInstance?.destroy())
</script>
