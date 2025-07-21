<template>
  <Header />
  <div class="home-page">
    <!-- 헤더 -->
    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 잔액 카드 -->
      <div class="balance-card">
        <div class="balance-label">총 자산</div>
        <div class="balance-amount">₩12,345,678</div>
        <div class="balance-change positive">+2.34% (↗ ₩289,123)</div>
      </div>

      <!-- 빠른 액션 버튼들 -->
      <div class="quick-actions">
        <button class="action-btn">
          <span class="action-icon">💰</span>
          <span class="action-text">입금</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📊</span>
          <span class="action-text">거래</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📈</span>
          <span class="action-text">포트폴리오</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📰</span>
          <span class="action-text">뉴스</span>
        </button>
      </div>

      <!-- 인기 종목 -->
      <section class="popular-stocks">
        <h2 class="section-title">인기 종목</h2>
        <div class="stock-list">
          <div class="stock-item">
            <div class="stock-info">
              <div class="stock-name">삼성전자</div>
              <div class="stock-code">005930</div>
            </div>
            <div class="stock-price">
              <div class="price">71,000원</div>
              <div class="change positive">+1.43%</div>
            </div>
          </div>
          <div class="stock-item">
            <div class="stock-info">
              <div class="stock-name">SK하이닉스</div>
              <div class="stock-code">000660</div>
            </div>
            <div class="stock-price">
              <div class="price">89,500원</div>
              <div class="change negative">-0.56%</div>
            </div>
          </div>
          <div class="stock-item">
            <div class="stock-info">
              <div class="stock-name">NAVER</div>
              <div class="stock-code">035420</div>
            </div>
            <div class="stock-price">
              <div class="price">186,000원</div>
              <div class="change positive">+2.15%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 최근 거래 -->
      <section class="recent-trades">
        <h2 class="section-title">최근 거래</h2>
        <div class="trade-list">
          <div class="trade-item">
            <div class="trade-info">
              <div class="trade-type buy">매수</div>
              <div class="trade-stock">카카오</div>
            </div>
            <div class="trade-details">
              <div class="trade-quantity">10주</div>
              <div class="trade-time">2시간 전</div>
            </div>
          </div>
          <div class="trade-item">
            <div class="trade-info">
              <div class="trade-type sell">매도</div>
              <div class="trade-stock">LG화학</div>
            </div>
            <div class="trade-details">
              <div class="trade-quantity">5주</div>
              <div class="trade-time">1일 전</div>
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
import Header from '@/components/Header.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
// 여기에 나중에 로직 추가 가능
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  padding: 20px 16px 100px;
}

/* 잔액 카드 */
.balance-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.balance-label {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.balance-change {
  font-size: 14px;
  font-weight: 500;
}

.balance-change.positive {
  color: #e74c3c;
}

.balance-change.negative {
  color: #3498db;
}

/* 빠른 액션 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 20px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

/* 섹션 */
.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 16px;
}

.popular-stocks {
  margin-bottom: 32px;
}

.stock-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stock-code {
  font-size: 12px;
  color: #6c757d;
}

.stock-price {
  text-align: right;
}

.price {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.change {
  font-size: 12px;
  font-weight: 500;
}

.change.positive {
  color: #e74c3c;
}

.change.negative {
  color: #3498db;
}

/* 최근 거래 */
.trade-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.trade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
}

.trade-item:last-child {
  border-bottom: none;
}

.trade-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.trade-type.buy {
  background: #fee;
  color: #e74c3c;
}

.trade-type.sell {
  background: #eef;
  color: #3498db;
}

.trade-stock {
  font-weight: 500;
  color: #2c3e50;
}

.trade-details {
  text-align: right;
}

.trade-quantity {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.trade-time {
  font-size: 12px;
  color: #6c757d;
}

/* 큰 모바일 기기 대응 (390px ~ 430px) */
@media (min-width: 391px) and (max-width: 430px) {
  .main-content {
    padding: 20px 20px 100px;
  }

  .quick-actions {
    gap: 20px;
  }

  .action-btn {
    padding: 24px 16px;
  }

  .stock-item,
  .trade-item {
    padding: 18px;
  }

  .balance-card {
    padding: 28px;
  }
}

/* 더 큰 화면에서의 최적화 */
@media (min-width: 431px) {
  .main-content {
    padding: 24px 24px 100px;
  }

  .quick-actions {
    gap: 24px;
    max-width: 400px;
    margin: 0 auto 32px;
  }

  .balance-card {
    max-width: 400px;
    margin: 0 auto 24px;
  }

  .popular-stocks,
  .recent-trades {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .recent-trades {
    margin-bottom: 32px;
  }
}
</style>
