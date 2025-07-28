<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <!-- 상단: 헤더 영역 -->
    <header class="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-50">
      <div class="flex items-center justify-between">
        <!-- 뒤로가기 버튼 -->
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- 종목 정보 -->
        <div class="text-center">
          <h1
            class="text-lg text-gray-900 font-semibold tracking-tight"
            style="
              font-family:
                'Apple SD Gothic Neo',
                'Noto Sans KR',
                -apple-system,
                BlinkMacSystemFont,
                system-ui,
                sans-serif;
            "
          >
            {{ stockInfo.name }}
          </h1>
          <div class="flex items-center justify-center gap-2">
            <span class="text-sm font-bold" :class="priceChangeClass">
              {{ formatPrice(stockInfo.currentPrice) }}원
            </span>
            <span class="text-sm" :class="priceChangeClass">
              {{ realTimeChangeRateText }}
            </span>
          </div>
        </div>

        <!-- 오른쪽 여백 (대칭을 위한) -->
        <div class="w-10">
          <!-- API 테스트 버튼
          <button
            @click="testApiCall"
            class="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            :disabled="isLoading"
          >
            {{ isLoading ? '로딩...' : 'API' }}
          </button> -->
        </div>
      </div>
    </header>

    <!-- 중단: 메인 거래 영역 -->
    <main class="flex-1 flex min-h-0">
      <!-- 왼쪽: 호가창 -->
      <section class="w-[45%] bg-white border-r border-gray-200 flex flex-col h-full relative">
        <!-- 호가창 헤더 -->
        <div class="px-3 py-2 border-b border-gray-100">
          <div class="flex justify-between text-xs text-gray-500 font-medium">
            <div class="flex items-center">
              <!-- 가격 뱃지 공간과 동일한 마진 적용 -->
              <div class="w-4 h-4 mr-1.5"></div>
              <span>호가</span>
            </div>
            <span>잔량</span>
          </div>
        </div>

        <!-- 호가창 메인 영역 -->
        <div class="flex-1 overflow-hidden relative">
          <!-- 스크롤 가능한 호가 영역만 -->
          <div class="h-full overflow-y-auto">
            <!-- 상한가 -->
            <div class="px-3 py-1 bg-red-50 border-b border-red-100">
              <div
                class="relative flex justify-between items-center text-sm hover:bg-gray-50 cursor-pointer"
              >
                <!-- 호가 및 잔량 텍스트 -->
                <div class="relative flex items-center">
                  <!-- 가격 뱃지 공간 (일관성을 위해) -->
                  <div class="w-4 h-4 mr-1.5 flex items-center justify-center"></div>
                  <div class="flex flex-col">
                    <span class="font-medium text-red-600">{{
                      formatPrice(stockInfo.upperLimit)
                    }}</span>
                    <span class="text-xs text-red-600">{{
                      getPriceChangeRate(stockInfo.upperLimit)
                    }}</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-red-500">상한가</span>
              </div>
            </div>

            <!-- 매도호가 (현재가보다 비싼 10개) -->
            <div>
              <!-- 실시간 호가 데이터가 없을 때 -->
              <div v-if="askPrices.length === 0" class="text-center py-8 text-gray-400 text-xs">
                실시간 호가 데이터를 기다리는 중...
              </div>

              <div
                v-for="(ask, index) in askPrices"
                :key="'ask-' + index"
                class="relative flex justify-between items-center py-2 px-3 text-sm hover:bg-gray-50 cursor-pointer"
                @click="selectPrice(ask.price)"
              >
                <!-- 잔량 시각화 배경 막대 (오른쪽부터 그려짐, 패딩 추가) -->
                <div
                  class="absolute top-2 bottom-2 right-0 bg-blue-100 opacity-50 rounded-l-md"
                  :style="{ width: getVolumeRatio(ask.volume) + '%' }"
                ></div>
                <!-- 호가 및 잔량 텍스트 -->
                <div class="relative flex items-center">
                  <!-- 가격 뱃지 (고정 너비) -->
                  <div class="w-4 h-4 mr-1.5 flex items-center justify-center">
                    <span
                      v-if="getPriceBadge(ask.price)"
                      class="w-4 h-4 text-[10px] rounded flex items-center justify-center font-bold"
                      :class="getPriceBadge(ask.price).class"
                    >
                      {{ getPriceBadge(ask.price).text }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium" :class="getPriceColorClass(ask.price)">{{
                      formatPrice(ask.price)
                    }}</span>
                    <span class="text-xs" :class="getPriceColorClass(ask.price)">{{
                      getPriceChangeRate(ask.price)
                    }}</span>
                  </div>
                </div>
                <span class="relative text-blue-500">{{ formatVolume(ask.volume) }}</span>
              </div>
            </div>

            <!-- 현재가 구분선 -->
            <div class="px-3">
              <div class="w-full h-px bg-gray-300"></div>
            </div>

            <!-- 매수호가 (현재가보다 싼 10개) -->
            <div>
              <!-- 실시간 호가 데이터가 없을 때 -->
              <div v-if="bidPrices.length === 0" class="text-center py-8 text-gray-400 text-xs">
                실시간 호가 데이터를 기다리는 중...
              </div>

              <div
                v-for="(bid, index) in bidPrices"
                :key="'bid-' + index"
                class="relative flex justify-between items-center py-2 px-3 text-sm hover:bg-gray-50 cursor-pointer"
                @click="selectPrice(bid.price)"
              >
                <!-- 잔량 시각화 배경 막대 (오른쪽부터 그려짐, 패딩 추가) -->
                <div
                  class="absolute top-2 bottom-2 right-0 bg-red-100 opacity-50 rounded-l-md"
                  :style="{ width: getVolumeRatio(bid.volume) + '%' }"
                ></div>
                <!-- 호가 및 잔량 텍스트 -->
                <div class="relative flex items-center">
                  <!-- 가격 뱃지 (고정 너비) -->
                  <div class="w-4 h-4 mr-1.5 flex items-center justify-center">
                    <span
                      v-if="getPriceBadge(bid.price)"
                      class="w-4 h-4 text-[10px] rounded flex items-center justify-center font-bold"
                      :class="getPriceBadge(bid.price).class"
                    >
                      {{ getPriceBadge(bid.price).text }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium" :class="getPriceColorClass(bid.price)">{{
                      formatPrice(bid.price)
                    }}</span>
                    <span class="text-xs" :class="getPriceColorClass(bid.price)">{{
                      getPriceChangeRate(bid.price)
                    }}</span>
                  </div>
                </div>
                <span class="relative text-red-500">{{ formatVolume(bid.volume) }}</span>
              </div>
            </div>

            <!-- 하한가 -->
            <div class="px-3 py-1 bg-blue-50 border-t border-blue-100">
              <div
                class="relative flex justify-between items-center text-sm hover:bg-gray-50 cursor-pointer"
              >
                <!-- 호가 및 잔량 텍스트 -->
                <div class="relative flex items-center">
                  <!-- 가격 뱃지 공간 (일관성을 위해) -->
                  <div class="w-4 h-4 mr-1.5 flex items-center justify-center"></div>
                  <div class="flex flex-col">
                    <span class="font-medium text-blue-600">{{
                      formatPrice(stockInfo.lowerLimit)
                    }}</span>
                    <span class="text-xs text-blue-600">{{
                      getPriceChangeRate(stockInfo.lowerLimit)
                    }}</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-blue-500">하한가</span>
              </div>
            </div>

            <!-- 스크롤을 위한 여백 (체결 강도 박스 높이만큼) -->
            <!-- <div class="h-16"></div> -->
          </div>

          <!-- 체결 내역 (체결강도 박스 바로 위에 오버레이) -->
          <div
            v-if="showTradeHistory"
            class="absolute bottom-0 left-0 right-0 bg-white border border-gray-200 shadow-lg z-40 max-h-48 overflow-y-auto"
          >
            <!-- 체결강도 정보 헤더 (펼쳤을 때 최상단으로 이동) -->
            <div class="px-3 py-2 bg-white border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <!-- 가격 뱃지 공간과 동일한 마진 적용 -->
                  <div class="w-4 h-4 mr-1.5"></div>
                  <span class="text-xs text-gray-500">체결강도</span>
                  <span class="text-sm font-bold ml-2" :class="volumePowerClass">
                    {{ volumePower }}%
                  </span>
                </div>
                <button @click="toggleTradeHistory" class="p-1 hover:bg-gray-200 rounded">
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <!-- 체결 내역 헤더 -->
            <div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <div class="text-xs text-gray-500 font-medium flex justify-between">
                <span>체결가</span>
                <div class="flex gap-4">
                  <span>체결량</span>
                  <span>시간</span>
                </div>
              </div>
            </div>
            <!-- 체결 내역 목록 -->
            <div class="px-3 py-1">
              <div
                v-for="(trade, index) in recentTrades"
                :key="index"
                class="flex justify-between text-xs py-1 hover:bg-gray-50"
              >
                <span
                  :class="
                    trade.type === 'buy' ? 'text-red-600 font-medium' : 'text-blue-600 font-medium'
                  "
                >
                  {{ formatPrice(trade.price) }}
                </span>
                <div class="flex gap-4 items-center">
                  <span :class="trade.type === 'buy' ? 'text-red-600' : 'text-blue-600'">
                    {{ formatVolume(trade.volume) }}
                  </span>
                  <span class="text-gray-400 text-[10px] w-12 text-right">
                    {{ trade.time }}
                  </span>
                </div>
              </div>
              <!-- 체결 내역이 없을 때 -->
              <div v-if="recentTrades.length === 0" class="text-center py-4 text-gray-400 text-xs">
                실시간 체결 데이터를 기다리는 중...
              </div>
            </div>
          </div>
        </div>

        <!-- 체결 강도 박스 (자동 크기 조정) -->
        <div v-if="!showTradeHistory" class="px-3 py-2 border-t border-gray-200 bg-white">
          <div class="flex items-center justify-between h-full">
            <div class="flex items-center">
              <!-- 가격 뱃지 공간과 동일한 마진 적용 -->
              <div class="w-4 h-4 mr-1.5"></div>
              <span class="text-xs text-gray-500">체결강도</span>
              <span class="text-sm font-bold ml-2" :class="volumePowerClass">
                {{ volumePower }}%
              </span>
            </div>
            <button @click="toggleTradeHistory" class="p-1 hover:bg-gray-200 rounded">
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': !showTradeHistory }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 오른쪽: 주문 입력 영역 -->
      <section class="w-[55%] bg-white">
        <div class="p-4 h-full flex flex-col">
          <!-- 거래 유형 탭 -->
          <div class="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              v-for="tab in tradeTabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="flex-1 py-1.5 px-3 text-sm font-medium transition-all duration-200 rounded-md"
              :class="
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              "
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 주문 가격 입력 -->
          <div v-if="activeTab !== 'waiting'" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <!-- 지정가/시장가 선택 -->
            <div class="flex text-sm font-medium mb-3">
              <button
                @click="orderType = 'limit'"
                class="text-left py-1"
                :class="orderType === 'limit' ? 'text-gray-900' : 'text-gray-500'"
              >
                지정가
              </button>
              <span class="text-gray-300 mx-2 py-1">|</span>
              <button
                @click="orderType = 'market'"
                class="text-left py-1"
                :class="orderType === 'market' ? 'text-gray-900' : 'text-gray-500'"
              >
                시장가
              </button>
            </div>

            <!-- 가격 입력 -->
            <div v-if="orderType === 'limit'" class="flex items-center">
              <div class="flex-1 text-left">
                <div class="text-lg font-bold text-gray-900">{{ formatPrice(orderPrice) }}원</div>
              </div>
              <div class="flex gap-1">
                <button
                  @click="decreasePrice"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <button
                  @click="increasePrice"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div v-else class="text-lg font-bold text-gray-900">시장가</div>
          </div>

          <!-- 수량 입력 -->
          <div v-if="activeTab !== 'waiting'" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <!-- 수량 표시 및 조절 -->
            <div class="flex items-center justify-between mb-3">
              <div class="text-lg font-bold">
                <span v-if="orderQuantity > 0" class="text-gray-900">{{ orderQuantity }}주</span>
                <span v-else class="text-gray-400">최대 {{ maxOrderQuantity }}주</span>
              </div>
              <div class="flex gap-1">
                <button
                  @click="decreaseQuantity"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <button
                  @click="increaseQuantity"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 비율 선택 버튼 -->
            <div class="flex text-sm items-center">
              <button
                @click="setQuantityByRatio(10)"
                class="flex-1 text-center py-1.5 text-gray-600 hover:text-gray-900"
              >
                10%
              </button>
              <span class="text-gray-300 mx-1 py-1.5">|</span>
              <button
                @click="setQuantityByRatio(25)"
                class="flex-1 text-center py-1.5 text-gray-600 hover:text-gray-900"
              >
                25%
              </button>
              <span class="text-gray-300 mx-1 py-1.5">|</span>
              <button
                @click="setQuantityByRatio(50)"
                class="flex-1 text-center py-1.5 text-gray-600 hover:text-gray-900"
              >
                50%
              </button>
              <span class="text-gray-300 mx-1 py-1.5">|</span>
              <button
                @click="setQuantityByRatio(100)"
                class="flex-1 text-center py-1.5 text-gray-600 hover:text-gray-900"
              >
                최대
              </button>
            </div>
          </div>

          <!-- 대기 탭 컨텐츠 -->
          <div v-if="activeTab === 'waiting'" class="flex-1 flex flex-col">
            <!-- 상단 영역: 대기 건수 및 새로고침 -->
            <div class="mb-4 px-2">
              <div class="flex items-center justify-between">
                <span class="text-base font-medium text-gray-900"
                  >대기중 {{ pendingOrdersCount }}건</span
                >
                <div class="flex items-center">
                  <span class="text-sm text-gray-500">{{ lastRefreshMinutes }}분 전</span>
                  <button @click="refreshPendingOrders" class="p-1.5 hover:bg-gray-100 rounded">
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 하단 영역: 대기중인 거래 목록 -->
            <div class="flex-1 space-y-2">
              <div
                v-for="order in pendingOrders"
                :key="order.id"
                class="flex items-center justify-between p-2 rounded-lg"
              >
                <div class="flex-1">
                  <div class="flex items-center mb-1">
                    <span
                      class="text-sm font-medium"
                      :class="order.type === 'buy' ? 'text-red-600' : 'text-blue-600'"
                    >
                      {{ order.type === 'buy' ? '구매' : '판매' }}
                    </span>
                    <span class="text-sm font-medium text-gray-900 ml-1"
                      >{{ order.quantity }}주</span
                    >
                  </div>
                  <div class="text-xs text-gray-500">주당 {{ formatPrice(order.price) }}원</div>
                </div>
                <button
                  @click="toggleOrderCheck(order.id)"
                  class="w-6 h-6 rounded-full flex items-center justify-center transition-colors border-2"
                  :class="
                    order.checked
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  "
                >
                  <svg
                    class="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    :class="order.checked ? 'text-white' : 'text-gray-300'"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 구매 가능 금액 / 판매 정보 -->
          <div v-if="activeTab !== 'waiting'" class="mb-6">
            <!-- 구매 모드 -->
            <div v-if="activeTab === 'buy'" class="flex justify-between items-center text-sm">
              <span class="text-gray-500">구매 가능 금액</span>
              <span class="font-medium text-gray-500"
                >{{ formatPrice(userInfo.availableAmount) }}원</span
              >
            </div>

            <!-- 판매 모드 -->
            <div v-else-if="activeTab === 'sell'">
              <!-- 내 주식 평균 -->
              <div class="flex justify-between items-center text-sm mb-3">
                <span class="text-gray-500">내 주식 평균</span>
                <span class="font-medium text-gray-500"
                  >{{ formatPrice(userInfo.avgPrice) }}원</span
                >
              </div>

              <!-- 구분선 -->
              <div class="border-b border-gray-200 mb-3"></div>

              <!-- 예상 수익률 및 예상 손익 -->
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">예상 수익률</span>
                  <span class="font-medium" :class="expectedReturnRateClass">{{
                    expectedReturnRate
                  }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">예상 손익</span>
                  <span class="font-medium" :class="expectedProfitClass">{{ expectedProfit }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 하단 정보 및 버튼 영역 -->
          <div class="mt-auto">
            <!-- 구매/판매 모드의 총 주문 금액 및 주문 버튼 -->
            <div v-if="activeTab !== 'waiting'">
              <!-- 총 주문 금액 -->
              <div class="mb-2">
                <div class="text-right text-base text-gray-600 mb-1 font-bold">총 주문 금액</div>
                <div class="text-right text-lg font-bold">
                  {{ formatPrice(totalOrderAmount) }}원
                </div>
              </div>

              <!-- 주문 버튼 -->
              <button
                @click="submitOrder"
                class="w-full py-3 rounded-lg font-bold text-white transition-colors"
                :class="orderButtonClass"
              >
                {{ orderButtonText }}
              </button>
            </div>

            <!-- 대기 모드의 취소하기 버튼 -->
            <div v-else>
              <button
                @click="cancelSelectedOrders"
                class="w-full py-3 rounded-lg font-bold transition-colors"
                :class="
                  isCancelButtonActive
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-blue-50 text-blue-300 cursor-not-allowed'
                "
                :disabled="!isCancelButtonActive"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 하단: 대기 건수 정보 - 하단 고정 -->
    <footer class="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 z-50">
      <div class="flex items-center text-xs text-gray-500">
        <div class="flex-1 text-right">
          <div class="text-xs text-gray-500">판매 대기</div>
          <div class="text-sm font-medium text-blue-600">
            {{ formatVolume(waitingInfo.sellOrders) }}
          </div>
        </div>
        <div class="flex-shrink-0 text-center px-8">
          <span class="text-sm font-medium">{{ marketStatus }}</span>
        </div>
        <div class="flex-1 text-left">
          <div class="text-xs text-gray-500">구매 대기</div>
          <div class="text-sm font-medium text-red-600">
            {{ formatVolume(waitingInfo.buyOrders) }}
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStockInfo } from '@/services/stockApi.js'

// Vue Router
const route = useRoute()
const router = useRouter()

// 종목 코드 (초기값: 삼성전자, 실제 값은 route.query에서 받아옴)
let STOCK_CODE = ''

// 로딩 상태
const isLoading = ref(false)
const error = ref(null)

// 웹소켓 연결
const socket = ref(null)

// API로부터 종목 정보 로드
const loadStockInfo = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await getStockInfo(STOCK_CODE)
    console.log('API 응답 데이터:', response)

    // API 응답에서 실제 데이터 추출
    if (response && response.output) {
      const data = response.output
      console.log('[API] 받아온 모든 데이터:', data)

      // 실제 API 데이터로 stockInfo 업데이트
      stockInfo.value = {
        // 여기는 나중에 실제 데이터로 업데이트(다른 API 연동이 필요함)
        name: route.query.stockName || '종목명', // 종목명 (005950)
        // 기본 가격 정보
        currentPrice: parseInt(data.stck_prpr) || 0, // 주식 현재가
        basePrice: (parseInt(data.stck_prpr) || 0) - (parseInt(data.prdy_vrss) || 0), // 전일 종가 (현재가 - 전일대비)
        openPrice: parseInt(data.stck_oprc) || 0, // 주식 시가
        dayHigh: parseInt(data.stck_hgpr) || 0, // 주식 최고가 (당일)
        dayLow: parseInt(data.stck_lwpr) || 0, // 주식 최저가 (당일)
        upperLimit: parseInt(data.stck_mxpr) || 0, // 주식 상한가
        lowerLimit: parseInt(data.stck_llam) || 0, // 주식 하한가

        // 거래 정보
        volume: parseInt(data.acml_vol) || 0, // 누적 거래량
        tradingValue: parseInt(data.acml_tr_pbmn) || 0, // 누적 거래대금
        changeAmount: parseInt(data.prdy_vrss) || 0, // 전일 대비
        changeRate: parseFloat(data.prdy_ctrt) || 0, // 전일 대비율
        changeSign: data.prdy_vrss_sign || '3', // 전일 대비 부호
        volumeRate: parseFloat(data.prdy_vrss_vol_rate) || 0, // 전일 대비 거래량 비율

        // 투자지표
        marketCap: data.hts_avls || '', // HTS 시가총액
        per: parseFloat(data.per) || 0, // PER
        eps: parseFloat(data.eps) || 0, // EPS
        pbr: parseFloat(data.pbr) || 0, // PBR
        bps: parseFloat(data.bps) || 0, // BPS

        // 52주 최고/최저가
        week52High: parseInt(data.w52_hgpr) || 0, // 52주일 최고가
        week52Low: parseInt(data.w52_lwpr) || 0, // 52주일 최저가
        week52HighDate: data.w52_hgpr_date || '', // 52주일 최고가 일자
        week52LowDate: data.w52_lwpr_date || '', // 52주일 최저가 일자
        week52HighRate: parseFloat(data.w52_hgpr_vrss_prpr_ctrt) || 0, // 52주일 최고가 대비 현재가 대비
        week52LowRate: parseFloat(data.w52_lwpr_vrss_prpr_ctrt) || 0, // 52주일 최저가 대비 현재가 대비

        // 연중 최고/최저가
        yearHigh: parseInt(data.stck_dryy_hgpr) || 0, // 주식 연중 최고가
        yearLow: parseInt(data.stck_dryy_lwpr) || 0, // 주식 연중 최저가
        yearHighDate: data.dryy_hgpr_date || '', // 연중 최고가 일자
        yearLowDate: data.dryy_lwpr_date || '', // 연중 최저가 일자

        // 외국인 관련
        foreignHoldingQty: parseInt(data.frgn_hldn_qty) || 0, // 외국인 보유 수량
        foreignNetBuyQty: parseInt(data.frgn_ntby_qty) || 0, // 외국인 순매수 수량
        foreignExhaustionRate: parseFloat(data.hts_frgn_ehrt) || 0, // HTS 외국인 소진율

        // 종목 상태
        statusCode: data.iscd_stat_cls_code || '', // 종목 상태 구분 코드
        marketName: data.rprs_mrkt_kor_name || '', // 대표 시장 한글명
        sectorName: data.bstp_kor_isnm || '', // 업종 한글 종목명
        tempStopYn: data.temp_stop_yn === 'Y', // 임시 정지 여부
        creditableYn: data.crdt_able_yn === 'Y', // 신용 가능 여부
        shortSellingYn: data.ssts_yn === 'Y', // 공매도 가능 여부

        // 추가 정보
        listedShares: parseInt(data.lstn_stcn) || 0, // 상장 주수
        faceValue: parseInt(data.stck_fcam) || 0, // 주식 액면가
        capital: parseInt(data.cpfn) || 0, // 자본금
        tickUnit: parseInt(data.aspr_unit) || 0, // 호가단위
        tradingUnit: parseInt(data.hts_deal_qty_unit_val) || 0, // HTS 매매 수량 단위값

        // 투자 주의사항
        investmentCautionYn: data.invt_caful_yn === 'Y', // 투자유의여부
        marketWarnCode: data.mrkt_warn_cls_code || '', // 시장경고코드
        shortOverheatingYn: data.short_over_yn === 'Y', // 단기과열여부
        managementIssueYn: data.mang_issu_cls_code === '1', // 관리종목여부
      }

      // 주문 가격도 현재가로 초기화
      orderPrice.value = stockInfo.value.currentPrice

      // 호가 데이터 생성
      generateOrderBookData(stockInfo.value.currentPrice)

      console.log('종목 정보 업데이트 완료:', stockInfo.value)
      console.log(`
📈 주식 정보 상세:
🏷️  종목명: ${stockInfo.value.name} (${stockInfo.value.sectorName})
💰 현재가: ${stockInfo.value.currentPrice.toLocaleString()}원
📊 전일종가: ${stockInfo.value.basePrice.toLocaleString()}원
🌅 시가: ${stockInfo.value.openPrice.toLocaleString()}원
📈 고가: ${stockInfo.value.dayHigh.toLocaleString()}원 | 📉 저가: ${stockInfo.value.dayLow.toLocaleString()}원
📊 변동: ${data.prdy_vrss_sign === '2' ? '+' : data.prdy_vrss_sign === '4' ? '-' : ''}${stockInfo.value.changeAmount.toLocaleString()}원 (${stockInfo.value.changeRate}%)
📦 거래량: ${stockInfo.value.volume.toLocaleString()}주 (전일대비 ${stockInfo.value.volumeRate}%)
💸 거래대금: ${(stockInfo.value.tradingValue / 100000000).toFixed(1)}억원
🏢 시가총액: ${stockInfo.value.marketCap}
📋 투자지표: PER ${stockInfo.value.per}, PBR ${stockInfo.value.pbr}, EPS ${stockInfo.value.eps}원
🌍 외국인: 보유 ${stockInfo.value.foreignHoldingQty.toLocaleString()}주, 순매수 ${stockInfo.value.foreignNetBuyQty.toLocaleString()}주
📅 52주 고점: ${stockInfo.value.week52High.toLocaleString()}원 (${stockInfo.value.week52HighDate})
📅 52주 저점: ${stockInfo.value.week52Low.toLocaleString()}원 (${stockInfo.value.week52LowDate})
⚠️  종목상태: ${getStockStatusDescription(stockInfo.value.statusCode)} ${stockInfo.value.managementIssueYn ? '(관리종목)' : ''}
      `)
    }
  } catch (err) {
    console.error('Failed to load stock info:', err)
    error.value = '종목 정보를 불러오는데 실패했습니다: ' + err.message
  } finally {
    isLoading.value = false
  }
}

