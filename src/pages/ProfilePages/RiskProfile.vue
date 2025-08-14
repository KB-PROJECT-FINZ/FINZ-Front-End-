<template>
  <header class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10">
    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">나의 투자 성향</span>
  </header>
  <hr class="border-t-2 border-gray-200 my-2" />
  <div class="flex justify-center px-4 py-6">
    <div class="w-full max-w-xl">
      <div v-if="loading" class="text-center text-gray-500 py-8">로딩 중...</div>
      <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
      <div
        v-else
        class="bg-white rounded-2xl px-6 py-8 flex flex-col items-center border border-gray-200"
      >
        <!-- 그룹/성향 카드 -->
        <div class="flex flex-col items-center gap-2 mb-6 w-full">
          <div class="flex items-center gap-2">
            <span v-html="iconSvg" class="inline-block"></span>
            <span class="text-lg font-bold">{{ nameKr }}</span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <span class="bg-blue-100 text-blue-600 rounded px-3 py-1 text-xs font-bold"
              >성향: {{ riskType }}</span
            >
          </div>
        </div>
        <!-- 설명/특징 분리 -->
        <div class="w-full mb-6">
          <div class="text-gray-700 text-base text-center mb-4">
            <template v-for="(line, idx) in mainDescription.split('\n')" :key="idx">
              <p class="mb-2 whitespace-pre-line break-keep text-justify">{{ line }}</p>
            </template>
          </div>
          <div v-if="features.length" class="flex flex-col gap-2">
            <div class="font-medium mb-2 text-center text-base">특징</div>
            <div
              v-for="(feature, idx) in features"
              :key="idx"
              class="bg-indigo-50 rounded px-3 py-2 flex items-start gap-2 shadow-sm"
            >
              <span class="font-bold text-blue-600 text-base">{{ idx + 1 }}.</span>
              <span class="text-gray-800 text-sm">{{ feature }}</span>
            </div>
          </div>
        </div>
        <!-- 버튼 -->
        <div class="flex flex-col gap-3 w-full mt-2">
          <router-link
            to="/investment-test/retest"
            class="flex items-center bg-blue-600 rounded-xl shadow px-4 py-4 hover:bg-blue-700 transition text-white font-bold text-base justify-center"
          >
            재진단하기
          </router-link>
          <router-link
            to="/risk-types-list"
            class="flex items-center bg-white rounded-xl shadow px-4 py-4 hover:bg-indigo-50 transition text-blue-600 font-bold text-base justify-center border border-indigo-100"
          >
            다른 성향 보러가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// recommend.vue에서 복사한 SVG 아이콘 매핑
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

const riskType = ref('')
const nameKr = ref('')
const groupCode = ref('')
const description = ref('')
const loading = ref(true)
const error = ref('')
const mainDescription = ref('')
const features = ref([])

import { computed } from 'vue'
const iconSvg = computed(() => riskTypeSvgs[riskType.value] || '')

function goBack() {
  router.push({
    name: 'profile',
  })
}

onMounted(async () => {
  try {
    let code = route.query.code

    // 1. 쿼리 파라미터 없으면 내 정보 조회
    if (!code) {
      const user = await axios.get('/api/auth/me', { withCredentials: true })
      code = user.data.riskType
    }

    // 2. 공통: riskType 세팅 후 API 조회
    riskType.value = code

    const res = await axios.get(`/api/user/risk-type-detail/${code}`, {
      withCredentials: true,
    })

    nameKr.value = res.data.nameKr
    groupCode.value = res.data.groupCode
    description.value = res.data.description

    // 3. 특징 분리
    const desc = res.data.description || ''
    const splitIdx = desc.indexOf('특징')
    if (splitIdx !== -1) {
      mainDescription.value = desc.slice(0, splitIdx).trim()
      const featureText = desc.slice(splitIdx + 2).trim()
      features.value = featureText
        .split('\n')
        .map((f) => f.replace(/^\d+\.\s*/, '').trim())
        .filter((f) => f)
    } else {
      mainDescription.value = desc
      features.value = []
    }
  } catch (err) {
    console.error('투자 성향 조회 실패:', err)
    error.value = '투자 성향 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>
