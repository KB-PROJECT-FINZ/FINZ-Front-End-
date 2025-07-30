<template>
  <div class="learning-page">
    <!-- 상단 헤더 -->
    <header class="header">
      <h1 class="app-title">개념 학습</h1>
    </header>

    <!-- 프로필 박스 -->
    <section class="profile-box">
      <div class="profile-icon"><span class="icon">👤</span></div>
      <div class="profile-info">
        <div class="profile-name">{{ user.name }}님은</div>
        <div class="profile-type">{{ user.riskType }} 사고 유형입니다</div>
      </div>
    </section>

    <!-- 추천 학습 콘텐츠 -->
    <section class="content-list">
      <h2 class="section-title">추천 학습 콘텐츠</h2>

      <!-- 로딩 중 메시지 -->
      <div
        v-if="learningContents.length === 0"
        style="text-align: center; color: #888; margin-top: 12px"
      >
        콘텐츠를 불러오는 중입니다... 잠시만 기다려주세요.
      </div>

      <div class="content-list-wrap" v-else>
        <div
          v-for="(item, idx) in learningContents"
          :key="item.contentId"
          class="content-list-card"
          :class="{ completed: item.isCompleted }"
          @click="goToDetail(item.contentId)"
        >
          <div class="content-list-info">
            <div class="content-list-title">{{ item.title }}</div>
            <div class="content-list-desc">{{ item.body ? item.body.slice(0, 40) : '' }}...</div>
          </div>
          <span class="content-list-arrow">&#8250;</span>
          <div v-if="idx < learningContents.length - 1" class="divider"></div>
        </div>
      </div>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterNavigation from '../../components/FooterNavigation.vue'
import axios from 'axios'

const router = useRouter()
const learningContents = ref([])
const user = ref({
  name: '',
  riskType: '',
  userId: 0,
  groupCode: '',
})
const recommendedCount = ref(0)

const fetchContents = async () => {
  try {
    console.log('[📡] /recommend/list + /complete/list 요청 시작')

    const [recommendRes, completeRes] = await Promise.all([
      axios.get('/api/learning/recommend/list', {
        params: {
          userId: user.value.userId,
          size: 5,
        },
        withCredentials: true,
      }),
      axios.get('/api/learning/history/complete/list', {
        params: {
          userId: user.value.userId,
        },
        withCredentials: true,
      }),
    ])

    const recommended = recommendRes.data
    const completed = completeRes.data
    recommendedCount.value = recommended.length

    console.log(`[📦] 추천 콘텐츠 ${recommended.length}개, 완료 콘텐츠 ${completed.length}개`)

    const map = new Map()
    recommended.forEach((item) => {
      map.set(Number(item.contentId), { ...item, isCompleted: false })
    })
    completed.forEach((item) => {
      map.set(Number(item.contentId), { ...item, isCompleted: true })
    })

    const merged = Array.from(map.values())
    learningContents.value = merged
  } catch (e) {
    console.error('❌ 콘텐츠 로딩 실패:', e)
  }
}

const pollUntilContentReady = async (maxRetry = 5, delay = 2000) => {
  let retry = 0
  console.log('[🔁] Polling 시작')
  while (retry < maxRetry) {
    console.log(`[⏳] 시도 ${retry + 1}/${maxRetry}...`)
    await fetchContents()
    console.log(`[📊] 현재 추천 콘텐츠 개수: ${recommendedCount.value}`)
    if (recommendedCount.value >= 5) {
      console.log('[✅] 추천 콘텐츠 5개 이상 확보됨 → polling 종료')
      break
    }
    retry++
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  if (retry >= maxRetry) {
    console.warn('[⚠️] polling 끝났지만 추천 콘텐츠가 부족함')
  }
}

// 진입 시 초기화
onMounted(async () => {
  try {
    console.log('[🚀] mounted 실행')
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const data = res.data
    user.value = {
      name: data.name,
      riskType: data.riskType,
      userId: data.userId,
      groupCode: data.groupCode,
    }
    console.log('[👤] 사용자 정보:', user.value)

    await pollUntilContentReady()
  } catch (e) {
    console.error('❌ 사용자 정보 로딩 실패:', e)
  }
})

function goToDetail(id) {
  router.push(`/learning/${id}`)
}
</script>

<style scoped>
.learning-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 18px 0 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}
.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
  letter-spacing: -1px;
}
.profile-box {
  background: linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eac9 100%);
  border-radius: 18px;
  margin: 18px 16px 18px 16px;
  padding: 22px 18px 18px 18px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
}
.profile-icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  margin-right: 16px;
}
.profile-info {
  color: #fff;
}
.profile-name {
  font-size: 1.1rem;
  font-weight: bold;
}
.profile-type {
  font-size: 1rem;
  margin: 2px 0 4px 0;
}
.profile-desc {
  font-size: 0.95rem;
  opacity: 0.9;
}
.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 10px 8px;
  color: #222;
}
.content-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 8px;
}
.content-list-card {
  background: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.1);
  padding: 24px 20px;
  cursor: pointer;
  transition: box-shadow 0.18s;
  position: relative;
  min-height: 110px;
  margin-bottom: 18px;
}
.content-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(44, 62, 80, 0.18);
}
.content-thumb {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  object-fit: cover;
  background: #eee;
  margin-right: 24px;
  box-shadow: 0 1px 8px rgba(44, 62, 80, 0.08);
}
.content-list-info {
  flex: 1;
  min-width: 0;
}
.content-list-title {
  font-size: 1.18rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
  line-height: 1.5;
  letter-spacing: 0.01em;
}
.content-list-desc {
  color: #333;
  font-size: 1.05rem;
  margin-bottom: 8px;
  line-height: 1.7;
  letter-spacing: 0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.content-list-meta {
  display: flex;
  gap: 12px;
  font-size: 0.98rem;
  color: #888;
}
.content-list-type {
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.95rem;
}
.content-list-read {
  color: #888;
}
.content-list-arrow {
  font-size: 2rem;
  color: #bdbdbd;
  margin-left: 18px;
}
.divider {
  height: 1px;
  background: #f0f1f3;
  margin: 0 8px;
}
.content-list-card.completed {
  background-color: #f2f2f2;
  opacity: 0.9;
}
@media (max-width: 600px) {
  .profile-box {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 12px;
  }
  .profile-icon {
    margin-bottom: 8px;
    margin-right: 0;
  }
  .content-list-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 8px;
    min-height: 90px;
  }
  .content-thumb {
    margin-right: 0;
    margin-bottom: 12px;
    width: 80px;
    height: 80px;
  }
}
</style>
