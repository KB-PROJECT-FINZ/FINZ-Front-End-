import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginPages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/LoginPages/SignupFormPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import HomePage from '@/pages/HomePage.vue'
import RankingPage from '@/pages/RankingPages/RankingPage.vue'
import StockAnalysisPage from '@/pages/RankingPages/StockAnalysisPage.vue'

const routes = [
  // {
  //   path: '/',
  //   name: 'Login',
  //   component: LoginView,
  // },
  // {
  //   path: '/login-form',
  //   name: 'LoginFormPage',
  //   component: LoginFormPage,
  // },
  // {
  //   path: '/signup',
  //   name: 'SignupFormPage',
  //   component: SignupFormPage,
  // },
  {
    path: '/find-account',
    name: 'FindAccountPage',
    component: FindAccountPage,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/ranking',
    name: 'rankingPage',
    component: RankingPage,
  },
  {
    path: '/ranking/analysis',
    name: 'AnalysisPage',
    component: StockAnalysisPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
