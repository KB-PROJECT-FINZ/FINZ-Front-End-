<template>
  <div class="w-36 p-2 bg-white rounded-lg shadow flex flex-col items-center text-center">
    <!-- 회사 로고와 이름 -->
    <img :src="logo" alt="logo" class="w-10 h-10 object-contain rounded mb-1" loading="lazy" />
    <div class="text-sm font-semibold mb-2 truncate">{{ name }}</div>

    <!-- 도넛 차트 -->
    <canvas ref="chartCanvas" class="w-24 h-24"></canvas>

    <!-- 성향 비율 -->
    <div class="mt-2 flex justify-around w-full text-xs">
      <div v-for="(value, key) in traitRatio" :key="key" class="flex flex-col items-center">
        <span
          class="w-3 h-3 rounded-full mb-1"
          :style="{ backgroundColor: COLORS[key] || '#ccc' }"
        ></span>
        <span>{{ key }}</span>
        <span>{{ value }}%</span>
      </div>
    </div>
  </div>
</template>

<!-- TraitStockCard.vue -->
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
  기타: '#6b7280', // EMOTIONAL = 기타(회색 계열)
  미분류: 'rgba(0,0,0,0.08)', // 총합 < 100일 때 남는 영역
}

function createChart() {
  if (!chartCanvas.value || !props.traitRatio) return

  const labels = Object.keys(props.traitRatio)
  const dataValues = Object.values(props.traitRatio).map((v) => Number(v) || 0)

  const total = dataValues.reduce((a, b) => a + b, 0)

  const adjustedLabels = [...labels]
  const adjustedData = [...dataValues]
  const adjustedColors = adjustedLabels.map((k) => COLORS[k] || '#ccc')

  // 남는 영역(미분류) 표현(선택사항)
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
      cutout: '70%',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
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
