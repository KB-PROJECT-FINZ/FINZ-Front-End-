<template>
  <div>
    <h3 class="font-semibold mb-1">{{ name }} ({{ positionLabel }})</h3>
    <canvas ref="canvas" width="300" height="100"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  name: String,
  gain: Number,
  positionIndex: Number,
  positionLabel: String,
  distribution: Array,
  color: String,
})

const canvas = ref(null)

const myPositionPlugin = {
  id: 'myPosition',
  afterDatasetsDraw(chart) {
    const {
      ctx,
      scales: { x, y },
    } = chart

    const index = props.positionIndex
    if (index === undefined || index < 0 || index >= 6) return

    const xPos = x.getPixelForValue(index)
    const dataValue = props.distribution?.[index] ?? 0
    const yPos = y.getPixelForValue(dataValue)

    ctx.save()

    // 🔴 빨간 점
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(xPos, yPos - 10, 6, 0, 2 * Math.PI)
    ctx.fill()

    // 🔴 텍스트 ("내 위치")
    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = 'red'
    ctx.textAlign = 'center'
    ctx.fillText('내 위치', xPos, yPos - 20)

    ctx.restore()
  },
}

onMounted(() => {
  if (!canvas.value) return

  new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['-10% 이하', '-10~0%', '0~10%', '10~20%', '20~30%', '30% 초과'],
      datasets: [
        {
          label: '수익률 분포',
          data: props.distribution?.length === 6 ? props.distribution : [0, 0, 0, 0, 0, 0],
          backgroundColor: props.color || '#60a5fa',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 5 } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return `수익률 구간 투자자 수: ${context.parsed.y}`
            },
          },
        },
      },
    },
    plugins: [myPositionPlugin],
  })
})
</script>
