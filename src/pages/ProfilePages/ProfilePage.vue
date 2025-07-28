<template>
  <div class="profile-page">
    <!-- 상단 헤더 -->
    <header class="profile-header">
      <button class="back-btn" @click="goBack">&#8592;</button>
      <span class="profile-title">마이페이지</span>
      <button class="settings-btn"><span class="icon">⚙️</span></button>
    </header>

    <!-- 프로필 박스 -->
    <section class="profile-box">
      <img v-if="profile.image" class="profile-img" :src="profile.image" alt="프로필" />
      <div v-else class="profile-img default">
        <span class="icon">👤</span>
      </div>
      <div class="profile-info">
        <div class="profile-name">{{ profile.name }}</div>
        <div class="profile-type">{{ profile.type }}</div>
        <span class="profile-level">Level {{ profile.level }}</span>
      </div>
    </section>

    <!-- 자산 카드 -->
    <section class="asset-card">
      <div class="asset-label">총 보유자산</div>
      <div class="asset-main">
        <span class="asset-amount">₩{{ asset.amount.toLocaleString() }}</span>
        <button class="asset-btn">내 자산 현황 바로가기</button>
      </div>
      <div class="asset-change" :class="{ positive: asset.change > 0, negative: asset.change < 0 }">
        {{ asset.change > 0 ? '+' : '' }}{{ asset.change }}% (이번 달)
      </div>
    </section>

    <!-- 메뉴 카드 -->
    <section class="menu-cards">
      <router-link to="/journal" class="menu-card">
        <span class="menu-icon">📒</span>
        <div class="menu-info">
          <div class="menu-title">투자 일지</div>
          <div class="menu-desc">나의 투자 기록을 확인해보세요</div>
        </div>
        <span class="menu-arrow">&#8250;</span>
      </router-link>
      <router-link to="/investment-test/retest" class="menu-card">
        <span class="menu-icon">📝</span>
        <div class="menu-info">
          <div class="menu-title">나의 투자 성향 알아보기</div>
          <div class="menu-desc">투자 성향을 분석해보세요</div>
        </div>
        <span class="menu-arrow">&#8250;</span>
      </router-link>
    </section>

    <!-- 투자 내역 -->
    <section class="invest-history">
      <div class="history-title">모의투자 내역</div>
      <div v-for="item in investHistory" :key="item.name" class="history-row">
        <div class="history-info">
          <div class="history-name">{{ item.name }}</div>
          <div class="history-desc">{{ item.desc }}</div>
        </div>
        <div class="history-amounts">
          <div class="history-amount">₩{{ item.amount.toLocaleString() }}</div>
          <div
            class="history-change"
            :class="{ positive: item.change > 0, negative: item.change < 0 }"
          >
            {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
          </div>
        </div>
      </div>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import FooterNavigation from '../../components/FooterNavigation.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getUserCredit } from '../../services/learning'

const router = useRouter()

const profile = ref({
  image: '',
  name: '',
  type: '',
  level: 3,
})

const asset = ref({
  amount: 0,
  change: 2.3,
})

// 로컬 스토리지 및 API로 데이터 세팅
onMounted(async () => {
  profile.value.name = localStorage.getItem('name') || '사용자'
  const username = localStorage.getItem('username')
  const userId = Number(localStorage.getItem('userId') || 1)

  try {
    const response = await axios.get('/user/risk-type-name', {
      params: { username },
    })

    if (response.headers['content-type'].includes('text/html')) {
      console.error('❌ HTML 응답: 투자 성향 조회 실패')
      profile.value.type = '조회 실패'
    } else {
      profile.value.type = response.data || '정보 없음'
    }
  } catch (err) {
    console.error('❌ 투자 성향 조회 에러:', err)
    profile.value.type = '조회 실패'
  }

  // 크레딧 조회 및 보유자산 계산
  try {
    const totalCredit = await getUserCredit(userId)
    asset.value.amount = totalCredit * 1000 // 1크레딧 = 1,000원
  } catch (err) {
    console.error('❌ 크레딧 조회 에러:', err)
    asset.value.amount = 0
  }
})

const investHistory = [
  { name: '삼성전자', desc: '100주 매수', amount: 75000, change: 2.5 },
  { name: 'SK 하이닉스', desc: '50주 보유', amount: 128500, change: -1.2 },
  { name: 'NAVER', desc: '25주 보유', amount: 195000, change: 3.8 },
]

function goBack() {
  router.back()
}
</script>

<style scoped>
.profile-page {
  background: #f7f8fa;
  min-height: 0;
  height: 100vh;
  padding-bottom: 60px;
}
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 18px 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn,
.settings-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
}
.profile-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #222;
}
.profile-box {
  background: #f3f6fb;
  border-radius: 18px;
  margin: 18px 16px 18px 16px;
  padding: 22px 18px 18px 18px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
}
.profile-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 18px;
}
.profile-img.default {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1rem;
  color: #bdbdbd;
  margin-right: 18px;
}
.profile-info {
  color: #222;
}
.profile-name {
  font-size: 1.1rem;
  font-weight: bold;
}
.profile-type {
  font-size: 1rem;
  margin: 2px 0 4px 0;
  color: #666;
}
.profile-level {
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.92rem;
  margin-top: 2px;
  display: inline-block;
}
.asset-card {
  background: #fff;
  border-radius: 16px;
  margin: 0 16px 18px 16px;
  padding: 18px 18px 14px 18px;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
}
.asset-label {
  color: #888;
  font-size: 0.98rem;
  margin-bottom: 4px;
}
.asset-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.asset-amount {
  font-size: 1.6rem;
  font-weight: bold;
  color: #222;
}
.asset-credit {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
  font-weight: 500;
}
.asset-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s;
}
.asset-btn:hover {
  background: #1741a6;
}
.asset-change {
  font-size: 0.98rem;
  font-weight: bold;
  margin-left: 2px;
}
.asset-change.positive {
  color: #22b573;
}
.asset-change.negative {
  color: #e74c3c;
}
.menu-cards {
  margin: 0 16px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.menu-card {
  background: #fff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.07);
  padding: 16px 14px;
  cursor: pointer;
  transition: box-shadow 0.18s;
  position: relative;
  text-decoration: none;
  color: inherit;
}
.menu-card:hover {
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.13);
}
.menu-icon {
  font-size: 1.5rem;
  margin-right: 14px;
}
.menu-info {
  flex: 1;
  min-width: 0;
}
.menu-title {
  font-size: 1.08rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 2px;
}
.menu-desc {
  color: #666;
  font-size: 0.97rem;
}
.menu-arrow {
  font-size: 1.5rem;
  color: #bdbdbd;
  margin-left: 8px;
}
.invest-history {
  margin: 0 16px 18px 16px;
}
.history-title {
  font-size: 1.08rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 10px;
}
.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f1f3;
}
.history-info {
  display: flex;
  flex-direction: column;
}
.history-name {
  font-size: 1rem;
  font-weight: bold;
  color: #222;
}
.history-desc {
  color: #888;
  font-size: 0.95rem;
}
.history-amounts {
  text-align: right;
}
.history-amount {
  font-size: 1rem;
  font-weight: bold;
  color: #222;
}
.history-change {
  font-size: 0.98rem;
  font-weight: bold;
}
.history-change.positive {
  color: #22b573;
}
.history-change.negative {
  color: #e74c3c;
}
@media (max-width: 600px) {
  .profile-header,
  .profile-box,
  .asset-card,
  .menu-cards,
  .invest-history {
    margin-left: 4px;
    margin-right: 4px;
  }
  .profile-box {
    padding: 16px 8px;
  }
  .asset-card {
    padding: 14px 8px 10px 8px;
  }
  .menu-card {
    padding: 12px 8px;
  }
}
</style>