// 종목 상태 코드를 한글로 변환하는 함수
const getStockStatusDescription = (statusCode) => {
  const statusMap = {
    51: '관리종목',
    52: '투자위험',
    53: '투자경고',
    54: '투자주의',
    55: '신용가능',
    57: '증거금100%',
    58: '거래정지',
    59: '단기과열종목',
  }
  return statusMap[statusCode] || '정상'
}

// 종목 정보 (API로부터 동적으로 로드됨)
const stockInfo = ref({
  name: '',
  // 기본 가격 정보
  currentPrice: 0, // 주식 현재가
  basePrice: 0, // 주식 기준가 (전일 종가)
  openPrice: 0, // 주식 시가
  dayHigh: 0, // 주식 최고가 (당일)
  dayLow: 0, // 주식 최저가 (당일)
  upperLimit: 0, // 주식 상한가
  lowerLimit: 0, // 주식 하한가

  // 거래 정보
  volume: 0, // 누적 거래량
  tradingValue: 0, // 누적 거래대금
  changeAmount: 0, // 전일 대비
  changeRate: 0, // 전일 대비율
  changeSign: '3', // 전일 대비 부호
  volumeRate: 0, // 전일 대비 거래량 비율

  // 투자지표
  marketCap: '', // HTS 시가총액
  per: 0, // PER
  eps: 0, // EPS
  pbr: 0, // PBR
  bps: 0, // BPS

  // 52주 최고/최저가
  week52High: 0, // 52주일 최고가
  week52Low: 0, // 52주일 최저가
  week52HighDate: '', // 52주일 최고가 일자
  week52LowDate: '', // 52주일 최저가 일자
  week52HighRate: 0, // 52주일 최고가 대비 현재가 대비
  week52LowRate: 0, // 52주일 최저가 대비 현재가 대비

  // 연중 최고/최저가
  yearHigh: 0, // 주식 연중 최고가
  yearLow: 0, // 주식 연중 최저가
  yearHighDate: '', // 연중 최고가 일자
  yearLowDate: '', // 연중 최저가 일자

  // 외국인 관련
  foreignHoldingQty: 0, // 외국인 보유 수량
  foreignNetBuyQty: 0, // 외국인 순매수 수량
  foreignExhaustionRate: 0, // HTS 외국인 소진율

  // 종목 상태
  statusCode: '', // 종목 상태 구분 코드
  marketName: '', // 대표 시장 한글명
  sectorName: '', // 업종 한글 종목명
  tempStopYn: false, // 임시 정지 여부
  creditableYn: false, // 신용 가능 여부
  shortSellingYn: false, // 공매도 가능 여부

  // 추가 정보
  listedShares: 0, // 상장 주수
  faceValue: 0, // 주식 액면가
  capital: 0, // 자본금
  tickUnit: 0, // 호가단위
  tradingUnit: 0, // HTS 매매 수량 단위값

  // 투자 주의사항
  investmentCautionYn: false, // 투자유의여부
  marketWarnCode: '', // 시장경고코드
  shortOverheatingYn: false, // 단기과열여부
  managementIssueYn: false, // 관리종목여부
})

