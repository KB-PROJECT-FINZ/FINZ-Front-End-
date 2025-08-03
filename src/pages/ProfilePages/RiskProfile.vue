<template>
  <header class="flex items-center justify-center relative bg-white py-4 pb-3 shadow-sm mb-2">
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-none text-2xl text-black cursor-pointer"
      @click="goBack"
    >
      &#8592;
    </button>
    <h1 class="text-xl font-bold text-gray-800 tracking-tight">나의 투자 성향</h1>
  </header>

  <div class="flex justify-center px-4 py-6">
    <div class="w-full max-w-xl">
      <div v-if="loading" class="text-center text-gray-500 py-8">로딩 중...</div>
      <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
      <div v-else class="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center">
        <!-- 그룹/성향 카드 -->
        <div class="flex flex-col items-center gap-2 mb-6 w-full">
          <div class="flex items-center gap-2">
            <span class="text-3xl">{{ icon }}</span>
            <span class="text-lg font-bold text-indigo-700">{{ nameKr }}</span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <span class="bg-indigo-100 text-indigo-700 rounded px-3 py-1 text-xs font-bold"
              >성향: {{ riskType }}</span
            >
            <span class="bg-teal-100 text-teal-700 rounded px-3 py-1 text-xs font-bold"
              >그룹: {{ groupCode }}</span
            >
          </div>
        </div>
        <!-- 설명/특징 분리 -->
        <div class="w-full mb-6">
          <div class="text-gray-700 text-base text-center mb-4">
            <template v-for="(line, idx) in mainDescription.split('\n')" :key="idx">
              <p class="mb-2">{{ line }}</p>
            </template>
          </div>
          <div v-if="features.length" class="flex flex-col gap-2">
            <div class="text-indigo-700 font-bold mb-2 text-center text-base">특징</div>
            <div
              v-for="(feature, idx) in features"
              :key="idx"
              class="bg-indigo-50 rounded px-3 py-2 flex items-start gap-2 shadow-sm"
            >
              <span class="font-bold text-indigo-700 text-base">{{ idx + 1 }}.</span>
              <span class="text-gray-800 text-sm">{{ feature }}</span>
            </div>
          </div>
        </div>
        <!-- 버튼 -->
        <div class="flex flex-col gap-3 w-full mt-2">
          <router-link
            to="/investment-test/retest"
            class="flex items-center bg-indigo-500 rounded-xl shadow px-4 py-4 hover:bg-indigo-600 transition text-white font-bold text-base justify-center"
          >
            <span class="text-xl mr-3">📝</span>
            재진단하기
            <span class="text-xl text-indigo-200 ml-2">&#8250;</span>
          </router-link>
          <router-link
            to="/risk-types-list"
            class="flex items-center bg-white rounded-xl shadow px-4 py-4 hover:bg-indigo-50 transition text-indigo-700 font-bold text-base justify-center border border-indigo-100"
          >
            <span class="text-xl mr-3">🔍</span>
            다른 성향 보러가기
            <span class="text-xl text-indigo-300 ml-2">&#8250;</span>
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

// 상태
const riskType = ref('')
const nameKr = ref('')
const groupCode = ref('')
const description = ref('')
const icon = ref('🧑‍💼') // 기본값

const loading = ref(true)
const error = ref('')
const mainDescription = ref('')
const features = ref([])

function goBack() {
  router.push({
    name: 'profile',
  })
}

onMounted(async () => {
  try {
    let code = route.query.code
    icon.value = route.query.icon || '🧑‍💼'

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
