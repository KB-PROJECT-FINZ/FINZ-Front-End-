<template>
  <section>
    <!-- 타이틀/서브타이틀 -->
    <div class="mb-2">
      <h2 class="text-xl font-semibold">{{ titleText }}</h2>
      <p v-if="subtitleText" class="text-xs text-gray-500 mt-1">{{ subtitleText }}</p>
    </div>

    <!-- 가로 무한 스크롤 -->
    <div
      ref="ticker"
      class="flex overflow-x-hidden whitespace-nowrap gap-6"
      :class="{ 'justify-center': stocks.length < 3 }"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div
        v-for="(stock, i) in duplicatedStocks"
        :key="(stock.id ?? stock.code ?? stock.name ?? 'item') + '-' + i"
        class="relative min-w-[130px] bg-gray-50 rounded-xl p-4 pt-8 shadow-md flex flex-col items-center overflow-visible"
      >
        <!-- 왕관 -->
        <img
          v-if="showCrown(i)"
          :src="crownIcon"
          alt="crown"
          class="absolute -top-2 left-[70%] -translate-x-1/2 w-20 h-20 z-10 pointer-events-none"
        />

        <!-- 로고 영역: 성공 로드되기 전엔 이니셜 배지 표시 -->
        <div class="w-12 h-12 mb-2 rounded-full bg-white grid place-items-center overflow-hidden">
          <!-- 성공 로고 -->
          <img
            v-if="imgState[i]?.loaded"
            :src="imgState[i].src"
            :alt="(stock.name || 'stock') + ' logo'"
            class="w-full h-full object-contain rounded-full fade-in"
            referrerpolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <!-- 로딩/실패 중: 이니셜 배지 -->
          <span
            v-else
            class="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold border-2 text-center"
            style="border-color: #2272eb; color: #2272eb; background: #fff"
          >
            {{ getInitial(stock.name) }}
          </span>
        </div>

        <!-- 종목명 -->
        <p class="text-base font-semibold text-center truncate max-w-[120px]">
          {{ stock.name }}
        </p>

        <!-- 수치 -->
        <p
          v-if="shouldShowGain(stock)"
          class="text-sm font-medium"
          :class="{
            'text-red-500': displayGain(stock) > 0,
            'text-blue-500': displayGain(stock) < 0,
          }"
        >
          {{ formatNumber(displayGain(stock)) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import crownIcon from '@/assets/crown.svg?url'

const props = defineProps({
  stocks: { type: Array, default: () => [] },
  isRealtime: { type: Boolean, default: false },
})

/* ========= 날짜/타이틀 ========= */
const first = computed(() => props.stocks?.[0] || null)

function toKstDateString(date) {
  const s = new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const yyyy = s.getFullYear()
  const mm = String(s.getMonth() + 1).padStart(2, '0')
  const dd = String(s.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function todayKst() {
  return toKstDateString(new Date())
}
function yesterdayKst() {
  const n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  n.setDate(n.getDate() - 1)
  return toKstDateString(n)
}
function formatMD(dateStr) {
  const d = new Date(`${dateStr}T00:00:00+09:00`)
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`
}
function weekRangeLabel(baseDate) {
  const start = new Date(`${baseDate}T00:00:00+09:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${formatMD(baseDate)} ~ ${formatMD(toKstDateString(end))}`
}

const titleText = computed(() => {
  const dt = first.value?.dateType
  const bd = first.value?.baseDate
  if (dt === 'DAY' && bd) {
    if (bd === todayKst()) return '오늘의 인기 종목 Top10'
    if (bd === yesterdayKst()) return '어제의 인기 종목 Top10'
    return `일자별 인기 종목 Top10 (${formatMD(bd)})`
  }
  if (dt === 'WEEK' && bd) return `주간 인기 종목 Top10 (${weekRangeLabel(bd)})`
  return props.isRealtime ? '오늘의 인기 종목 Top10' : '지난주 인기 종목 Top10'
})

const subtitleText = computed(() => {
  const dt = first.value?.dateType
  const bd = first.value?.baseDate
  if (dt === 'DAY' && bd) return `기준일: ${bd} (KST)`
  if (dt === 'WEEK' && bd)
    return `기준 주: ${bd} ~ ${formatMD(toKstDateString(new Date(`${bd}T00:00:00+09:00`)))}`
  return ''
})

/* ========= 로고(무플리커): 백그라운드 프리로드 후 교체 ========= */
function normCode(raw) {
  const c = String(raw ?? '').trim()
  if (!c) return ''
  return /^[0-9]+$/.test(c) ? c.padStart(6, '0') : c
}
function isHttpUrl(u) {
  try {
    const p = new URL(u, window.location.origin)
    return p.protocol === 'http:' || p.protocol === 'https:'
  } catch {
    return false
  }
}
function isSameOrigin(u) {
  try {
    const p = new URL(u, window.location.origin)
    return p.origin === window.location.origin
  } catch {
    return true
  }
}
function toProxy(u) {
  return `/image-proxy?url=${encodeURIComponent(u)}`
}

function candidates(stock) {
  const code = normCode(stock.code ?? stock.stockCode ?? stock.stock_code)
  const fromServer = (stock.image || stock.imageUrl || stock.image_url || '').trim()
  const list = []
  if (fromServer) list.push(fromServer)
  if (fromServer && isHttpUrl(fromServer) && !isSameOrigin(fromServer))
    list.push(toProxy(fromServer))
  if (code) {
    list.push(`/api/logo/${code}.png`, `/api/logo/${code}.jpg`)
    list.push(`/images/stocks/${code}.png`, `/images/stocks/${code}.jpg`)
  }
  list.push('/images/default-stock-logo.png')
  const deduped = []
  for (const u of list) if (u && u !== deduped[deduped.length - 1]) deduped.push(u)
  return deduped
}

/**
 * imgState[i] = { src: string, loaded: boolean, trying: boolean, idx: number }
 * - loaded: 화면에 표시 가능한지
 * - trying: 백그라운드 프리로드 중인지(중복 호출 방지)
 * - idx: 현재 시도 중인 후보 인덱스
 */
const imgState = ref({})

function ensureState(i) {
  if (!imgState.value[i]) imgState.value[i] = { src: '', loaded: false, trying: false, idx: 0 }
  return imgState.value[i]
}

function preloadAndSet(i, stock) {
  const st = ensureState(i)
  if (st.trying || st.loaded) return
  const list = candidates(stock)
  if (st.idx >= list.length) st.idx = list.length - 1

  const tryNext = () => {
    if (st.idx >= list.length) {
      // 모든 후보 실패 → placeholder 고정
      st.src = '/images/default-stock-logo.png'
      st.loaded = true
      st.trying = false
      return
    }
    const url = list[st.idx]
    st.trying = true
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.decoding = 'async'
    img.loading = 'eager'
    img.onload = () => {
      st.src = url
      st.loaded = true
      st.trying = false
    }
    img.onerror = () => {
      st.idx += 1
      st.trying = false
      tryNext()
    }
    img.src = url
  }

  tryNext()
}

/* stocks 변화/마운트 시 프리로드 시작 */
watch(
  () => props.stocks,
  async (list) => {
    await nextTick()
    list.forEach((s, i) => {
      const st = ensureState(i)
      // 새 목록이 오면 상태 초기화
      st.src = ''
      st.loaded = false
      st.trying = false
      st.idx = 0
      preloadAndSet(i, s)
    })
  },
  { deep: true, immediate: true },
)

/* ========= 수치/정렬/틱커 ========= */
const ticker = ref(null)
const animationFrameId = ref(null)
const speed = 0.5

const duplicatedStocks = computed(() =>
  props.stocks.length >= 3 ? [...props.stocks, ...props.stocks] : props.stocks,
)
function showCrown(index) {
  const len = props.stocks.length
  return len > 0 && index % len === 0
}
function displayGain(s) {
  const v = s?.gainRate ?? s?.gain
  return typeof v === 'number' ? v : 0
}
function shouldShowGain(s) {
  return Math.abs(displayGain(s)) >= 0.005
}
function formatNumber(v) {
  return Number(v).toFixed(2) + '%'
}

function step() {
  if (!ticker.value) return
  const el = ticker.value
  el.scrollLeft += speed
  if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
  animationFrameId.value = requestAnimationFrame(step)
}
function pauseScroll() {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
}
function resumeScroll() {
  if (props.stocks.length >= 3) animationFrameId.value = requestAnimationFrame(step)
}
onMounted(() => {
  if (props.stocks.length >= 3) animationFrameId.value = requestAnimationFrame(step)
})
onBeforeUnmount(() => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
})

/* ========= 유틸 ========= */
function getInitial(name) {
  if (!name) return '?'
  // 한글/영문 첫 글자 하나
  return name.trim().charAt(0)
}
</script>

<style scoped>
.fade-in {
  opacity: 0;
  transform: translateZ(0); /* 합성 계층 생성으로 페인트 최소화 */
  will-change: opacity;
  transition: opacity 0.18s ease-in;
}
.fade-in[src] {
  opacity: 1;
}
</style>