// 라우터에서 넘어온 stockCode, stockName을 반영
onMounted(() => {
  if (route.query.stockCode) {
    STOCK_CODE = route.query.stockCode
  }
  if (route.query.stockName) {
    stockInfo.value.name = route.query.stockName
  }
  // 필요시 loadStockInfo() 등 추가 초기화 호출
})

// 사용자 정보
const userInfo = ref({
  avgPrice: 66500,
  availableAmount: 2500000,
  holdings: 50, // 보유 주식 수
})

// 거래 상태
// 쿼리 파라미터에서 초기 탭 설정 (ChartPage에서 전달받은 값)
const getInitialTab = () => {
  const tabFromQuery = route.query.tab
  if (tabFromQuery === 'buy' || tabFromQuery === 'sell' || tabFromQuery === 'waiting') {
    return tabFromQuery
  }
  return 'buy' // 기본값
}

const activeTab = ref(getInitialTab()) // 'buy', 'sell', 'waiting'
const orderType = ref('limit') // 'limit', 'market'
const orderPrice = ref(0) // API 로드 후 현재가로 설정됨
const orderQuantity = ref(0)
const showTradeHistory = ref(false)

// 거래 탭 정의
const tradeTabs = [
  { key: 'buy', label: '구매' },
  { key: 'sell', label: '판매' },
  { key: 'waiting', label: '대기' },
]

