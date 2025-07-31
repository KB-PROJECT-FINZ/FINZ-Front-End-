<template>
  <div class="profile-page">
    <!-- 상단 헤더 -->
    <header class="profile-header">
      <div class="header-spacer"></div>
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
        <button class="asset-btn" @click="goToAssetStatus">내 자산 현황 바로가기</button>
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

    <!-- 모의투자 내역 카드 -->
    <section class="invest-history-card">
      <div class="card-header">
        <div class="card-title">모의투자 내역</div>
      </div>

      <div class="card-content">
        <!-- 매수 내역 -->
        <div class="transaction-section">
          <div class="section-title buy-title">매수 내역</div>
          <div class="stock-cards">
            <div
              v-for="(item, index) in buyHistory"
              :key="`buy-${index}`"
              class="stock-card buy-card"
            >
              <div class="stock-info">
                <div class="stock-name">{{ item.name }}</div>
                <div class="stock-desc">{{ item.desc }}</div>
              </div>
              <div class="stock-amounts">
                <div class="stock-amount">₩{{ item.amount.toLocaleString() }}</div>
                <div class="stock-change positive">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 매도 내역 -->
        <div class="transaction-section">
          <div class="section-title sell-title">매도 내역</div>
          <div class="stock-cards">
            <div
              v-for="(item, index) in sellHistory"
              :key="`sell-${index}`"
              class="stock-card sell-card"
            >
              <div class="stock-info">
                <div class="stock-name">{{ item.name }}</div>
                <div class="stock-desc">{{ item.desc }}</div>
              </div>
              <div class="stock-amounts">
                <div class="stock-amount">₩{{ item.amount.toLocaleString() }}</div>
                <div class="stock-change negative">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FooterNavigation />
  </div>
</template>

<script setup>
import FooterNavigation from '../../components/FooterNavigation.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

//const investHistory = ref([])
const buyHistory = ref([]) // 매수
const sellHistory = ref([]) // 매도
const goToAssetStatus = () => {
  router.push('/mock-trading/asset-status')
}

