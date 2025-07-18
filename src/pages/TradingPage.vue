<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <!-- 상단: 헤더 영역 -->
    <header class="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-50">
      <div class="flex items-center justify-between">
        <!-- 뒤로가기 버튼 -->
        <button class="p-2 hover:bg-gray-100 rounded-lg">
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
              {{ changeRateText }}
            </span>
          </div>
        </div>

        <!-- 오른쪽 여백 (대칭을 위한) -->
        <div class="w-10"></div>
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
                <span>체결수량</span>
              </div>
            </div>
            <!-- 체결 내역 목록 -->
            <div class="px-3 py-1">
              <div
                v-for="(trade, index) in recentTrades"
                :key="index"
                class="flex justify-between text-xs py-1 hover:bg-gray-50"
              >
                <span class="text-gray-600">
                  {{ formatPrice(trade.price) }}
                </span>
                <span :class="trade.type === 'buy' ? 'text-red-600' : 'text-blue-600'">
                  {{ formatVolume(trade.volume) }}
                </span>
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
import { ref, computed } from 'vue'

// 호가 단위 (삼성전자 기준)
const tickSize = 100

// 상한가/하한가 계산 함수 (호가 단위에 맞춤)
const calculatePriceLimits = (basePrice, tickSize) => {
  // 30% 증가/감소의 정확한 계산
  const upperLimit30 = basePrice * 1.3
  const lowerLimit30 = basePrice * 0.7

  // 호가 단위에 맞춰 조정 (30% 제한을 넘지 않도록)
  // 상한가: 30% 이하가 되도록 아래로 조정
  const upperLimit = Math.floor(upperLimit30 / tickSize) * tickSize
  // 하한가: -30% 이상이 되도록 위로 조정 (더 높은 가격으로)
  const lowerLimit = Math.ceil(lowerLimit30 / tickSize) * tickSize

  return { upperLimit, lowerLimit }
}

// 종목 정보
const basePrice = 66700 // 시작가 (전일 종가)
const { upperLimit, lowerLimit } = calculatePriceLimits(basePrice, tickSize)

const stockInfo = ref({
  name: '삼성전자',
  currentPrice: 67000,
  basePrice,
  dayHigh: 67700, // 당일 고가
  dayLow: 66300, // 당일 저가
  upperLimit, // 상한가 (기준가 + 30% 이하, 호가단위 맞춤)
  lowerLimit, // 하한가 (기준가 - 30% 이상, 호가단위 맞춤)
})

// 사용자 정보
const userInfo = ref({
  avgPrice: 66500,
  availableAmount: 2500000,
  holdings: 50, // 보유 주식 수
})

// 거래 상태
const activeTab = ref('buy') // 'buy', 'sell', 'waiting'
const orderType = ref('limit') // 'limit', 'market'
const orderPrice = ref(stockInfo.value.currentPrice)
const orderQuantity = ref(0)
const showTradeHistory = ref(false)

// 거래 탭 정의
const tradeTabs = [
  { key: 'buy', label: '구매' },
  { key: 'sell', label: '판매' },
  { key: 'waiting', label: '대기' },
]

// 매도호가 (현재가보다 비싼 10개) - 더미 데이터
const askPrices = ref([
  { price: 68000, volume: 242760 },
  { price: 67900, volume: 199270 },
  { price: 67800, volume: 170487 },
  { price: 67700, volume: 622248 },
  { price: 67600, volume: 346514 },
  { price: 67500, volume: 175643 },
  { price: 67400, volume: 183935 },
  { price: 67300, volume: 166973 },
  { price: 67200, volume: 126619 },
  { price: 67100, volume: 106374 },
])

// 매수호가 (현재가보다 싼 10개) - 더미 데이터
const bidPrices = ref([
  { price: 67000, volume: 198542 },
  { price: 66900, volume: 234567 },
  { price: 66800, volume: 345678 },
  { price: 66700, volume: 456789 },
  { price: 66600, volume: 123456 },
  { price: 66500, volume: 234567 },
  { price: 66400, volume: 345678 },
  { price: 66300, volume: 456789 },
  { price: 66200, volume: 567890 },
  { price: 66100, volume: 678901 },
])

// 체결 강도
const volumePower = ref(125.4)

// 실시간 거래 내역 - 더미 데이터
const recentTrades = ref([
  { price: 66700, volume: 150, type: 'buy', time: '15:29:45' },
  { price: 66600, volume: 200, type: 'sell', time: '15:29:44' },
  { price: 66700, volume: 100, type: 'buy', time: '15:29:43' },
  { price: 66600, volume: 300, type: 'sell', time: '15:29:42' },
  { price: 66700, volume: 250, type: 'buy', time: '15:29:41' },
])

// 대기 정보
const waitingInfo = ref({
  sellOrders: 3872704,
  buyOrders: 1271493,
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

// 장 상태
const marketStatus = ref('정규장')

// 계산된 속성들
const priceChangeClass = computed(() => {
  const changeAmount = stockInfo.value.currentPrice - stockInfo.value.basePrice
  return changeAmount > 0 ? 'text-red-600' : changeAmount < 0 ? 'text-blue-600' : 'text-gray-600'
})

// 변동률 계산 (시작가 대비 현재가)
const changeRate = computed(() => {
  const changeAmount = stockInfo.value.currentPrice - stockInfo.value.basePrice
  if (stockInfo.value.basePrice === 0) return 0
  return (changeAmount / stockInfo.value.basePrice) * 100
})

// 변동률 텍스트 (+ 기호 포함)
const changeRateText = computed(() => {
  const rate = changeRate.value
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

const expectedAvgPrice = computed(() => {
  if (orderQuantity.value === 0) return userInfo.value.avgPrice

  const totalValue =
    userInfo.value.avgPrice * userInfo.value.holdings + orderPrice.value * orderQuantity.value
  const totalShares = userInfo.value.holdings + orderQuantity.value

  return Math.round(totalValue / totalShares)
})

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

const canOrder = computed(() => {
  if (orderQuantity.value <= 0) return false
  if (activeTab.value === 'buy' && totalOrderAmount.value > userInfo.value.availableAmount)
    return false
  if (activeTab.value === 'sell' && orderQuantity.value > userInfo.value.holdings) return false
  return true
})

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

// 현재가 대비 상승률/하락률 계산 함수
const getPriceChangeRate = (price) => {
  const changeRate = ((price - stockInfo.value.currentPrice) / stockInfo.value.currentPrice) * 100
  if (changeRate > 0) {
    return `+${changeRate.toFixed(2)}%`
  } else if (changeRate < 0) {
    return `${changeRate.toFixed(2)}%`
  } else {
    return '0.00%'
  }
}

// 가격 뱃지 정보 반환 함수
const getPriceBadge = (price) => {
  if (price === stockInfo.value.basePrice) {
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

const increasePrice = () => {
  orderPrice.value += tickSize
}

const decreasePrice = () => {
  if (orderPrice.value > tickSize) {
    orderPrice.value -= tickSize
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
</script>
