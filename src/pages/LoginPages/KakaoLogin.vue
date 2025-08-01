<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <img
      v-if="!user.email"
      src="//k.kakaocdn.net/14/dn/btqCn0WEmI3/nijroPfbpCa4at5EIsjyf0/o.jpg"
      width="222"
      @click="kakaoLogin"
    />
    <div v-else class="text-center">
      <p>nickname: {{ user.name }}</p>
      <p>email: {{ user.email }}</p>
      <button @click="kakaoLogout">카카오 로그아웃</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const user = ref({})
const router = useRouter()

const getKakaoToken = async (code) => {
  const data = {
    grant_type: 'authorization_code',
    client_id: '48a1299be0b7365dd5d0aadf97d93dd8',
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

const getKakaoUserInfo = async () => {
  const res = await window.Kakao.API.request({ url: '/v2/user/me' })
  return {
    name: res.kakao_account.profile.nickname,
    email: res.kakao_account.email,
  }
}

const setKakaoToken = async (code) => {
  const data = await getKakaoToken(code)
  window.Kakao.Auth.setAccessToken(data.access_token)
  const info = await getKakaoUserInfo()
  user.value = info

  // 백엔드 회원가입 요청 (선택 사항)
  await axios.post('/api/auth/kakao-login', info)
  router.push('/')
}

onMounted(() => {
  const code = new URLSearchParams(window.location.search).get('code')
  if (code) setKakaoToken(code)
})

const kakaoLogin = () => {
  window.Kakao.Auth.authorize({ redirectUri: 'http://localhost:5173/kakaologin' })
}

const kakaoLogout = () => {
  window.Kakao.Auth.logout()
  user.value = {}
}
</script>
