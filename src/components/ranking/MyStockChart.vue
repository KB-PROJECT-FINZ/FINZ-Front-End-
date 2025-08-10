<template>
  <div class="w-full h-[300px] sm:h-[340px] p-2">
    <canvas ref="canvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  name: String,
  gain: Number,
  positionIndex: Number,
  positionLabel: String,
  distribution: {
    type: Array,
    default: () => [0, 0, 0, 0, 0, 0],
  },
})

const canvas = ref(null)
let chartInstance = null

const labels = ['-20%↓', '-20~0%', '0~10%', '10~20%', '20~50%', '50%↑']

const myPositionPlugin = {
  id: 'myPosition',
  afterDatasetsDraw(chart) {
    const {
      ctx,
      scales: { x, y },
    } = chart
    const idx = props.positionIndex
    if (idx === undefined || idx < 0 || idx >= labels.length) return

    const valueAtIdx = chart.data.datasets?.[0]?.data?.[idx] ?? 0
    const xPos = x.getPixelForValue(idx)
    const yTop = y.getPixelForValue(valueAtIdx)

    ctx.save()
    // 빨간 원 마커
    ctx.beginPath()
    ctx.arc(xPos, yTop - 5, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()

    // 라벨 항상 "내 위치" 표시
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#111827'
    ctx.fillText('내 위치', xPos, yTop - 16)
    ctx.restore()
  },
}

function buildChart() {
  if (!canvas.value) return

  const data = Array.isArray(props.distribution) ? props.distribution : [0, 0, 0, 0, 0, 0]
  const maxVal = Math.max(1, ...data) // 0만 있어도 최소 1로 여유 생성

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data,
          borderWidth: 0,
          backgroundColor: '#3b82f6',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 부모 높이 꽉 채움
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: () => `${props.name || ''}`,
            label: (ctx) => `${labels[ctx.dataIndex]}: ${data[ctx.dataIndex]}명`,
          },
        },
      },
      layout: {
        padding: { top: 12 }, // 상단 여백 추가(마커/라벨 보호)
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          // 막대 위로 마커/라벨이 잘리지 않도록 여유 확보
          suggestedMax: maxVal + Math.ceil(maxVal * 0.15) + 1, // 최대값의 15% + 1
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { stepSize: Math.max(1, Math.ceil(maxVal / 5)), font: { size: 12 } },
        },
      },
      animation: {
        duration: 250,
      },
    },
    plugins: [myPositionPlugin],
  })
}

watch(() => [props.distribution, props.positionIndex, props.positionLabel], buildChart, {
  deep: true,
})

onMounted(buildChart)
onBeforeUnmount(() => chartInstance?.destroy())
</script>
