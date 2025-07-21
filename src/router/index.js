import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginFormPage.vue'
import SignupFormPage from '@/pages/SignupFormPage.vue'
import FindAccountPage from '@/pages/FindAccountPage.vue'
import ChatBotPage from '@/pages/ChatBotPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import HomePage from '@/pages/HomePage.vue'
import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'

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

    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/investment-test',
    name: 'InvestmentTestPage',
    component: InvestmentTestPage,
  },
  // 나중에 /home, /mypage 등 추가 가능
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
