<template>
  <Header />
  <div class="profile-page">
    <router-link to="/journal" class="action-btn">
      <span class="action-icon">📊</span>
      <div class="action-texts">
        <span class="action-title">투자 일지</span>
        <span class="action-desc">나의 투자기록을 확인해보세요.</span>
      </div>
    </router-link>
  </div>
  <BottomNavigation />
</template>

<script setup>
import Header from '@/components/Header.vue'
import BottomNavigation from '@/components/FooterNavigation.vue'
</script>

<style scoped>
.profile-page {
  padding: 16px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 28px;
}

.action-texts {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.action-desc {
  font-size: 13px;
  color: #495057;
}
</style>
