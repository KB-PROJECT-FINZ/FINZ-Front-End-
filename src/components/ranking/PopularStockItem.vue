<template>
  <div class="flex items-center space-x-3 p-2 rounded-md shadow-md max-w-md w-full text-sm">
    <img
      :key="currentSrc"
      :src="currentSrc"
      :alt="altText"
      class="w-9 h-9 object-contain rounded bg-gray-50 shrink-0"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
      @load="onImgLoad"
      @error="onImgError"
    />
    <div class="flex-1 truncate">
      <div class="font-semibold truncate">{{ name }}</div>
    </div>
    <div class="font-semibold text-gray-800">{{ gain }}명</div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  name: String,
  gain: Number,
  logo: String,
})

/* 1) 절대경로 fallback (public 폴더) */
const ABS_FALLBACK = new URL('/images/stocks/default.png', window.location.origin).toString()

/* 2) 최종 dataURI fallback (네트워크 완전 무시) */
const DATAURI_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e5e7eb"/><stop offset="1" stop-color="#d1d5db"/>
      </linearGradient></defs>
      <rect width="48" height="48" rx="8" fill="url(#g)"/>
      <text x="50%" y="56%" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle" fill="#6b7280">LOGO</text>
    </svg>
  `)

/* URL 정규화 */
function normalizeUrl(raw) {
  if (!raw) return ''
  const u = String(raw).trim()
  if (!u || u === 'null' || u === 'undefined') return ''
  if (u.startsWith('//')) return 'https:' + u
  if (u.startsWith('http://')) return u.replace(/^http:\/\//, 'https://')
  return u
}

const altText = computed(() => (props.name ? `${props.name} logo` : 'logo'))

const stage = ref(0) // 0:원본, 1:절대fallback, 2:dataURI
const currentSrc = ref('')

function setFromProp(val) {
  stage.value = 0
  const primary = normalizeUrl(val)
  currentSrc.value = primary || ABS_FALLBACK
}
setFromProp(props.logo)

watch(
  () => props.logo,
  (v) => setFromProp(v),
)

function onImgLoad(e) {
  // 유령성공(0x0 픽셀)도 실패로 간주
  const img = e.target
  if (!img.naturalWidth || !img.naturalHeight) onImgError()
}

function onImgError() {
  if (stage.value === 0) {
    stage.value = 1
    currentSrc.value = ABS_FALLBACK
    // console.warn('[logo] primary failed → ABS_FALLBACK')
  } else if (stage.value === 1) {
    stage.value = 2
    currentSrc.value = DATAURI_FALLBACK
    // console.warn('[logo] abs fallback failed → DATAURI')
  } // stage 2면 그대로 유지
}
</script>
