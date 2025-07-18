import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginFormPage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/login-form',
    name: 'LoginFormPage',
    component: LoginFormPage,
  },
  // 나중에 /home, /mypage 등 추가 가능
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
