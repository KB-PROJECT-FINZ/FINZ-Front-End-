<template>
  <div class="w-36 p-2 bg-white rounded-lg shadow flex flex-col items-center text-center">
    <!-- 회사 로고와 이름 -->
    <div class="text-sm font-semibold mb-2">{{ name }}</div>

    <!-- 도넛 차트 캔버스 -->
    <canvas ref="chartCanvas" class="w-24 h-24"></canvas>

    <!-- 성향별 비율 텍스트 -->
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
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  name: String,
  gain: Number,
  traitRatio: Object,
  logo: String,
})

const chartCanvas = ref(null)
let chartInstance = null

// 성향별 색상 지정 (필요하면 색상 변경 가능)
const COLORS = {
  공격형: '#ef4444', // red-500
  중립형: '#3b82f6', // blue-500
  안정형: '#10b981', // green-500
}

function createChart() {
  if (!chartCanvas.value) return
  if (!props.traitRatio) return

  const dataValues = Object.values(props.traitRatio)
  const labels = Object.keys(props.traitRatio)
  const backgroundColors = labels.map((key) => COLORS[key] || '#ccc')

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
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
        tooltip: { enabled: true },
      },
    },
  })
}

// watch 할 때는 props.traitRatio에 접근하는 getter 함수로 작성
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