// 매도호가 (현재가보다 비싼 10개) - 실제 API 데이터 기반으로 생성
const askPrices = ref([])

// 매수호가 (현재가보다 싼 10개) - 실제 API 데이터 기반으로 생성
const bidPrices = ref([])

// 호가 데이터 생성 함수 (더미 데이터, 실시간 데이터가 없을 때만 사용)
const generateOrderBookData = (currentPrice) => {
  if (currentPrice === 0) return // API 로드 전에는 생성하지 않음

  // 실시간 데이터가 이미 있으면 더미 데이터를 생성하지 않음
  // if (askPrices.value.length > 0 && bidPrices.value.length > 0) return

  // console.log('📝 더미 호가 데이터 생성, 현재가:', currentPrice)

  // 매도호가/매수호가 생성 (현재가 기준 호가단위 적용)
  const tick = getTickSize(currentPrice)
  askPrices.value = []
  for (let i = 1; i <= 10; i++) {
    askPrices.value.push({
      price: currentPrice + i * tick,
      volume: Math.floor(Math.random() * 500000) + 50000, // 5만~55만 랜덤
    })
  }

  bidPrices.value = []
  for (let i = 0; i < 10; i++) {
    bidPrices.value.push({
      price: currentPrice - i * tick,
      volume: Math.floor(Math.random() * 600000) + 100000, // 10만~70만 랜덤
    })
  }
}

