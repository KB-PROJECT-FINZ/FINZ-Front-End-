import { ref, nextTick } from 'vue'

export function useChartManager() {
  // ===== 차트 관련 상태 =====
  const portfolioChart = ref(null)
  const chartTooltip = ref({
    show: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
    percent: '',
    color: '',
  })

  let chartSegments = []
  let eventsSetup = false

  const chartColors = [
    '#4285F4',
    '#34A853',
    '#FBBC04',
    '#EA4335',
    '#9AA0A6',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
  ]

  // ===== 이벤트 핸들러 =====
  const handleChartMouseMove = (e) => {
    if (!portfolioChart.value) {
      return
    }

    if (chartSegments.length === 0) {
      return
    }

    const rect = portfolioChart.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = portfolioChart.value.width / 2
    const centerY = portfolioChart.value.height / 2
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = Math.min(centerX, centerY) - 10
    const holeRadius = radius * 0.6

    // 도넛 구멍이나 바깥 영역이면 툴팁 숨기기
    if (distance < holeRadius || distance > radius) {
      chartTooltip.value.show = false
      return
    }

    // 각도 계산 및 정규화
    let angle = Math.atan2(dy, dx)
    angle = angle + Math.PI / 2
    if (angle < 0) {
      angle += 2 * Math.PI
    }
    if (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI
    }

    // 각 영역 확인
    for (let i = 0; i < chartSegments.length; i++) {
      const seg = chartSegments[i]
      let segStart = seg.start
      let segEnd = seg.end

      // 세그먼트가 0도를 지나는 경우 처리
      if (segEnd < segStart) {
        if (angle >= segStart || angle < segEnd) {
          chartTooltip.value = {
            show: true,
            x: x + rect.left,
            y: y + rect.top,
            label: seg.label,
            value: seg.value.toLocaleString(),
            percent: seg.percent,
            color: seg.color,
          }
          return
        }
      } else {
        // 일반적인 경우
        if (angle >= segStart && angle < segEnd) {
          chartTooltip.value = {
            show: true,
            x: x + rect.left,
            y: y + rect.top,
            label: seg.label,
            value: seg.value.toLocaleString(),
            percent: seg.percent,
            color: seg.color,
          }
          return
        }
      }
    }

    chartTooltip.value.show = false
  }

  const handleChartMouseLeave = () => {
    chartTooltip.value.show = false
  }

  // ===== 이벤트 리스너 관리 =====
  const setupCanvasEvents = () => {
    if (!portfolioChart.value || eventsSetup) {
      return
    }

    portfolioChart.value.addEventListener('mousemove', handleChartMouseMove)
    portfolioChart.value.addEventListener('mouseleave', handleChartMouseLeave)

    eventsSetup = true
    console.log('Canvas 이벤트 리스너 등록 완료')
  }

  const cleanupChartEvents = () => {
    if (portfolioChart.value && eventsSetup) {
      portfolioChart.value.removeEventListener('mousemove', handleChartMouseMove)
      portfolioChart.value.removeEventListener('mouseleave', handleChartMouseLeave)
      eventsSetup = false
      console.log('Canvas 이벤트 리스너 정리 완료')
    }
  }

  // ===== 차트 업데이트 함수 =====
  const updatePortfolioChart = async (portfolioPercentages, currentBalance = 0) => {
    await nextTick() // DOM 업데이트 대기

    if (!portfolioChart.value) {
      console.log('❌ 차트 캔버스가 없음')
      return
    }

    // portfolioPercentages가 undefined이면 기본값 사용
    if (!portfolioPercentages) {
      portfolioPercentages = {
        holdings: [],
        cash: 100,
      }
    }

    // Canvas 크기 설정
    portfolioChart.value.width = 320
    portfolioChart.value.height = 180

    const ctx = portfolioChart.value.getContext('2d')
    const centerX = portfolioChart.value.width / 2
    const centerY = portfolioChart.value.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const holeRadius = radius * 0.6

    // 캔버스 초기화
    ctx.clearRect(0, 0, portfolioChart.value.width, portfolioChart.value.height)

    const { holdings = [], cash = 100 } = portfolioPercentages
    chartSegments = []

    // 현금만 있는 경우
    if (holdings.length === 0 && cash === 100) {
      drawCashOnlyChart(ctx, centerX, centerY, radius, holeRadius, cash, currentBalance)
    } else {
      drawPortfolioChart(ctx, centerX, centerY, radius, holeRadius, holdings, cash, currentBalance)
    }

    // 도넛 구멍 그리기
    ctx.beginPath()
    ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()

    // 이벤트 리스너 설정
    setupCanvasEvents()
  }

  const drawCashOnlyChart = (ctx, centerX, centerY, radius, holeRadius, cash, currentBalance) => {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#E5E7EB'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 현금 100% 영역 정보 저장
    chartSegments.push({
      start: 0,
      end: 2 * Math.PI,
      label: '현금',
      value: currentBalance || 0,
      percent: 100,
      color: '#E5E7EB',
    })
  }

  const drawPortfolioChart = (
    ctx,
    centerX,
    centerY,
    radius,
    holeRadius,
    holdings,
    cash,
    currentBalance,
  ) => {
    let currentAngle = -Math.PI / 2

    // 보유 종목들 그리기
    holdings.forEach((holding, index) => {
      if (holding.percentage > 0) {
        const sliceAngle = (holding.percentage / 100) * 2 * Math.PI

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = chartColors[index % chartColors.length]
        ctx.fill()

        // 경계선 추가
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // 각 영역 정보 저장 (정규화된 각도로 저장)
        let normalizedStart = currentAngle + Math.PI / 2
        let normalizedEnd = currentAngle + sliceAngle + Math.PI / 2

        // 0 ~ 2π 범위로 정규화
        if (normalizedStart < 0) normalizedStart += 2 * Math.PI
        if (normalizedEnd < 0) normalizedEnd += 2 * Math.PI
        if (normalizedStart >= 2 * Math.PI) normalizedStart -= 2 * Math.PI
        if (normalizedEnd >= 2 * Math.PI) normalizedEnd -= 2 * Math.PI

        chartSegments.push({
          start: normalizedStart,
          end: normalizedEnd,
          label: holding.stockName,
          value: holding.currentValue || 0,
          percent: holding.percentage,
          color: chartColors[index % chartColors.length],
        })

        currentAngle += sliceAngle
      }
    })

    // 현금 비율 그리기
    if (cash > 0) {
      const cashAngle = (cash / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + cashAngle)
      ctx.closePath()
      ctx.fillStyle = '#E5E7EB'
      ctx.fill()

      // 경계선 추가
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // 현금 영역 정보 저장
      let normalizedStart = currentAngle + Math.PI / 2
      let normalizedEnd = currentAngle + cashAngle + Math.PI / 2

      // 0 ~ 2π 범위로 정규화
      if (normalizedStart < 0) normalizedStart += 2 * Math.PI
      if (normalizedEnd < 0) normalizedEnd += 2 * Math.PI
      if (normalizedStart >= 2 * Math.PI) normalizedStart -= 2 * Math.PI
      if (normalizedEnd >= 2 * Math.PI) normalizedEnd -= 2 * Math.PI

      chartSegments.push({
        start: normalizedStart,
        end: normalizedEnd,
        label: '현금',
        value: currentBalance || 0,
        percent: cash,
        color: '#E5E7EB',
      })
    }
  }

  return {
    // 상태
    portfolioChart,
    chartTooltip,
    chartColors,

    // 메서드
    updatePortfolioChart,
    cleanupChartEvents,
  }
}
