<template>
  <button
    @click="loginWithKakao"
    class="w-10 h-10 rounded-full border bg-white shadow-sm flex items-center justify-center hover:scale-105 transition"
  >
    <img
      src="https://cdn-icons-png.flaticon.com/512/2111/2111683.png"
      alt="카카오 로그인"
      class="w-5 h-5"
    />
  </button>
</template>

<script setup>
const loginWithKakao = () => {
  if (!window.Kakao) {
    alert('Kakao SDK가 로드되지 않았습니다.')
    return
  }

  window.Kakao.Auth.authorize({
    redirectUri: 'http://localhost:8080/api/auth/kakao/callback',
  })
}
</script>
