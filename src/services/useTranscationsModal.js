import { ref } from 'vue'

/**
 * 거래 내역 모달 인터랙션 Composable
 *
 * - 모달 표시/숨기기 상태
 * - 드래그 인터랙션 로직
 * - 터치/마우스 이벤트 처리
 */
export function useTransactionsModal() {
  // ==================== 상태 관리 ====================
  const showPeriodModal = ref(false)
  const modalDragOffset = ref(0)
  const isDragging = ref(false)
  const dragStartY = ref(0)
  const dragStartOffset = ref(0)

  // ==================== 모달 제어 ====================

  /**
   * 기간 선택 모달 닫기
   */
  function closePeriodModal() {
    showPeriodModal.value = false
    resetModalPosition()
  }

  /**
   * 모달 위치 리셋
   */
  function resetModalPosition() {
    modalDragOffset.value = 0
    isDragging.value = false
  }

  // ==================== 드래그 인터랙션 ====================

  /**
   * 드래그 시작 처리
   * @param {Event} event - 마우스/터치 이벤트
   */
  function onModalDragStart(event) {
    isDragging.value = true
    dragStartOffset.value = modalDragOffset.value

    // 터치 이벤트와 마우스 이벤트 모두 지원
    dragStartY.value = event.touches ? event.touches[0].clientY : event.clientY

    // 마우스 이벤트의 경우 기본 동작 방지
    if (!event.touches) {
      event.preventDefault()
    }
  }

  /**
   * 드래그 이동 처리
   * @param {Event} event - 마우스/터치 이벤트
   */
  function onModalDragMove(event) {
    if (!isDragging.value) return

    event.preventDefault()

    // 터치 이벤트와 마우스 이벤트 모두 지원
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    const deltaY = clientY - dragStartY.value
    const newOffset = dragStartOffset.value + deltaY

    // 아래쪽으로만 드래그 허용 (양수 방향만)
    modalDragOffset.value = Math.max(0, newOffset)
  }

  /**
   * 드래그 종료 처리
   */
  function onModalDragEnd() {
    if (!isDragging.value) return

    const threshold = 100 // 모달을 닫기 위한 최소 드래그 거리

    if (modalDragOffset.value > threshold) {
      // 임계값을 넘으면 모달 닫기
      closePeriodModal()
    } else {
      // 임계값 미만이면 원래 위치로 복귀
      modalDragOffset.value = 0
    }

    isDragging.value = false
  }

  // ==================== 키보드 이벤트 ====================

  /**
   * ESC 키로 모달 닫기
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  function onEscapeKey(event) {
    if (event.key === 'Escape' && showPeriodModal.value) {
      closePeriodModal()
    }
  }


  // ==================== 이벤트 리스너 관리 ====================

  /**
   * 전역 이벤트 리스너 등록
   */
  function addGlobalEventListeners() {
    document.addEventListener('keydown', onEscapeKey)

    // 모바일에서 드래그가 화면 밖으로 나갔을 때 처리
    document.addEventListener('touchend', handleGlobalTouchEnd)
    document.addEventListener('mouseup', handleGlobalMouseUp)
  }

  /**
   * 전역 이벤트 리스너 제거
   */
  function removeGlobalEventListeners() {
    document.removeEventListener('keydown', onEscapeKey)
    document.removeEventListener('touchend', handleGlobalTouchEnd)
    document.removeEventListener('mouseup', handleGlobalMouseUp)
  }

  /**
   * 전역 터치 종료 이벤트 처리
   */
  function handleGlobalTouchEnd() {
    if (isDragging.value) {
      onModalDragEnd()
    }
  }

  /**
   * 전역 마우스 업 이벤트 처리
   */
  function handleGlobalMouseUp() {
    if (isDragging.value) {
      onModalDragEnd()
    }
  }

  // ==================== 생명주기 관리 ====================

  /**
   * 컴포넌트 마운트 시 호출
   */
  function onMounted() {
    addGlobalEventListeners()
  }

  /**
   * 컴포넌트 언마운트 시 호출
   */
  function onUnmounted() {
    removeGlobalEventListeners()
  }

  // ==================== 공개 인터페이스 ====================
  return {
    // 상태
    showPeriodModal,
    modalDragOffset,
    isDragging,

    // 드래그 이벤트
    onModalDragStart,
    onModalDragMove,
    onModalDragEnd,

    // 생명주기
    onMounted,
    onUnmounted
  }
}
