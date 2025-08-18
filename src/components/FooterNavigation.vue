<template>
  <div>
    <!-- 드래그 가능한 챗봇 버튼 -->
    <button
      ref="chatbotButton"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="goToChatbot"
      @touchend="handleTouchEnd"
      class="chatbot-button bg-blue-50 fixed text-white px-2 py-2 rounded-full shadow-lg z-50 hover:scale-105 transition-transform duration-300"
      :style="{
        left: position.x + 'px',
        top: position.y + 'px',
      }"
    >
      <img src="@/assets/chatbot2.png" alt="챗봇" class="w-12 h-12" />
    </button>
    <!-- 하단 네비게이션 -->
    <nav
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 flex justify-around py-2 z-50"
    >
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center text-xs w-full"
        :class="isActive(item.to) ? 'font-normal' : 'font-normal'"
        :style="isActive(item.to) ? 'color: #0063F7' : 'color: black'"
      >
        <!-- 아이콘 렌더링 분기 -->
        <div class="mb-1">
          <component v-if="typeof item.icon === 'object'" :is="item.icon" />
          <div v-else class="text-lg">{{ item.icon() }}</div>
        </div>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import HomeIcon from './icons/HomeIcon.vue'
import TradingIcon from './icons/TradingIcon.vue'
import StudyIcon from './icons/StudyIcon.vue'
import RankingIcon from './icons/RankingIcon.vue'
import MypageIcon from './icons/MypageIcon.vue'
const route = useRoute()
const chatbotButton = ref(null)
// 드래그 위치 상태 (초기 위치는 원래와 동일)
const position = reactive({
  x: 0, // onMounted에서 설정
  y: 0, // onMounted에서 설정
})
// 모바일 컨테이너 경계 계산
const getMobileContainerBounds = () => {
  const containerMaxWidth = 430
  const viewportWidth = window.innerWidth
  const containerLeft = Math.max((viewportWidth - containerMaxWidth) / 2, 0)
  const containerRight = containerLeft + Math.min(containerMaxWidth, viewportWidth)
  // 푸터 네비게이션 높이 (py-2 + 아이콘 + 텍스트 ≈ 72px)
  const footerHeight = 72
  return {
    left: containerLeft,
    right: containerRight,
    top: 0,
    bottom: window.innerHeight - footerHeight, // 푸터 영역 제외
  }
}
// 드래그 관련 변수
let isPress = false
let prevPosX = 0
let prevPosY = 0
let isDragging = false
let startX = 0
let startY = 0
let dragStartTime = 0
let touchHandled = false

const navItems = [
  { name: 'home', label: '홈', to: '/home', icon: HomeIcon },
  { name: 'mock', label: '거래', to: '/mock-trading', icon: TradingIcon },
  { name: 'study', label: '학습', to: '/learning', icon: StudyIcon },
  { name: 'ranking', label: '랭킹', to: '/ranking', icon: RankingIcon },
  { name: 'mypage', label: '마이페이지', to: '/profile', icon: MypageIcon },
]

// 디바이스 타입 감지
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 드래그 시작 (마우스 + 터치)
const startDrag = (e) => {
  // 터치 이벤트와 마우스 이벤트 구분
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  prevPosX = clientX
  prevPosY = clientY
  startX = clientX
  startY = clientY
  dragStartTime = Date.now()
  isPress = true
  isDragging = false
  touchHandled = false

  // 터치 이벤트의 경우 preventDefault만 적용
  if (e.touches) {
    // touchstart에서는 preventDefault 하지 않음 (클릭 이벤트를 위해)
  } else {
    e.preventDefault() // 마우스 이벤트만 preventDefault
  }

  // 드래그 중 커서 변경
  if (chatbotButton.value) {
    chatbotButton.value.style.cursor = 'grabbing'
  }
}
// 드래그 이동 (마우스 + 터치)
const moveDrag = (e) => {
  if (!isPress) return

  // 터치 이벤트와 마우스 이벤트 구분
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const posX = prevPosX - clientX
  const posY = prevPosY - clientY

  // 일정 거리 이상 움직이면 드래그로 판단
  const dragDistance = Math.sqrt(Math.pow(clientX - startX, 2) + Math.pow(clientY - startY, 2))

  if (dragDistance > 5) {
    isDragging = true
    touchHandled = true
    // 드래그가 시작되면 이제 기본 동작 방지
    e.preventDefault()
  }
  prevPosX = clientX
  prevPosY = clientY
  // 새로운 위치 계산
  let newX = position.x - posX
  let newY = position.y - posY
  // 모바일 컨테이너 경계 제한
  const bounds = getMobileContainerBounds()
  const buttonSize = 64 // 버튼 크기 (w-12 h-12 + padding)
  const margin = 8
  newX = Math.max(bounds.left + margin, Math.min(bounds.right - buttonSize - margin, newX))
  newY = Math.max(bounds.top + margin, Math.min(bounds.bottom - buttonSize - margin, newY))
  position.x = newX
  position.y = newY
}

