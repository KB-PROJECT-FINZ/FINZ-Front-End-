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
          title="PDF 내보내기"
          :disabled="pdfLoading"
        >
          <span v-if="pdfLoading">⏳</span>
          <span v-else>📄</span>
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
    <div v-else-if="analysisData" ref="pdfContent">
      <!-- 통계 요약 카드들 -->
      <section class="bg-white px-0 pt-6 mx-0 mb-0">
        <h2 class="text-xl font-bold text-gray-900 px-6">투자 성과 요약</h2>
        <div class="flex flex-col gap-3 p-5">
          <div class="flex justify-between items-center px-3">
            <span class="text-sm text-gray-500">분석 대상 거래</span>
            <span class="text-base text-gray-900">{{ analysisData.stats.transactionCount }}건</span>
          </div>
          <div class="flex justify-between items-center px-3">
            <span class="text-sm text-gray-500">분석 기간</span>
            <span class="flex flex-col items-end">
              <span class="text-base text-gray-900"
                >{{ analysisData.stats.analysisStart }} ~ {{ analysisData.stats.analysisEnd }}</span
              >
              <span class="text-xs text-gray-400 font-normal"
                >{{ analysisData.stats.analysisPeriod }}일</span
              >
            </span>
          </div>
          <div class="flex justify-between items-center px-3">
            <span class="text-sm text-gray-500">총 수익률</span>
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
      <!-- AI 분석 리포트 (탭 없이 모두 나열) -->
      <section class="bg-white px-0 pt-6 pb-0 mx-0 mb-0">
        <h2 class="text-xl font-bold text-gray-900 px-6 mb-4">AI 분석 리포트</h2>
        <div class="px-6 mb-1">
          <div class="text-sm font-semibold text-blue-700 mb-2">투자 전략의 특징</div>
        </div>
        <div class="px-6">
          <div class="bg-blue-50 border-l-4 border-blue-400 rounded p-4 min-h-[60px]">
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
        </div>
        <div class="px-6 mb-1 mt-6">
          <div class="text-sm font-semibold text-red-600 mb-2">리스크 요인 및 개선점</div>
        </div>
        <div class="px-6">
          <div class="bg-red-50 border-l-4 border-red-400 rounded p-4 min-h-[60px]">
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
        </div>
        <div class="px-6 mb-1 mt-6">
          <div class="text-sm font-semibold text-green-700 mb-2">초보 투자자에게 맞는 조언</div>
        </div>
        <div class="px-6">
          <div class="bg-green-50 border-l-4 border-green-400 rounded p-4 min-h-[60px]">
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
      </section>
    </div>
    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '@/components/FooterNavigation.vue'
import { analysisService } from '@/services/analysisService.js'

const router = useRouter()
const analysisData = ref(null)
const loading = ref(false)
const error = ref(null)
const pdfLoading = ref(false)
const pdfContent = ref(null)

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

/**
 * AI 분석 데이터 조회
 * 실제 API 호출 + 목데이터 폴백
 */
const fetchAnalysis = async () => {
  loading.value = true
  error.value = null

  try {
    // 실제 API 호출
    const response = await analysisService.fetchLatestAnalysisReport()

    if (response.data) {
      // 백엔드 데이터를 Vue 컴포넌트 형태로 변환
      analysisData.value = analysisService.transformReportData(response)
    } else {
      // 분석 결과가 없는 경우
      console.log('분석 결과가 없어 목데이터 사용')
      analysisData.value = analysisService.getMockAnalysisData()

      // 사용자에게 안내 메시지 표시
      error.value = '아직 분석할 거래 데이터가 충분하지 않습니다. 더 많은 거래를 진행해보세요.'
    }
  } catch (err) {
    console.error('API 호출 실패:', err)
    if (err.message.includes('로그인')) {
      error.value = '로그인이 필요합니다.'
      setTimeout(() => {
        router.push('/login-form')
      }, 2000)
    } else if (err.message.includes('찾을 수 없습니다')) {
      error.value = '아직 분석할 거래 데이터가 충분하지 않습니다. 더 많은 거래를 진행해보세요.'
      analysisData.value = analysisService.getMockAnalysisData()
    } else {
      error.value = '분석을 불러오는데 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

// 브라우저 네이티브 인쇄 API를 사용한 PDF 생성
const exportToPDF = async () => {
  if (!analysisData.value || !pdfContent.value) {
    alert('분석 데이터가 없습니다.')
    return
  }

  pdfLoading.value = true

  try {
    // 새 창 생성
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      alert('팝업이 차단되었습니다. 팝업을 허용해주세요.')
      return
    }

    // Footer 숨기기
    const footer = document.querySelector('footer')
    const footerDisplay = footer ? footer.style.display : null
    if (footer) footer.style.display = 'none'

    // 현재 페이지의 스타일 가져오기
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n')

    // 콘텐츠 추출 및 정리
    const content = pdfContent.value.innerHTML

    // PDF용 HTML 문서 생성
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI 포트폴리오 분석리포트</title>
          ${styles}
          <style>
            @page {
              margin: 15mm;
              size: A4;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #111827;
              background: white;
              margin: 0;
              padding: 0;
              overflow: visible !important;
            }
            .pdf-container {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .report-title {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 1rem;
              color: #1f2937;
            }
            .section-divider {
              border: none;
              border-top: 3px solid #e5e7eb;
              margin: 0 0 2rem 0;
              width: 100%;
            }
            @media print {
              .no-print, footer, .footer-navigation { display: none !important; }
              .sticky { position: static !important; }
              body { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <div class="report-title">
              <span>AI 포트폴리오 분석리포트</span>
            </div>
            <div class="report-date" style="text-align: center; margin-bottom: 2rem; color: #6b7280; font-size: 0.875rem;">
              생성일: ${new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <hr class="section-divider" />
            ${content}
          </div>
        </body>
      </html>
    `

    // 새 창에 HTML 작성
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Footer 스타일 복원
    if (footer) footer.style.display = footerDisplay || ''

    // 인쇄 대화상자 열기
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()

      // 인쇄 완료 후 창 닫기
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 1500)
  } catch (error) {
    console.error('PDF 생성 중 오류:', error)
    alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    pdfLoading.value = false
  }
}

onMounted(() => {
  fetchAnalysis()
})
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

/* PDF 전용 스타일 */
@media print {
  .sticky {
    position: static !important;
  }

  footer {
    display: none !important;
  }
}
</style>
