<template>
  <!-- 뒤로가기 헤더  -->
  <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-2 flex-1 text-left text-base font-semibold text-gray-900">추천 콘텐츠</span>
  </header>
  <hr class="border-b border-gray-200" />
  <div class="px-4 py-4">
    <div v-for="(contentList, typeName) in groupedContents" :key="typeName" class="mb-6">
      <!-- 성향 제목 -->
      <h2 class="text-lg font-medium mb-4 flex items-center">
        <span class="mr-2 flex items-center flex-shrink-0" v-html="riskTypeIcon(typeName)"></span>
        {{ typeName }} 추천 콘텐츠 ({{ getRiskCode(typeName) }})
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="item in contentList"
          :key="item.id"
          class="bg-white rounded-xl shadow flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-indigo-50 transition border border-gray-100 min-h-[120px]"
          @click="openContent(item)"
        >
          <div
            class="text-gray-900 text-center text-base whitespace-normal"
            style="word-break: keep-all"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 콘텐츠 모달 -->
    <transition name="fade-scale">
      <div v-if="selectedContent" class="modal-backdrop" @click.self="selectedContent = null">
        <div class="modal-content relative">
          <button
            class="absolute top-3 right-4 text-gray-500 hover:text-black"
            @click="selectedContent = null"
          >
            ✕
          </button>
          <h3 class="text-lg font-bold mb-4">{{ selectedContent.title }}</h3>
          <p class="text-gray-800 whitespace-pre-wrap">{{ selectedContent.content }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const groupedContents = ref({})
const selectedContent = ref(null)

// 성향 코드별 SVG 아이콘 매핑
const riskTypeSvgs = {
  AGR: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  AID: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M12 22S4 18 4 10V6L12 2L20 6V10C20 18 12 22 12 22Z" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12L11 14L16 9" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  BGT: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#a78bfa" stroke-width="2"/><path d="M3 12H9M15 12H21M12 3V9M12 15V21" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/></svg>`,
  BSS: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  CAG: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M22 12H18L15 21L9 3L6 12H2" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  CSD: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L16 9" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#3b82f6" stroke-width="2"/></svg>`,
  DTA: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#facc15" stroke-width="2"/><path d="M12 6V12L16 14" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  EXP: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 2V6M17 2V6M3 10H21" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14L10 16L16 10" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  IND: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#6366f1" stroke-width="2"/><path d="M16 2V6M8 2V6M3 10H21" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  INF: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#06b6d4" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  SOC: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="#10b981" stroke-width="2"/><path d="M12 10V14M10 12H14" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  SYS: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#64748b" stroke-width="2"/><rect x="9" y="9" width="6" height="6" stroke="#64748b" stroke-width="2"/><path d="M9 1V3M15 1V3M9 21V23M15 21V23M1 9H3M1 15H3M21 9H23M21 15H23" stroke="#64748b" stroke-width="2" stroke-linecap="round"/></svg>`,
  TEC: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M3 3V21H21" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9L12 6L16 10L20 6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 17L12 14L16 18L20 14" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  THE: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" stroke="#f43f5e" stroke-width="2"/></svg>`,
  VAL: `<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none"><path d="M12 2L3.09 8.26L9 9L7 14L13.18 15.02L12 22L18.18 15.02L21 14L19 9L21.91 8.26L12 2Z" stroke="#f59e42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
}

function riskTypeIcon(typeName) {
  for (const [code, name] of Object.entries(riskMap)) {
    if (name === typeName) return riskTypeSvgs[code] || ''
  }
  return ''
}

function getRiskCode(typeName) {
  for (const [code, name] of Object.entries(riskMap)) {
    if (name === typeName) return code
  }
  return ''
}

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const riskMap = {
  AGR: '적극적 성장형',
  AID: '적극적 안정형',
  BGT: '균형 잡힌 도전형',
  BSS: '균형 잡힌 수익 추구형',
  CAG: '신중한 성장형',
  CSD: '신중한 안정형',
  DTA: '단타 추구형',
  EXP: '실험적 모험가형',
  IND: '인덱스 수동형',
  INF: '정보 수집형',
  SOC: '사회 책임형',
  SYS: '시스템 트레이더형',
  TEC: '기술적 분석형',
  THE: '테마 투자형',
  VAL: '가치 투자형',
  FAD: '감정적 결정형',
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/contents/all-recommend')
    const contents = res.data
    console.log('전체 콘텐츠 응답:', res)
    console.log('데이터 내용:', contents)

    const group = {}
    for (const item of contents) {
      const typeName = riskMap[item.riskType] || item.riskType
      if (!group[typeName]) group[typeName] = []
      group[typeName].push(item)
    }

    groupedContents.value = group
  } catch (e) {
    console.error('전체 콘텐츠 불러오기 실패:', e)
  }
})

const openContent = async (content) => {
  try {
    const res = await axios.get(`/api/contents/detail/${content.id}`)
    selectedContent.value = res.data
    console.log('선택된 콘텐츠:', selectedContent.value)
  } catch (e) {
    console.error('콘텐츠 상세 조회 실패', e)
  }
}
import { useRouter } from 'vue-router'
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  transform: scale(1);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