// 체결 강도
const volumePower = ref(125.4)

// 실시간 거래 내역
const recentTrades = ref([])

// 15시 30분 ~ 20시 사이 NXT 시간 확인 함수
const isNxtTime = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // 15시 30분 이후이고 20시 이전인지 확인
  const isAfter1530 = currentHour > 15 || (currentHour === 15 && currentMinute >= 30)
  const isBefore2000 = currentHour < 20

  return isAfter1530 && isBefore2000
}

// 통합 호가 데이터 처리 함수 (KRX와 NXT 형식 모두 지원)
const processOrderBookData = (data) => {
  // 매도호가 처리 (KRX와 NXT 형식 모두 확인)
  const newAskPrices = []
  for (let i = 10; i >= 1; i--) {
    // KRX 형식과 NXT 형식을 모두 확인 (KRX 우선)
    const price = parseInt(data[`askPrice${i}`] || data[`ASKP${i}`])
    const volume = parseInt(data[`askQty${i}`] || data[`ASKP_RSQN${i}`])

    if (!isNaN(price) && !isNaN(volume) && price > 0) {
      newAskPrices.push({
        price: price,
        volume: volume,
      })
    }
  }

  // 매수호가 처리 (KRX와 NXT 형식 모두 확인)
  const newBidPrices = []
  for (let i = 1; i <= 10; i++) {
    // KRX 형식과 NXT 형식을 모두 확인 (KRX 우선)
    const price = parseInt(data[`bidPrice${i}`] || data[`BIDP${i}`])
    const volume = parseInt(data[`bidQty${i}`] || data[`BIDP_RSQN${i}`])

    if (!isNaN(price) && !isNaN(volume) && price > 0) {
      newBidPrices.push({
        price: price,
        volume: volume,
      })
    }
  }

  // 호가 데이터 업데이트
  if (newAskPrices.length > 0) {
    askPrices.value = newAskPrices
  }

  if (newBidPrices.length > 0) {
    bidPrices.value = newBidPrices
  }

  // 총 매도/매수 호가 잔량 처리 (NXT API 데이터)
  // totalAskQty와 totalBidQty를 우선으로 확인하고, 없으면 기존 필드명 확인
  if (data.totalAskQty) {
    waitingInfo.value.sellOrders = parseInt(data.totalAskQty)
  } else if (data.TOTAL_ASKP_RSQN) {
    waitingInfo.value.sellOrders = parseInt(data.TOTAL_ASKP_RSQN)
  }

  if (data.totalBidQty) {
    waitingInfo.value.buyOrders = parseInt(data.totalBidQty)
  } else if (data.TOTAL_BIDP_RSQN) {
    waitingInfo.value.buyOrders = parseInt(data.TOTAL_BIDP_RSQN)
  }
}

