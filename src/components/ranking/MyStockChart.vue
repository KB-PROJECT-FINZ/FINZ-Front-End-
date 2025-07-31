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
    if (props.positionIndex === undefined) return

    const xPos = x.getPixelForValue(props.positionIndex)
    const yPos = y.getPixelForValue(props.distribution[props.positionIndex])

    ctx.save()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(xPos, yPos - 10, 6, 0, 2 * Math.PI)
    ctx.fill()

    ctx.font = 'bold 12px Arial'
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
      labels: ['-10%', '-5%', '0%', '5%', '10%', '15%+'],
      datasets: [
        {
          label: '수익률 분포',
          data: props.distribution,
          backgroundColor: props.color,
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
