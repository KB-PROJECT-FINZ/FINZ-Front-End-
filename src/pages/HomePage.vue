<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 헤더 -->
    <header class="bg-blue-500 text-white p-4 sticky top-0 z-50">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">FINZ</h1>
        <div class="flex gap-3">
          <button
            class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center text-lg"
          >
            🔔
          </button>
          <button
            class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center text-lg"
          >
            👤
          </button>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 p-5 pb-24">
      <!-- 잔액 카드 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm text-center">
        <div class="text-gray-500 text-sm mb-2">총 자산</div>
        <div class="text-3xl font-bold text-gray-800 mb-2">₩12,345,678</div>
        <div class="text-sm font-medium text-red-500">+2.34% (↗ ₩289,123)</div>
      </div>

      <!-- 빠른 액션 버튼들 -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <button
          class="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center gap-2 hover:shadow-md"
        >
          <span class="text-2xl">💰</span>
          <span class="text-xs text-gray-600 font-medium">입금</span>
        </button>
        <button
          class="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center gap-2 hover:shadow-md"
        >
          <span class="text-2xl">📊</span>
          <span class="text-xs text-gray-600 font-medium">거래</span>
        </button>
        <button
          class="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center gap-2 hover:shadow-md"
        >
          <span class="text-2xl">📈</span>
          <span class="text-xs text-gray-600 font-medium">포트폴리오</span>
        </button>
        <button
          class="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center gap-2 hover:shadow-md"
        >
          <span class="text-2xl">📰</span>
          <span class="text-xs text-gray-600 font-medium">뉴스</span>
        </button>
      </div>

      <!-- 인기 종목 -->
      <section class="mb-8">
        <h2 class="text-lg font-bold text-gray-800 mb-4">인기 종목</h2>
        <div class="bg-white rounded-xl overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div class="font-semibold text-gray-800 mb-1">삼성전자</div>
              <div class="text-xs text-gray-500">005930</div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-800 mb-1">71,000원</div>
              <div class="text-xs font-medium text-red-500">+1.43%</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div class="font-semibold text-gray-800 mb-1">SK하이닉스</div>
              <div class="text-xs text-gray-500">000660</div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-800 mb-1">89,500원</div>
              <div class="text-xs font-medium text-blue-500">-0.56%</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-4">
            <div>
              <div class="font-semibold text-gray-800 mb-1">NAVER</div>
              <div class="text-xs text-gray-500">035420</div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-800 mb-1">186,000원</div>
              <div class="text-xs font-medium text-red-500">+2.15%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 최근 거래 -->
      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-4">최근 거래</h2>
        <div class="bg-white rounded-xl overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div
                class="inline-block px-2 py-1 rounded bg-red-50 text-red-500 text-xs font-semibold mb-1"
              >
                매수
              </div>
              <div class="font-medium text-gray-800">카카오</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-800 mb-1">10주</div>
              <div class="text-xs text-gray-500">2시간 전</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-4">
            <div>
              <div
                class="inline-block px-2 py-1 rounded bg-blue-50 text-blue-500 text-xs font-semibold mb-1"
              >
                매도
              </div>
              <div class="font-medium text-gray-800">LG화학</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-800 mb-1">5주</div>
              <div class="text-xs text-gray-500">1일 전</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 하단 네비게이션 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import BottomNavigation from '../components/BottomNavigation.vue'

// 여기에 나중에 로직 추가 가능
</script>