// 웹소켓 연결 초기화
const initWebSocket = async () => {
  try {
    // 종목코드가 없으면 연결하지 않음
    if (!STOCK_CODE) {
      console.warn('[WebSocket] STOCK_CODE 없음, 연결 생략')
      return
    }

    // 1. 먼저 HTTP API로 백엔드 웹소켓 시작 요청
    console.log('[HTTP API] 백엔드 웹소켓 시작 요청:', STOCK_CODE)
    const response = await fetch(`/api/chart/trading?stockCode=${encodeURIComponent(STOCK_CODE)}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    console.log('[HTTP API] 백엔드 웹소켓 시작 완료')

    // 2. 그 다음 프론트엔드 웹소켓 연결 (StockRelaySocket)
    const wsUrl = `ws://localhost:8080/ws/stock`
    console.log('[WebSocket] 프론트엔드 연결 시도:', wsUrl)
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('[WebSocket] 프론트엔드 연결 성공')
      // StockRelaySocket에서 브로드캐스트되는 데이터 수신 대기
    }

    socket.value.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data)
        console.log('[WebSocket] 수신 데이터:', rawData)

        // StockRelaySocket에서 전송하는 데이터 구조에 맞춰 처리
        let data = rawData
        if (rawData.type === 'bidsAndAsks' && rawData.data) {
          data = rawData.data
          console.log('[호가] 데이터 수신:', data)
        } else if (rawData.type === 'execution' && rawData.data) {
          data = rawData.data
          console.log('[체결] 데이터 수신:', data)
        }

        // 기존 데이터 처리 로직은 그대로 유지
        processOrderBookData(data)

        // 나머지 기존 로직들...
        if (data.currentPrice && data.contractVolume) {
          // 체결 내역 처리 로직
        }

        // 현재가 업데이트 로직
        if (data.currentPrice) {
          // 기존 로직 유지
        }
      } catch (err) {
        console.error('웹소켓 데이터 파싱 오류:', err)
      }
    }

    socket.value.onclose = () => {
      console.log('[WebSocket] 연결 종료')
      // 연결이 끊어지면 3초 후 재연결 시도
      setTimeout(() => {
        console.log('[WebSocket] 재연결 시도...')
        initWebSocket()
      }, 3000)
    }

    socket.value.onerror = (error) => {
      console.error('웹소켓 오류:', error)
    }
  } catch (err) {
    console.error('웹소켓 초기화 오류:', err)
  }
}

// 웹소켓 연결 해제
const closeWebSocket = () => {
  if (socket.value) {
    socket.value.close()
    socket.value = null
  }
}

// 대기 정보 (웹소켓에서 실시간 업데이트)
const waitingInfo = ref({
  sellOrders: 0,
  buyOrders: 0,
})

// 대기중인 거래 목록
const pendingOrders = ref([
  {
    id: 1,
    type: 'buy', // 'buy' or 'sell'
    quantity: 10,
    price: 66800,
    checked: false,
  },
  {
    id: 2,
    type: 'sell',
    quantity: 5,
    price: 67200,
    checked: false,
  },
  {
    id: 3,
    type: 'buy',
    quantity: 15,
    price: 66500,
    checked: false,
  },
])

