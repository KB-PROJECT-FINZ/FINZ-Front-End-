<template>
  <header class="header">
    <div class="header-content">
      <h1 class="app-title">FINZ</h1>
      <div class="header-icons">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">👤</button>
      </div>
    </div>
  </header>
</template>

<script setup>
// 자바스크립트 로직 여기에
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 16px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.header-icons {
  display: flex;
  gap: 12px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
