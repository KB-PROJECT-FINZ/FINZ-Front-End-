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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const user = ref({})
const router = useRouter()

// 🔐 1. 인가 코드 요청
const loginWithKakao = () => {
  if (!window.Kakao) {
    alert('Kakao SDK가 로드되지 않았습니다.')
    return
  }

  window.Kakao.Auth.authorize({
    redirectUri: 'http://localhost:5173/kakaologin', // 이 주소로 등록했는지 확인
  })
}

// 🔑 2. 인가 코드로 토큰 요청
const getKakaoToken = async (code) => {
  const data = {
    grant_type: 'authorization_code',
    client_id: '48a1299be0b7365dd5d0aadf97d93dd8', // REST API 키
    redirect_uri: 'http://localhost:5173/kakaologin',
    code,
  }

  const queryString = Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const result = await axios.post('https://kauth.kakao.com/oauth/token', queryString, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })

  return result.data
}

// 👤 3. 사용자 정보 요청
const getKakaoUserInfo = async () => {
  const res = await window.Kakao.API.request({ url: '/v2/user/me' })
  return {
    name: res.kakao_account.profile.nickname,
    email: res.kakao_account.email,
  }
}

// 🔁 4. 전체 프로세스 실행
const setKakaoToken = async (code) => {
  const tokenData = await getKakaoToken(code) // ✅ 여기서 사용됨
  window.Kakao.Auth.setAccessToken(tokenData.access_token)

  const userInfo = await getKakaoUserInfo()
  user.value = userInfo

  // 서버에 사용자 정보 전송 (선택)
  await axios.post('/api/auth/kakao-login', userInfo)

  router.push('/')
}

// 🚀 5. 인가 코드 자동 처리
onMounted(() => {
  const code = new URLSearchParams(window.location.search).get('code')
  if (code) setKakaoToken(code)
})
</script>