// 새로고침 시점 (분 단위)
const lastRefreshMinutes = ref(2)

// 장 상태 (시간에 따라 동적 변경)
const marketStatus = computed(() => {
  // currentTime을 참조하여 reactive하게 만듦
  currentTime.value
  const isNxt = isNxtTime()
  return isNxt ? 'NXT' : '정규장'
})

// 현재 시간 (reactive)
const currentTime = ref(new Date())

// 계산된 속성들
const priceChangeClass = computed(() => {
  const changeAmount = stockInfo.value.currentPrice - stockInfo.value.basePrice
  return changeAmount > 0 ? 'text-red-600' : changeAmount < 0 ? 'text-blue-600' : 'text-gray-600'
})

// 실시간 변동률 텍스트 (WebSocket 데이터 기반)
const realTimeChangeRateText = computed(() => {
  if (stockInfo.value.basePrice === 0) return '0.00%'

  const rate = stockInfo.value.changeRate

  if (rate > 0) {
    return `+${rate.toFixed(2)}%`
  } else if (rate < 0) {
    return `${rate.toFixed(2)}%`
  } else {
    return '0.00%'
  }
})

const volumePowerClass = computed(() => {
  return volumePower.value > 100 ? 'text-red-600' : 'text-blue-600'
})

// 최대 주문 가능 수량 계산
const maxOrderQuantity = computed(() => {
  if (activeTab.value === 'buy') {
    // 구매 시: 가용 자금으로 살 수 있는 최대 주식 수
    return Math.floor(userInfo.value.availableAmount / orderPrice.value)
  } else if (activeTab.value === 'sell') {
    // 판매 시: 보유 주식 수
    return userInfo.value.holdings
  }
  return 0
})

// const expectedAvgPrice = computed(() => {
//   if (orderQuantity.value === 0) return userInfo.value.avgPrice

//   const totalValue =
//     userInfo.value.avgPrice * userInfo.value.holdings + orderPrice.value * orderQuantity.value
//   const totalShares = userInfo.value.holdings + orderQuantity.value

//   return Math.round(totalValue / totalShares)
// })

// 비율에 따른 수량 설정 함수
const setQuantityByRatio = (ratio) => {
  if (activeTab.value === 'buy') {
    // 구매 시: 가용 자금으로 살 수 있는 최대 주식 수
    const availableShares = Math.floor(userInfo.value.availableAmount / orderPrice.value)
    const targetQuantity = Math.floor((availableShares * ratio) / 100)
    orderQuantity.value = Math.max(0, targetQuantity)
  } else if (activeTab.value === 'sell') {
    // 판매 시: 보유 주식 수의 비율
    const targetQuantity = Math.floor((userInfo.value.holdings * ratio) / 100)
    orderQuantity.value = Math.max(0, Math.min(targetQuantity, userInfo.value.holdings))
  }
}

const totalOrderAmount = computed(() => {
  return orderPrice.value * orderQuantity.value
})

// 예상 수익률 계산 (판매 시)
const expectedReturnRate = computed(() => {
  if (activeTab.value !== 'sell') return '0.00%'

  const avgPrice = userInfo.value.avgPrice
  const sellPrice = orderPrice.value
  const returnRate = ((sellPrice - avgPrice) / avgPrice) * 100

  if (returnRate > 0) {
    return `+${returnRate.toFixed(2)}%`
  } else if (returnRate < 0) {
    return `${returnRate.toFixed(2)}%`
  } else {
    return '0.00%'
  }
})

// 예상 손익 계산 (판매 시)
const expectedProfit = computed(() => {
  if (activeTab.value !== 'sell') return '0원'

  const avgPrice = userInfo.value.avgPrice
  const sellPrice = orderPrice.value
  const quantity = orderQuantity.value || 1 // 수량이 0이면 1주 기준으로 계산
  const profit = (sellPrice - avgPrice) * quantity

  if (profit > 0) {
    return `+${formatPrice(Math.abs(profit))}원`
  } else if (profit < 0) {
    return `-${formatPrice(Math.abs(profit))}원`
  } else {
    return '0원'
  }
})

// 예상 수익률 색상 클래스
const expectedReturnRateClass = computed(() => {
  if (activeTab.value !== 'sell') return 'text-gray-500'

  const avgPrice = userInfo.value.avgPrice
  const sellPrice = orderPrice.value
  const returnRate = ((sellPrice - avgPrice) / avgPrice) * 100

  if (returnRate > 0) {
    return 'text-red-600'
  } else if (returnRate < 0) {
    return 'text-blue-600'
  } else {
    return 'text-gray-500'
  }
})

// 예상 손익 색상 클래스
const expectedProfitClass = computed(() => {
  if (activeTab.value !== 'sell') return 'text-gray-500'

  const avgPrice = userInfo.value.avgPrice
  const sellPrice = orderPrice.value
  const quantity = orderQuantity.value || 1 // 수량이 0이면 1주 기준으로 계산
  const profit = (sellPrice - avgPrice) * quantity

  if (profit > 0) {
    return 'text-red-600'
  } else if (profit < 0) {
    return 'text-blue-600'
  } else {
    return 'text-gray-500'
  }
})

// 대기중인 거래 건수
const pendingOrdersCount = computed(() => {
  return pendingOrders.value.length
})

// 체크된 거래 건수
const checkedOrdersCount = computed(() => {
  return pendingOrders.value.filter((order) => order.checked).length
})

// 취소하기 버튼 활성화 여부
const isCancelButtonActive = computed(() => {
  return checkedOrdersCount.value > 0
})

const orderButtonClass = computed(() => {
  switch (activeTab.value) {
    case 'buy':
      return 'bg-red-500 hover:bg-red-600'
    case 'sell':
      return 'bg-blue-500 hover:bg-blue-600'
    default:
      return 'bg-gray-500 hover:bg-gray-600'
  }
})

const orderButtonText = computed(() => {
  switch (activeTab.value) {
    case 'buy':
      return '구매하기'
    case 'sell':
      return '판매하기'
    case 'waiting':
      return '대기주문'
    default:
      return '주문하기'
  }
})

