<template>
  <!-- 뒤로가기 헤더 -->
  <div class="flex items-center px-5 mb-4">
    <button @click="goBack" class="text-gray-600 hover:text-black text-xl mr-2">←</button>
    <h1 class="text-lg font-bold">추천 콘텐츠</h1>
  </div>
  <div class="px-5 py-6">
    <div v-for="(contentList, typeName) in groupedContents" :key="typeName" class="mb-8">
      <!-- 성향 제목 -->
      <h2 class="text-lg font-bold text-purple-600 mb-2">🔹 {{ typeName }} 추천 콘텐츠</h2>

      <!-- 2개씩 묶어 카드 스타일로 렌더링 -->
      <div
        v-for="(pair, index) in chunk(contentList, 2)"
        :key="index"
        class="grid grid-cols-2 gap-4 mb-4"
      >
        <div
          v-for="item in pair"
          :key="item.id"
          class="border rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 w-full"
          @click="openContent(item)"
        >
          <p class="text-xs font-bold text-gray-500 mb-1 break-words whitespace-normal">
            {{ item.label }}
          </p>
          <p class="text-sm font-semibold break-words whitespace-normal">
            {{ item.title }}
          </p>
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
  INF: '정보 수집형',
  SYS: '시스템 트레이더형',
  TEC: '기술적 분석형',
  FAD: '감정적 결정형',
  VAL: '가치 투자형',
  IND: '인덱스 수동형',
  THE: '테마 투자형',
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
  background-color: transparent; /* ✅ 완전 투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 2rem;
  width: 80%;
  max-width: 600px;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  transform: scale(1);
}

.btn {
  background: #2d6cdf;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
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
