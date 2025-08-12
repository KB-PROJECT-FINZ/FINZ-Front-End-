<template>
  <!-- 뒤로가기 헤더  -->
  <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">추천 콘텐츠</span>
  </header>
  <div class="px-4 py-4">
    <div v-for="(contentList, typeName) in groupedContents" :key="typeName" class="mb-10">
      <!-- 성향 제목 -->
      <h2 class="text-lg font-bold text-indigo-700 mb-4 flex items-center">
        <span class="text-2xl mr-2">{{ riskTypeIcon(typeName) }}</span>
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
            class="font-semibold text-gray-900 text-center text-base break-words whitespace-normal"
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

// 성향 코드별 아이콘 매핑
const riskTypeIcons = {
  AGR: '🚀',
  AID: '🛡️',
  BGT: '⚖️',
  BSS: '💰',
  CAG: '🌱',
  CSD: '🏡',
  DTA: '💨',
  EXP: '🧪',
  IND: '📊',
  INF: '🔎',
  SOC: '🌍',
  SYS: '🖥️',
  TEC: '📈',
  THE: '🎯',
  VAL: '🏆',
  FAD: '😮',
}
function riskTypeIcon(typeName) {
  // typeName이 한글이므로 riskMap에서 코드 추출
  for (const [code, name] of Object.entries(riskMap)) {
    if (name === typeName) return riskTypeIcons[code] || '❓'
  }
  return '❓'
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
