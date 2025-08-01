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
  보수형: '#a855f7', // purple
  균형형: '#3b82f6', // blue
  공격형: '#ef4444', // red
  특수형: '#10b981', // green
  기타: 'rgba(0,0,0,0.1)', // 빈 공간 연한 회색
}

function createChart() {
  if (!chartCanvas.value || !props.traitRatio) return

  // traitRatio 값, 라벨
  const labels = Object.keys(props.traitRatio)
  const dataValues = Object.values(props.traitRatio)

  // 합계 계산
  const total = dataValues.reduce((acc, val) => acc + val, 0)

  // 100보다 작으면 빈 공간 추가
  const adjustedLabels = [...labels]
  const adjustedData = [...dataValues]
  const adjustedColors = labels.map((key) => COLORS[key] || '#ccc')

  if (total < 100) {
    adjustedLabels.push('기타')
    adjustedData.push(100 - total)
    adjustedColors.push(COLORS['기타'])
  }

  if (chartInstance) {
    chartInstance.destroy()
  }

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
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label(context) {
              // '기타' 항목 툴팁 다르게 표시 가능
              const label = context.label || ''
              const value = context.parsed || 0
              if (label === '기타') return `기타: ${value.toFixed(2)}%`
              return `${label}: ${value.toFixed(2)}%`
            },
          },
        },
      },
    },
  })
}

watch(
  () => props.traitRatio,
  () => {
    createChart()
  },
  { immediate: true },
)

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
