import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/LoginPages/SignupFormPage.vue'
import ChatBotPage from '@/pages/ChatBotPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import HomePage from '@/pages/HomePage.vue'
import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'
import InvestmentResult from '@/pages/InvestmentTestPage/InvestmentResult.vue'
import TradingPage from '@/pages/TradingPage.vue'
import ChartPage from '@/pages/ChartPage.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/login-form',
    name: 'LoginFormPage',
    component: LoginFormPage,
  },
  {
    path: '/signup',
    name: 'SignupFormPage',
    component: SignupFormPage,
  },
  {
    path: '/find-account',
    name: 'FindAccountPage',
    component: FindAccountPage,
  },
  {
    path: '/chatbot',
    name: 'ChatBot',
    component: ChatBotPage,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/investment-test',
    name: 'InvestmentTestPage',
    component: InvestmentTestPage,
  },
  {
    path: '/investment-result',
    name: 'InvestmentResult',
    component: InvestmentResult,
  },
  {
    path: '/trading',
    name: 'trading',
    component: TradingPage,
  },
  {
    path: '/chart',
    name: 'chart',
    component: ChartPage,
  },
  // 나중에 /home, /mypage 등 추가 가능
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요합니다.')
    next('/login')
  } else {
    next()
  }
})

export default router
