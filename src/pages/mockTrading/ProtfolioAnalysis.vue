<template>
  <div class="min-h-[100vh] pb-20 bg-white">
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10"
    >
      <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="ml-3 flex-1 text-left text-base font-semibold text-gray-900">AI 분석리포트</span>
      <div class="flex items-center gap-1">
        <button
          @click="exportToPDF"
          class="p-2 cursor-pointer rounded-full mr-1 hover:bg-gray-100 bg-transparent border-0"
          title="PDF로 내보내기"
        >
          <span>📄</span>
        </button>
        <button
          class="bg-none border-none text-xl text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-100"
          @click="fetchAnalysis"
          :disabled="loading"
        >
          <span :class="{ 'animate-spin': loading }">&#8635;</span>
        </button>
      </div>
    </header>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow mx-4 mt-8"
    >
      <div
        class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-gray-700">AI가 포트폴리오를 분석하고 있습니다...</p>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200 mx-4 mt-8"
    >
      <h3 class="text-red-600 text-xl font-bold mb-2">⚠️ 분석 오류</h3>
      <p class="text-gray-700 mb-4">{{ error }}</p>
      <button
        @click="fetchAnalysis"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        다시 시도
      </button>
    </div>

    <!-- 분석 결과 -->
    <div v-else-if="analysisData">
      <!-- 통계 요약 카드들 -->
      <section class="bg-white px-0 pt-6 pb-6 mx-0 mb-0">
        <h2 class="text-xl font-bold text-gray-900 px-6">투자 성과 요약</h2>
        <div class="flex flex-col gap-3 p-5">
          <div class="flex justify-between items-center px-3">
            <span class="text-xs text-gray-500">분석 대상 거래</span>
            <span class="text-base text-gray-900">{{ analysisData.stats.transactionCount }}건</span>
          </div>
          <div class="flex justify-between items-center px-3">
            <span class="text-xs text-gray-500">분석 기간</span>
            <span class="flex flex-col items-end">
              <span class="text-base text-gray-900"
                >{{ analysisData.stats.startDate }} ~ {{ analysisData.stats.endDate }}</span
              >
              <span class="text-xs text-gray-400 font-normal"
                >{{ analysisData.stats.analysisPeriod }}일</span
              >
            </span>
          </div>
          <div class="flex justify-between items-center px-3">
            <span class="text-xs text-gray-500">총 수익률</span>
            <span
              class="text-base"
              :class="analysisData.stats.totalReturn >= 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ analysisData.stats.totalReturn > 0 ? '+' : ''
              }}{{ analysisData.stats.totalReturn }}%
            </span>
          </div>
        </div>
      </section>

      <!-- 회색 구분선(gap) -->
      <div class="w-full h-4 bg-gray-50"></div>
      <!-- AI 분석 리포트 -->
      <section class="bg-white px-0 pt-6 pb-0 mx-0 mb-0">
        <h2 class="text-xl font-bold text-gray-900 px-6 mb-4">AI 분석 리포트</h2>
        <!-- 탭 버튼 -->
        <div class="flex bg-gray-100 rounded-lg p-1 gap-1 mx-6 mb-6">
          <button
            v-for="tab in aiTabs"
            :key="tab.key"
            @click="selectedTab = tab.key"
            class="flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200"
            :class="selectedTab === tab.key ? tab.activeClass : 'text-gray-600 hover:text-gray-800'"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- 선택된 카드 제목 (카드 밖) -->
        <div class="px-6 mb-1">
          <div v-if="selectedTab === 'strategy'" class="text-sm font-semibold text-blue-700 mb-2">
            투자 전략의 특징
          </div>
          <div v-else-if="selectedTab === 'risks'" class="text-sm font-semibold text-red-600 mb-2">
            리스크 요인 및 개선점
          </div>
          <div
            v-else-if="selectedTab === 'advice'"
            class="text-sm font-semibold text-green-700 mb-2"
          >
            초보 투자자에게 맞는 조언
          </div>
        </div>
        <div class="px-6">
          <div
            v-if="selectedTab === 'strategy'"
            class="bg-blue-50 border-l-4 border-blue-400 rounded p-4 min-h-[60px]"
          >
            <div
              v-if="analysisData.aiAnalysis?.strategy"
              v-html="formatContent(analysisData.aiAnalysis.strategy)"
            ></div>
            <div v-else class="flex flex-col gap-2 animate-pulse">
              <div class="h-4 bg-blue-100 rounded w-3/4"></div>
              <div class="h-4 bg-blue-100 rounded w-2/3"></div>
              <div class="h-4 bg-blue-100 rounded w-1/2"></div>
            </div>
          </div>
          <div
            v-else-if="selectedTab === 'risks'"
            class="bg-red-50 border-l-4 border-red-400 rounded p-4 min-h-[60px]"
          >
            <div
              v-if="analysisData.aiAnalysis?.risks"
              v-html="formatContent(analysisData.aiAnalysis.risks)"
            ></div>
            <div v-else class="flex flex-col gap-2 animate-pulse">
              <div class="h-4 bg-red-100 rounded w-3/4"></div>
              <div class="h-4 bg-red-100 rounded w-2/3"></div>
              <div class="h-4 bg-red-100 rounded w-1/2"></div>
            </div>
          </div>
          <div
            v-else-if="selectedTab === 'advice'"
            class="bg-green-50 border-l-4 border-green-400 rounded p-4 min-h-[60px]"
          >
            <div
              v-if="analysisData.aiAnalysis?.advice"
              v-html="formatContent(analysisData.aiAnalysis.advice)"
            ></div>
            <div v-else class="flex flex-col gap-2 animate-pulse">
              <div class="h-4 bg-green-100 rounded w-3/4"></div>
              <div class="h-4 bg-green-100 rounded w-2/3"></div>
              <div class="h-4 bg-green-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <!-- 액션 버튼들 제거 (PDF 버튼은 헤더로 이동) -->
      </section>
    </div>
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'
const router = useRouter()
const analysisData = ref(null)
const loading = ref(false)
const error = ref(null)

