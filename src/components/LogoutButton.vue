<template>
  <button @click="logout" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
    로그아웃
  </button>
</template>

<script setup>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // Pinia 기준

const router = useRouter()
const userStore = useUserStore()

const logout = async () => {
  try {
    await axios.get('/api/auth/logout')
    userStore.clearUser() // 프론트 상태 삭제
    alert('로그아웃 되었습니다.')
    router.push('/')
  } catch (e) {
    alert('로그아웃 실패: ' + (e.response?.data || e.message))
  }
}
</script>