// const canOrder = computed(() => {
//   if (orderQuantity.value <= 0) return false
//   if (activeTab.value === 'buy' && totalOrderAmount.value > userInfo.value.availableAmount)
//     return false
//   if (activeTab.value === 'sell' && orderQuantity.value > userInfo.value.holdings) return false
//   return true
// })

// 호가창 잔량 시각화를 위한 최대값 계산
const maxVolume = computed(() => {
  const allVolumes = [
    ...askPrices.value.map((item) => item.volume),
    ...bidPrices.value.map((item) => item.volume),
  ]
  return Math.max(...allVolumes)
})

// 잔량 비율 계산 함수 (최대 50%로 제한)
const getVolumeRatio = (volume) => {
  return (volume / maxVolume.value) * 50
}

// 메서드들
const goBack = () => {
  // stockCode와 stockName을 보존하여 mock-trading/{stockCode}/chart?stockName={stockName}로 이동
  const stockCode = route.query.stockCode || stockInfo.value.stockCode || ''
  const stockName = route.query.stockName || stockInfo.value.name || ''
  router.push({
    path: `/mock-trading/${stockCode}/chart`,
    query: {
      stockName,
    },
  })
}

const formatPrice = (price) => {
  return price.toLocaleString()
}

const formatVolume = (volume) => {
  return volume.toLocaleString()
}

const getPriceColorClass = (price) => {
  if (price > stockInfo.value.basePrice) return 'text-red-600'
  if (price < stockInfo.value.basePrice) return 'text-blue-600'
  return 'text-gray-600'
}

// 전일 종가(basePrice) 대비 상승률/하락률 계산 함수 (증권사 방식: 소수점 3자리에서 버림)
const getPriceChangeRate = (price) => {
  if (stockInfo.value.basePrice === 0) return '0.00%'
  const changeRate = ((price - stockInfo.value.basePrice) / stockInfo.value.basePrice) * 100

  // 소수점 3자리에서 버림 (증권사 표준 방식)
  // 양수는 Math.floor, 음수는 Math.ceil 사용
  const truncated =
    changeRate >= 0 ? Math.floor(changeRate * 100) / 100 : Math.ceil(changeRate * 100) / 100

  if (truncated > 0) {
    return `+${truncated.toFixed(2)}%`
  } else if (truncated < 0) {
    return `${truncated.toFixed(2)}%`
  } else {
    return '0.00%'
  }
} // 가격 뱃지 정보 반환 함수
const getPriceBadge = (price) => {
  if (price === stockInfo.value.openPrice) {
    return { text: '시', class: 'bg-gray-400 text-white' }
  } else if (price === stockInfo.value.dayHigh) {
    return { text: '고', class: 'bg-red-500 text-white' }
  } else if (price === stockInfo.value.dayLow) {
    return { text: '저', class: 'bg-blue-500 text-white' }
  }
  return null
}

const selectPrice = (price) => {
  orderPrice.value = price
}

// 호가단위 계산 함수 (현재가 기준)
const getTickSize = (price) => {
  if (price < 2000) return 1
  if (price < 5000) return 5
  if (price < 20000) return 10
  if (price < 50000) return 50
  if (price < 200000) return 100
  if (price < 500000) return 500
  return 1000
}

// 주문 가격 증가/감소 함수
const increasePrice = () => {
  orderPrice.value += getTickSize(stockInfo.value.currentPrice)
}
const decreasePrice = () => {
  const tick = getTickSize(stockInfo.value.currentPrice)
  if (orderPrice.value > tick) {
    orderPrice.value -= tick
  }
}

const increaseQuantity = () => {
  orderQuantity.value += 1
}

const decreaseQuantity = () => {
  if (orderQuantity.value > 0) {
    orderQuantity.value -= 1
  }
}

const toggleTradeHistory = () => {
  showTradeHistory.value = !showTradeHistory.value
}

// 대기 탭 관련 메서드들
const toggleOrderCheck = (orderId) => {
  const order = pendingOrders.value.find((o) => o.id === orderId)
  if (order) {
    order.checked = !order.checked
  }
}

const refreshPendingOrders = () => {
  lastRefreshMinutes.value = 0
  // 실제로는 서버에서 데이터를 다시 가져오는 로직
  console.log('대기 주문 새로고침')
}

const cancelSelectedOrders = () => {
  const checkedOrders = pendingOrders.value.filter((order) => order.checked)
  if (checkedOrders.length === 0) {
    alert('취소할 주문을 선택해주세요.')
    return
  }

  // 취소 처리 로직
  console.log('선택된 주문 취소:', checkedOrders)

  // 취소된 주문 제거
  pendingOrders.value = pendingOrders.value.filter((order) => !order.checked)
}

const submitOrder = () => {
  // 주문 유효성 검사
  if (orderQuantity.value <= 0) {
    alert('주문 수량을 입력해주세요.')
    return
  }

  if (activeTab.value === 'buy' && totalOrderAmount.value > userInfo.value.availableAmount) {
    alert('구매 가능 금액을 초과했습니다.')
    return
  }

  if (activeTab.value === 'sell' && orderQuantity.value > userInfo.value.holdings) {
    alert('보유 주식 수량을 초과했습니다.')
    return
  }

  // 주문 처리 로직
  console.log('주문 제출:', {
    type: activeTab.value,
    orderType: orderType.value,
    price: orderPrice.value,
    quantity: orderQuantity.value,
    totalAmount: totalOrderAmount.value,
  })

  // 주문 완료 후 초기화
  orderQuantity.value = 0
}

// API 테스트 함수
const testApiCall = async () => {
  await loadStockInfo()
}

// 시간 업데이트를 위한 타이머
const timeUpdateTimer = ref(null)

// 컴포넌트 마운트 시 API 호출 및 웹소켓 연결
onMounted(() => {
  console.log('[초기화] 컴포넌트 마운트 시작')
  testApiCall()
  initWebSocket()

  // 1초마다 시간 업데이트를 위한 타이머
  timeUpdateTimer.value = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

// 컴포넌트 언마운트 시 웹소켓 연결 해제
onUnmounted(() => {
  closeWebSocket()

  // 타이머 정리
  if (timeUpdateTimer.value) {
    clearInterval(timeUpdateTimer.value)
    timeUpdateTimer.value = null
  }
})
</script>
