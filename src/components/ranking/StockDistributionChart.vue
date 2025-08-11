<template>
  <canvas ref="canvas" width="300" height="100"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  distribution: {
    type: Array,
    required: true,
  },
  positionIndex: {
    type: Number,
    required: true,
  },
})

const canvas = ref(null)
let chartInstance = null

const labels = ['-10% 이하', '-10~0%', '0~10%', '10~20%', '20~30%', '30% 초과']

const myPositionPlugin = {
  id: 'myPosition',
  afterDatasetsDraw(chart) {
    const {
      ctx,
      scales: { x, y },
    } = chart
    const idx = props.positionIndex
    if (idx === undefined || idx < 0 || idx >= labels.length) return

    const xPos = x.getPixelForValue(idx)
    const dataValue = chart.data.datasets[0].data[idx] || 0
    const yPos = y.getPixelForValue(dataValue)

    ctx.save()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(xPos, yPos - 10, 6, 0, 2 * Math.PI)
    ctx.fill()

    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = 'red'
    ctx.textAlign = 'center'
    ctx.fillText('내 위치', xPos, yPos - 20)
    ctx.restore()
  },
}

function createChart() {
  if (!canvas.value) return

  // 총합 계산
  const total = props.distribution.reduce((acc, v) => acc + v, 0)
  // 0인 경우 대비 최소값 지정 (시각적 표시 위해)
  const distributionRatio =
    total > 0 ? props.distribution.map((v) => v / total) : props.distribution.map(() => 0)

  // 최소값 0.01로 대체 (막대가 완전히 사라지는 것 방지)
  const safeDistribution = distributionRatio.map((v) => (v === 0 ? 0.01 : v))

  chartInstance = new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '수익률 분포',
          data: safeDistribution,
          backgroundColor: 'rgba(96, 165, 250, 0.5)',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            // 비율 표시를 퍼센트로 바꾸려면 필요
            callback: (value) => `${(value * 100).toFixed(0)}%`,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              // 툴팁에 실제 인원수도 보여주려면 total 곱해서 표시
              const ratio = ctx.parsed.y
              const count = Math.round(ratio * total)
              return `인원수: ${count}명 (${(ratio * 100).toFixed(1)}%)`
            },
          },
        },
      },
    },
    plugins: [myPositionPlugin],
  })
}

onMounted(() => {
  createChart()
})

watch(
  () => [props.distribution, props.positionIndex],
  () => {
    if (chartInstance) {
      chartInstance.destroy()
    }
    createChart()
  },
  { deep: true },
)
</script>