// 로컬 스토리지 및 API로 데이터 세팅
// 세션 기반 사용자 정보 로딩
onMounted(async () => {
  try {
    // 세션에서 사용자 정보 가져오기
    const res = await axios.get('/api/auth/me', { withCredentials: true })
    const data = res.data

    profile.value = {
      name: data.name,
      type: data.riskType,
      level: data.level || 3,
      image: data.profileImage || '',
    }

    //모의투자 내역
    try {
      console.log('🔍 모의투자 내역 조회 시작:', data.userId)
      const response = await axios.get(`/api/trading/transactions/${data.userId}`)
      console.log('📊 받은 거래 데이터:', response.data)

      if (response.data && response.data.length > 0) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        // investHistory.value = response.data.map((transaction) => ({
        //   name: transaction.stockName,
        //   desc: `${transaction.transactionType === 'BUY' ? '매수' : '매도'} ${transaction.quantity}주`,
        //   amount: transaction.totalAmount,
        //   change: 0, // 거래 내역에는 수익률 정보가 없으므로 0으로 설정
        // }))
        // console.log('✅ 변환된 투자 내역:', investHistory.value)
        const buyTransactions = response.data.filter(
          (t) => t.transactionType === 'BUY' || t.transactionType === 'HOLDING',
        )
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매수 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매도 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))

        console.log('✅ 매수 내역:', buyHistory.value)
        console.log('✅ 매도 내역:', sellHistory.value)
      } else {
        // 데이터가 없으면 빈 배열로 설정
        console.log('📝 거래 내역 없음')
        buyHistory.value = []
        sellHistory.value = []

        console.log('✅ 매수 내역:', buyHistory.value)
        console.log('✅ 매도 내역:', sellHistory.value)
      }
    } catch (e) {
      console.error('❌ 모의투자 내역 로딩 실패:', e)
      // 에러 시 빈 배열로 설정
      console.log('📝 에러로 인해 빈 배열 설정')
      buyHistory.value = []
      sellHistory.value = []
    }

    // 크레딧 조회 및 보유자산 계산
    const totalCredit = await getUserCredit(data.userId)
    asset.value.amount = totalCredit * 1000 // 1크레딧 = 1,000원
  } catch (e) {
    console.error('❌ 세션 기반 사용자 정보 로딩 실패:', e)

    // 세션 실패 시 로컬스토리지 fallback
    profile.value.name = localStorage.getItem('name') || '사용자'
    profile.value.type = localStorage.getItem('riskType') || '정보 없음'

    const userId = Number(localStorage.getItem('userId') || 1)
    try {
      console.log('🔍 fallback 모의투자 내역 조회 시작:', userId)
      const response = await axios.get(`/api/trading/transactions/${userId}`)
      console.log('📊 fallback 받은 거래 데이터:', response.data)

      if (response.data && response.data.length > 0) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const buyTransactions = response.data.filter(
          (t) => t.transactionType === 'BUY' || t.transactionType === 'HOLDING',
        )
        const sellTransactions = response.data.filter((t) => t.transactionType === 'SELL')

        buyHistory.value = buyTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매수 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
        sellHistory.value = sellTransactions.slice(0, 2).map((transaction) => ({
          name: transaction.stockName,
          desc: `매도 ${transaction.quantity}주`,
          amount: transaction.totalAmount,
          change: 0,
        }))
        console.log('✅ fallback 변환된 투자 내역:', buyHistory.value, sellHistory.value)
      } else {
        // 데이터가 없으면 빈 배열로 설정
        console.log('📝 fallback 내역 없음')
        buyHistory.value = []
        sellHistory.value = []
      }
    } catch (e) {
      console.error('❌ fallback 모의투자 내역 로딩 실패:', e)
      // 에러 시에도 빈 배열로 설정
      console.log('📝 fallback 에러로 인해 빈 배열 설정')
      buyHistory.value = []
      sellHistory.value = []
    }

    // 세션 실패 시에도 크레딧 조회 시도
    try {
      const totalCredit = await getUserCredit(userId) // fallback의 userId 사용
      asset.value.amount = totalCredit * 1000
    } catch (err) {
      console.error('❌ 크레딧 조회 에러:', err)
      asset.value.amount = 0
    }
  }
})
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
.header-spacer {
  width: 40px;
}
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
.invest-history-card {
  background: #fff;
  border-radius: 16px;
  margin: 0 16px 18px 16px;
  box-shadow: 0 2px 12px rgba(127, 127, 213, 0.08);
  overflow: hidden;
}

.card-header {
  background: #f8fafc;
  padding: 16px 18px;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #222;
}

.card-content {
  padding: 18px;
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
.empty-history {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.empty-message {
  font-size: 1rem;
  font-weight: bold;
  color: #666;
  margin-bottom: 4px;
}
.empty-desc {
  font-size: 0.9rem;
  color: #888;
}
.stock-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stock-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stock-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.stock-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.stock-name {
  font-size: 0.95rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 2px;
}
.stock-desc {
  color: #666;
  font-size: 0.85rem;
}
.stock-amounts {
  text-align: right;
}
.stock-amount {
  font-size: 0.95rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 2px;
}
.stock-change {
  font-size: 0.85rem;
  font-weight: bold;
}
.stock-change.positive {
  color: #22b573;
}
.stock-change.negative {
  color: #e74c3c;
}

.transaction-section {
  margin-bottom: 16px;
}

.transaction-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.95rem;
  font-weight: bold;
  margin-bottom: 6px;
  padding-left: 4px;
}

.buy-title {
  color: #dc2626;
}

.sell-title {
  color: #2563eb;
}

.buy-card {
  border-left: 4px solid #dc2626;
}

.sell-card {
  border-left: 4px solid #2563eb;
}

.buy-card .stock-change {
  color: #dc2626;
}

.sell-card .stock-change {
  color: #2563eb;
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