// 터치 종료 처리
const handleTouchEnd = (e) => {
  if (!isPress) return

  const touchDuration = Date.now() - dragStartTime
  const dragDistance = Math.sqrt(
    Math.pow(e.changedTouches[0].clientX - startX, 2) +
      Math.pow(e.changedTouches[0].clientY - startY, 2),
  )

  // 터치가 짧고 이동거리가 적으면 클릭으로 판단
  if (touchDuration < 200 && dragDistance < 5 && !touchHandled) {
    // 클릭 이벤트를 수동으로 발생시키지 않고, 자연스러운 클릭 이벤트가 발생하도록 함
    touchHandled = false
  } else {
    // 드래그였다면 클릭 이벤트 방지
    touchHandled = true
    e.preventDefault()
  }

  endDrag()
}

// 드래그 종료
const endDrag = () => {
  if (!isPress) return // 이미 종료된 상태면 무시
  isPress = false
  // 드래그 종료 시 커서 원복
  if (chatbotButton.value) {
    chatbotButton.value.style.cursor = 'grab'
  }

  // 잠시 후 isDragging 상태 리셋
  setTimeout(() => {
    isDragging = false
    touchHandled = false
  }, 100)
}
const goToChatbot = (e) => {
  // 터치 이벤트에서 드래그로 판단된 경우 클릭 무시
  if (touchHandled || isDragging) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  // 챗봇 패널 열기 이벤트 발생
  window.dispatchEvent(new CustomEvent('openChatBot'))
}
const isActive = (path) => route.path.startsWith(path)
// 화면 크기 변경 시 버튼 위치 조정
const handleResize = () => {
  const bounds = getMobileContainerBounds()
  const buttonSize = 64
  const margin = 8
  // 현재 위치가 경계를 벗어나면 조정
  position.x = Math.max(
    bounds.left + margin,
    Math.min(bounds.right - buttonSize - margin, position.x),
  )
  position.y = Math.max(
    bounds.top + margin,
    Math.min(bounds.bottom - buttonSize - margin, position.y),
  )
}
onMounted(() => {
  // 초기 위치 설정 (원래 CSS와 동일하게)
  const bounds = getMobileContainerBounds()
  const buttonSize = 64
  position.x = bounds.right - buttonSize - 16 // 오른쪽에서 16px 떨어진 위치
  position.y = bounds.bottom - buttonSize - 16 // 푸터 위쪽 16px 떨어진 위치
  // 마우스 이벤트 리스너 등록
  window.addEventListener('mousemove', moveDrag)
  window.addEventListener('mouseup', endDrag)

  // 터치 이벤트 리스너 등록 (passive: false로 preventDefault 허용)
  window.addEventListener('touchmove', moveDrag, { passive: false })
  window.addEventListener('touchend', endDrag)
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  // 마우스 이벤트 리스너 해제
  window.removeEventListener('mousemove', moveDrag)
  window.removeEventListener('mouseup', endDrag)
  // 터치 이벤트 리스너 해제
  window.removeEventListener('touchmove', moveDrag)
  window.removeEventListener('touchend', endDrag)
  window.removeEventListener('resize', handleResize)
})
</script>
<style scoped>
.chatbot-button {
  cursor: grab;
  user-select: none;
  -webkit-tap-highlight-color: transparent; /* 터치 시 하이라이트 제거 */
  touch-action: none; /* 기본 터치 동작 제어 */
}
.chatbot-button:active {
  cursor: grabbing;
}
/* 드래그 중일 때 호버 효과 제거 */
.chatbot-button:active:hover {
  transform: scale(1);
}
</style>
