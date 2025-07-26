<!-- API 테스트 페이지 -->
<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden">
    <!-- 상단 네비게이션 -->
    <header class="bg-white px-4 pt-3 pb-3 sticky top-0 z-50 border-b">
      <div class="flex items-center justify-between">
        <!-- 뒤로가기 버튼 -->
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg text-black">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <!-- 제목 -->
        <h1 class="text-lg font-semibold">API 테스트</h1>

        <!-- 빈 공간 -->
        <div class="w-10"></div>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 p-4 overflow-auto">
      <!-- 테스트 설정 -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h2 class="text-md font-semibold mb-3">테스트 설정</h2>

        <div class="space-y-3">
          <!-- 종목 코드 입력 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">종목 코드</label>
            <input
              v-model="testStockCode"
              type="text"
              placeholder="예: 005930"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- API Base URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
            <input
              v-model="apiBaseUrl"
              type="text"
              placeholder="http://localhost:8080"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- 개별 테스트 버튼들 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button
          @click="runSingleTest('getCurrentChart')"
          :disabled="isLoading"
          class="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <div class="text-sm font-medium">GET 현재 분봉</div>
          <div class="text-xs opacity-80">/api/chart/minute/{code}</div>
        </button>

        <button
          @click="runSingleTest('getSpecificTimeChart')"
          :disabled="isLoading"
          class="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <div class="text-sm font-medium">POST 특정 시각</div>
          <div class="text-xs opacity-80">endTime 기준 조회</div>
        </button>

        <button
          @click="runSingleTest('getBatchCharts')"
          :disabled="isLoading"
          class="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <div class="text-sm font-medium">POST 일괄 조회</div>
          <div class="text-xs opacity-80">여러 시간대 한번에</div>
        </button>

        <button
          @click="runSingleTest('testEndpoint')"
          :disabled="isLoading"
          class="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <div class="text-sm font-medium">GET 테스트</div>
          <div class="text-xs opacity-80">/test 엔드포인트</div>
        </button>
      </div>

      <!-- 전체 테스트 버튼 -->
      <button
        @click="runAllTests"
        :disabled="isLoading"
        class="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        <div class="text-md font-medium">
          {{ isLoading ? '테스트 실행 중...' : '🚀 전체 API 테스트 실행' }}
        </div>
        <div class="text-sm opacity-80">모든 엔드포인트 순차 테스트</div>
      </button>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="text-center py-4">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"
        ></div>
        <p class="text-gray-600 mt-2">API 테스트 진행 중...</p>
      </div>

      <!-- 테스트 결과 -->
      <div v-if="testResults.length > 0" class="space-y-4">
        <h3 class="text-lg font-semibold">테스트 결과</h3>

        <div
          v-for="(result, index) in testResults"
          :key="index"
          class="border rounded-lg p-4"
          :class="result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'"
        >
          <!-- 결과 헤더 -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <span class="text-lg mr-2">{{ result.success ? '✅' : '❌' }}</span>
              <span class="font-medium">{{ result.testName }}</span>
            </div>
            <span class="text-sm text-gray-500">{{ result.timestamp }}</span>
          </div>

          <!-- 요청 정보 -->
          <div class="text-sm mb-2">
            <span class="font-medium">{{ result.method }}</span>
            <span class="text-gray-600 ml-2">{{ result.url }}</span>
          </div>

          <!-- 성공 시 응답 데이터 -->
          <div v-if="result.success" class="mt-3">
            <div class="text-sm text-gray-600 mb-2">응답 데이터:</div>
            <div class="bg-white p-3 rounded border max-h-40 overflow-auto">
              <pre class="text-xs">{{ JSON.stringify(result.data, null, 2) }}</pre>
            </div>
          </div>

          <!-- 실패 시 오류 정보 -->
          <div v-else class="mt-3">
            <div class="text-sm text-red-600 mb-2">오류:</div>
            <div class="bg-white p-3 rounded border">
              <p class="text-sm text-red-700">{{ result.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 결과 없음 -->
      <div v-if="!isLoading && testResults.length === 0" class="text-center py-8 text-gray-500">
        아직 테스트를 실행하지 않았습니다.<br />
        위의 버튼을 클릭하여 API 테스트를 시작해보세요.
      </div>
    </div>

    <!-- 하단 액션 -->
    <div class="bg-white px-4 py-3 border-t">
      <button
        @click="clearResults"
        :disabled="testResults.length === 0"
        class="w-full py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        결과 지우기
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  runAllApiTests,
  testGetMinuteChart,
  testPostMinuteChart,
  testBatchMinuteChart,
  testMinuteChartTest,
  generateTestTimes,
} from '@/utils/apiTest'

export default {
  name: 'ApiTestPage',
  setup() {
    const router = useRouter()

    // 반응형 데이터
    const isLoading = ref(false)
    const testResults = ref([])
    const testStockCode = ref('005930')
    const apiBaseUrl = ref('http://localhost:8080')

    // 메서드들
    const goBack = () => {
      router.go(-1)
    }

    const clearResults = () => {
      testResults.value = []
    }

    const formatTimestamp = () => {
      return new Date().toLocaleString('ko-KR')
    }

    const addTestResult = (testName, method, url, result) => {
      testResults.value.unshift({
        testName,
        method,
        url,
        timestamp: formatTimestamp(),
        ...result,
      })
    }

    // 개별 테스트 실행
    const runSingleTest = async (testType) => {
      isLoading.value = true

      try {
        let result
        let testName = ''
        let method = ''
        let url = ''

        switch (testType) {
          case 'getCurrentChart':
            testName = '현재 시각 기준 분봉 차트'
            method = 'GET'
            url = `/api/chart/minute/${testStockCode.value}`
            result = await testGetMinuteChart(testStockCode.value)
            break

          case 'getSpecificTimeChart':
            testName = '특정 시각까지 분봉 차트'
            method = 'POST'
            url = `/api/chart/minute/${testStockCode.value}`
            result = await testPostMinuteChart(testStockCode.value, '153000')
            break

          case 'getBatchCharts': {
            testName = '일괄 분봉 차트 조회'
            method = 'POST'
            url = `/api/chart/minute/${testStockCode.value}/batch`
            const testTimes = generateTestTimes(2, 30)
            result = await testBatchMinuteChart(testStockCode.value, testTimes)
            break
          }

          case 'testEndpoint':
            testName = '분봉 차트 테스트'
            method = 'GET'
            url = `/api/chart/minute/${testStockCode.value}/test`
            result = await testMinuteChartTest(testStockCode.value)
            break

          default:
            throw new Error('알 수 없는 테스트 타입입니다.')
        }

        addTestResult(testName, method, url, result)
      } catch (error) {
        addTestResult('테스트 실행', 'ERROR', '', {
          success: false,
          error: error.message,
        })
      } finally {
        isLoading.value = false
      }
    }

    // 전체 테스트 실행
    const runAllTests = async () => {
      isLoading.value = true

      try {
        const results = await runAllApiTests(testStockCode.value)

        // 각 테스트 결과를 개별적으로 추가
        const testMappings = [
          {
            key: 'getCurrentChart',
            name: '현재 시각 기준 분봉 차트',
            method: 'GET',
            url: `/api/chart/minute/${testStockCode.value}`,
          },
          {
            key: 'getSpecificTimeChart',
            name: '특정 시각까지 분봉 차트',
            method: 'POST',
            url: `/api/chart/minute/${testStockCode.value}`,
          },
          {
            key: 'getBatchCharts',
            name: '일괄 분봉 차트 조회',
            method: 'POST',
            url: `/api/chart/minute/${testStockCode.value}/batch`,
          },
          {
            key: 'testEndpoint',
            name: '분봉 차트 테스트',
            method: 'GET',
            url: `/api/chart/minute/${testStockCode.value}/test`,
          },
        ]

        testMappings.forEach((mapping) => {
          if (results[mapping.key]) {
            addTestResult(mapping.name, mapping.method, mapping.url, results[mapping.key])
          }
        })

        // 전체 테스트 완료 메시지
        addTestResult('전체 테스트 완료', 'SUMMARY', '', {
          success: true,
          data: {
            message: '모든 API 테스트가 완료되었습니다.',
            totalTests: testMappings.length,
            successCount: testMappings.filter((m) => results[m.key]?.success).length,
          },
        })
      } catch (error) {
        addTestResult('전체 테스트', 'ERROR', '', {
          success: false,
          error: error.message,
        })
      } finally {
        isLoading.value = false
      }
    }

    return {
      // 반응형 데이터
      isLoading,
      testResults,
      testStockCode,
      apiBaseUrl,

      // 메서드
      goBack,
      clearResults,
      runSingleTest,
      runAllTests,
    }
  },
}
</script>
