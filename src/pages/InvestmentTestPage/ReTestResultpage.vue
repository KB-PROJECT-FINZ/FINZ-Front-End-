<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const typeCode = route.query.type || 'UNKNOWN'

// username을 ref로 정의
const name = ref('')
const username = ref('')

// 로그인된 사용자 정보 받아오기
const fetchUsername = async () => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    username.value = res.data.username // ✅ 올바르게 할당
    name.value = res.data.name // 사용자 이름도 받아오기
    console.log('✅ username:', username.value)
    console.log('✅ typeCode:', typeCode)
    console.log('✅ name:', res.data.name)
    saveRiskType() // ✅ 이 시점에서 정확한 값으로 호출
  } catch (err) {
    console.error('❌ 사용자 정보 조회 실패:', err)
  }
}

// 투자 성향 저장
const saveRiskType = async () => {
  if (!username.value || typeCode === 'UNKNOWN') {
    console.warn('❗ username 또는 typeCode 없음, 저장 스킵')
    return
  }

  try {
    await axios.post(
      '/api/user/risk_type',
      {
        username: username.value,
        riskType: typeCode,
      },
      {
        withCredentials: true,
      },
    )
    console.log('✅ 투자 성향 저장 완료')
  } catch (err) {
    console.error('❌ 저장 실패:', err)
  }
}

onMounted(() => {
  fetchUsername()
})
const resultMap = {
  CSD: {
    title: '신중한 안정형(CSD)',
    description: '장기 보유, 위험 회피, ETF 선호하는 투자자입니다.',
    stability: 9,
    aggressiveness: 1,
    tip: '채권형 펀드, 정기예금 등 안정적인 자산부터 시작해보세요.',
  },
  CAG: {
    title: '신중한 성장형(CAG)',
    description: '분산 투자, 대형 우량주 중심의 전략을 선호합니다.',
    stability: 8,
    aggressiveness: 2,
    tip: 'ETF와 우량주 중심으로 포트폴리오를 구성해보세요.',
  },
  BSS: {
    title: '균형 잡힌 수익 추구형(BSS)',
    description: '위험과 수익의 균형을 중시하며 산업 분산에 강점을 보입니다.',
    stability: 7,
    aggressiveness: 4,
    tip: '산업 다양성과 중위험 ETF 조합을 고려해보세요.',
  },
  BGT: {
    title: '균형 잡힌 도전형(BGT)',
    description: '우량주 + 중소형 혼합 전략을 구사하는 적극적인 균형형입니다.',
    stability: 6,
    aggressiveness: 5,
    tip: '성장주와 안정주를 조화롭게 구성해보세요.',
  },
  AID: {
    title: '적극적 안정형(AID)',
    description: '종목 교체는 자주 하지만 기본적으로 안정적인 자산을 선호합니다.',
    stability: 5,
    aggressiveness: 6,
    tip: '중장기 투자와 단기 트레이딩을 병행하는 전략이 유효합니다.',
  },
  AGR: {
    title: '적극적 성장형(AGR)',
    description: '단기 수익 추구, 핫한 테마를 적극적으로 탐색합니다.',
    stability: 3,
    aggressiveness: 8,
    tip: '변동성 있는 테마 투자는 철저한 리스크 관리가 필요합니다.',
  },
  EXP: {
    title: '실험적 모험가형(EXP)',
    description: '신사업, 코인, 바이오, AI 등에 관심이 많은 실험형 투자자입니다.',
    stability: 2,
    aggressiveness: 9,
    tip: '다양한 분야에 투자하며 학습과 탐색을 함께 해보세요.',
  },
  FAD: {
    title: '감정적 결정형(FAD)',
    description: '뉴스/유튜브 등의 정보에 민감하게 반응하고 감정에 따라 매매하는 경향이 있습니다.',
    stability: 1,
    aggressiveness: 9,
    tip: '충동적 매매보다 계획 기반 접근을 시도해보세요.',
  },
  SYS: {
    title: '시스템 트레이더형(SYS)',
    description: '백테스트, 알고리즘 기반의 트레이딩을 선호하는 데이터 중심형입니다.',
    stability: 6,
    aggressiveness: 7,
    tip: '알고리즘 전략을 통해 감정 배제를 시도해보세요.',
  },
  DTA: {
    title: '단타 추구형(DTA)',
    description: '급등주 중심의 단기 수익 노림수가 많은 단타 스타일입니다.',
    stability: 2,
    aggressiveness: 10,
    tip: '정보의 신속한 해석과 타이밍이 핵심입니다. 자금 분산과 손절 기준을 정하세요.',
  },
  TEC: {
    title: '기술적 분석형(TEC)',
    description: '차트 기반 매매, RSI, MACD 등의 기술지표를 중시하는 분석형 투자자입니다.',
    stability: 4,
    aggressiveness: 7,
    tip: '기술지표를 맹신하지 말고, 분산된 신호와 함께 판단하세요.',
  },
}

const result = resultMap[typeCode] || resultMap.UNKNOWN
</script>

<template>
  <div class="max-w-md mx-auto bg-white px-6 py-8 shadow-xl rounded-2xl text-center">
    <div class="text-left text-xl font-bold text-[#333] mb-4">
      <img src="@/assets/finz.png" alt="finz" class="w-16 mb-2" />
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-1">테스트 완료!</h2>
    <p class="text-gray-600 mb-6">당신의 투자 성향을 분석했어요</p>

    <div class="bg-green-50 rounded-xl py-5 px-4 mb-6 border border-green-200">
      <h3 class="text-lg font-semibold text-green-800 mb-1">{{ result.title }}</h3>
      <p class="text-sm text-gray-700 mb-4">{{ result.description }}</p>
      <div class="flex justify-center gap-6 text-sm text-gray-600">
        <div>
          안정성 <span class="font-bold text-black">{{ result.stability }}</span>
        </div>
        <div>
          적극성 <span class="font-bold text-black">{{ result.aggressiveness }}</span>
        </div>
      </div>
    </div>

    <button
      class="bg-green-500 text-white py-2 px-4 rounded-full w-full font-semibold mb-3 hover:bg-green-600"
      @click="() => $router.push('/home')"
    >
      확인
    </button>
    <button
      class="bg-gray-100 text-gray-600 py-2 px-4 rounded-full w-full font-semibold mb-6 hover:bg-gray-300"
      @click="() => $router.push('/investment-test/retest')"
    >
      테스트 다시하기
    </button>

    <div
      class="bg-yellow-50 text-left p-4 rounded-lg border border-yellow-200 text-sm text-gray-800"
    >
      <p class="font-semibold mb-1">💡 투자 팁</p>
      <p>{{ result.tip }}</p>
    </div>
  </div>
</template>

<style scoped>
/* 이미지 경로에 맞게 /public 폴더에 celebrate.png 같은 축하 아이콘이 있어야 합니다 */
</style>