const goBack = () => {
  router.back()
}
const formatContent = (content) => {
  if (!content) return ''
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
}
const getMockData = () => {
  return {
    stats: {
      userId: 12345,
      transactionCount: 28,
      startDate: '2024-01-15',
      endDate: '2024-02-14',
      analysisPeriod: 30,
      totalReturn: 12.45,
    },
    aiAnalysis: {
      strategy: `**단기 매매 중심의 활발한 거래 패턴**을 보이고 있습니다.\n\n- 월평균 28건의 거래로 *높은 거래 빈도*를 유지\n- 기술적 분석을 활용한 **차트 기반 매매** 선호\n- 소액 분할 매수를 통한 위험 분산 시도`,
      risks: `**과도한 거래 빈도**로 인한 수수료 부담이 우려됩니다.\n\n- 잦은 매매로 인한 **거래비용 증가**\n- *감정적 매매*로 인한 손실 확대 가능성\n- 충분한 분석 없는 **충동적 거래** 위험`,
      advice: `**장기 투자 관점**을 갖고 접근하시기 바랍니다.\n\n- 월 거래 횟수를 *15건 이하*로 제한\n- **포트폴리오 다양화**를 통한 위험 분산\n- 손실 한도 설정으로 *리스크 관리* 강화`,
    },
  }
}
const fetchAnalysis = async () => {
  loading.value = true
  error.value = null
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    analysisData.value = getMockData()
  } catch (err) {
    error.value = '분석을 불러오는데 실패했습니다. 다시 시도해주세요.'
    console.error('Analysis failed:', err)
  } finally {
    loading.value = false
  }
}
const exportToPDF = () => {
  alert('PDF 내보내기 기능은 준비 중입니다.')
}
onMounted(() => {
  fetchAnalysis()
})

// AI 분석 리포트 탭
const aiTabs = [
  {
    key: 'strategy',
    label: '투자 전략의 특징',
    activeClass: 'bg-white text-blue-600 shadow-sm',
  },
  {
    key: 'risks',
    label: '리스크 요인 및 개선점',
    activeClass: 'bg-white text-red-600 shadow-sm',
  },
  {
    key: 'advice',
    label: '초보 투자자에게 맞는 조언',
    activeClass: 'bg-white text-green-600 shadow-sm',
  },
]
const selectedTab = ref('strategy')
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.pdf-hover:hover {
  background-color: #f3f4f6;
}
</style>
