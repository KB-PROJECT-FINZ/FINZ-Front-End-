<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white p-6">
    <!-- 상단 그래프 라인 -->

    <!-- 로고 및 설명 -->
    <h1 class="text-5xl font-bold text-black mb-2">finz</h1>
    <p class="text-center text-gray-600 text-sm leading-tight">
      투자 입문자를 위한 맞춤형 금융 플랫폼<br />
      <span class="text-xs text-gray-500">당신만의 투자 여정을 시작하세요</span>
    </p>
    <p class="text-red-500 font-bold text-2xl">Tailwind 작동 테스트</p>

    <!-- 로그인 / 회원가입 버튼 -->
    <div class="w-full max-w-xs mt-8 space-y-4">
      <p class="text-red-500 font-bold text-2xl">Tailwind 작동 테스트</p>
      <button
        class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-md hover:shadow-lg transition"
      >
        로그인
      </button>
      <button
        class="w-full py-3 rounded-xl border border-gray-200 text-purple-600 bg-white shadow-sm hover:shadow-md"
      >
        회원가입...
      </button>
    </div>

    <!-- 소셜 로그인 아이콘 -->
    <div class="flex justify-center gap-6 mt-8">
      <img
        src="https://images.icon-icons.com/652/PNG/512/naver_icon-icons.com_59879.png"
        alt="naver"
        class="w-8 h-8"
      />
      <img
        src="https://cdn-icons-png.flaticon.com/512/2111/2111683.png"
        alt="kakao"
        class="w-8 h-8"
      />
      <img src="https://img.icons8.com/win10/512/google-logo.png" alt="google" class="w-8 h-8" />
    </div>
    <p class="text-red-500 font-bold text-2xl">Tailwind 작동 테스트</p>
  </div>
</template>

<script setup>
// LoginView 컴포넌트 (Composition API 방식)
</script>

<style scoped>
/* 필요 시 추가 스타일 작성 */
</style>
