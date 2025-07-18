<template>
  <div id="app">
    <div class="mobile-container">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5; /* 외부 배경색 */
  padding: 0;
  margin: 0;
}

.mobile-container {
  max-width: 430px;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* Mobile */
  overflow: auto;
  position: relative;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

/* 모바일 환경에서는 전체 화면 사용 */
@media (max-width: 430px) {
  #app {
    background-color: white;
  }

  .mobile-container {
    width: 100vw;
    box-shadow: none;
  }
}
</style>
