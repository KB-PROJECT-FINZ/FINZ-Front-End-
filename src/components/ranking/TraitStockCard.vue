<template>
  <div class="w-full p-3 bg-white rounded-lg shadow flex flex-col items-center text-center">
    <!-- 상단: 로고/이름은 기존 그대로 두셔도 됩니다 -->

    <div class="w-full h-[220px] sm:h-[240px] relative">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>

      <!-- 데이터 0% 또는 아직 초기화 전 -->
      <div
        v-if="isEmptyData"
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-500"
      >
        데이터가 없습니다
      </div>
      <div
        v-else-if="isInitializing"
        class="absolute inset-0 animate-pulse bg-gray-50/60 rounded-lg"
      ></div>
    </div>

    <!-- 범례(원형 점 + 퍼센트) 영역은 기존 그대로 -->
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
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  name: String,
  gain: Number,
  traitRatio: Object, // { 보수형: 20, ... } 합계 0~100
  logo: String,
})

const chartCanvas = ref(null)
let chart = null
let resizeObserver = null
let visibilityObserver = null
let rafId = null

const isInitializing = ref(true)

const COLORS = {
  보수형: '#2563EB',
  균형형: '#16A34A',
  공격형: '#DC2626',
  특수형: '#9333EA',
  기타: '#6B7280',
  미분류: 'rgba(0,0,0,0.08)',
}

const isEmptyData = computed(() => {
  const vals = Object.values(props.traitRatio ?? {})
  return !vals.length || vals.every((v) => Number(v) === 0)
})

function getDataset() {
  const labels = Object.keys(props.traitRatio ?? {})
  const values = Object.values(props.traitRatio ?? {}).map((v) => Number(v) || 0)
  const total = values.reduce((a, b) => a + b, 0)

  const L = [...labels]
  const D = [...values]
  const C = L.map((k) => COLORS[k] || '#ccc')

  if (total < 100 && !isEmptyData.value) {
    L.push('미분류')
    D.push(100 - total)
    C.push(COLORS['미분류'])
  }
  return { labels: L, data: D, colors: C }
}

// 캔버스가 화면에 “보이는 상태”가 될 때까지 기다림
function waitUntilVisible(el) {
  return new Promise((resolve) => {
    if (!el) return resolve(false)
    // 이미 보이는 중이면 바로 통과
    const rect = el.getBoundingClientRect()
    const alreadyVisible = rect.width > 0 && rect.height > 0
    if (alreadyVisible) return resolve(true)

    visibilityObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visibilityObserver.disconnect()
            resolve(true)
            break
          }
        }
      },
      { root: null, threshold: 0 },
    )
    visibilityObserver.observe(el)
  })
}

// 엘리먼트가 실제 너비/높이를 가질 때까지 (최대 ~60프레임) 대기
function waitForSize(el, maxFrames = 60) {
  return new Promise((resolve) => {
    let frames = 0
    const tick = () => {
      if (!el) return resolve(false)
      const w = el.clientWidth
      const h = el.clientHeight
      if (w > 0 && h > 0) return resolve(true)
      if (frames++ >= maxFrames) return resolve(false)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  })
}

function destroyChart() {
  if (chart) {
    chart.destroy()
    chart = null
  }
}

async function ensureChart() {
  // 데이터 없음이면 파괴 후 스켈레톤만
  if (isEmptyData.value) {
    destroyChart()
    isInitializing.value = false
    return
  }

  const el = chartCanvas.value
  if (!el) return

  isInitializing.value = true
  await nextTick()

  // 1) 보일 때까지 대기, 2) 실제 크기 확보까지 대기
  const visible = await waitUntilVisible(el)
  if (!visible) {
    isInitializing.value = false
    return
  }

  const sized = await waitForSize(el)
  if (!sized) {
    isInitializing.value = false
    return
  }

  const { labels, data, colors } = getDataset()
  const ctx = el.getContext('2d')

  if (!chart) {
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 1, borderColor: '#fff' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: { duration: 250 },
        plugins: { legend: { display: false } },
      },
    })
  } else {
    // 이미 차트가 있으면 안전 업데이트
    chart.data.labels = labels
    chart.data.datasets[0].data = data
    chart.data.datasets[0].backgroundColor = colors
    chart.update('none')
  }
  isInitializing.value = false
}

function observeResize() {
  if (!chartCanvas.value) return
  resizeObserver = new ResizeObserver(() => {
    // 차트가 존재할 때만 즉시 리사이즈
    if (chart) chart.resize()
  })
  resizeObserver.observe(chartCanvas.value)
}

/* ---- Lifecycles ---- */
onMounted(async () => {
  observeResize()
  await ensureChart()
})

// traitRatio 변경 시 재생성/업데이트
watch(
  () => props.traitRatio,
  () => ensureChart(),
  { deep: true },
)

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObserver) {
    try {
      resizeObserver.disconnect()
    } catch {}
  }
  if (visibilityObserver) {
    try {
      visibilityObserver.disconnect()
    } catch {}
  }
  destroyChart()
})
</script>
