import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '@/pages/LoginPages/LoginPage.vue'
import ProfilePage from '@/pages//ProfilePages/ProfilePage.vue'
import JournalPage from '@/pages/ProfilePages//JournalPage.vue'
import JournalWritePage from '@/pages//ProfilePages/JournalWritePage.vue'
import FeedbackPage from '@/pages/ProfilePages/FeedbackPage.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/LoginPages/SignupFormPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import RankingPage from '@/pages/RankingPages/RankingPage.vue'
import StockAnalysisPage from '@/pages/RankingPages/StockAnalysisPage.vue'
import FeedbackListPage from '@/pages/ProfilePages/FeedbackListPage.vue'
import ChatBotPage from '@/pages/ChatBotPage/ChatBotPage.vue'

import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'
import LearningDetailPage from '@/pages/Learning/LearningDetailPage.vue'
import LearningQuizPage from '@/pages/Learning/LearningQuizPage.vue'
import LearningPage from '@/pages/Learning/LearningPage.vue'
import InvestmentResult from '@/pages/InvestmentTestPage/InvestmentResult.vue'
import ReTestResult from '@/pages/InvestmentTestPage/ReTestResultpage.vue'
import ReTestPage from '@/pages/InvestmentTestPage/ReTestPage.vue'
import TradingPage from '@/pages/mockTrading/TradingPage.vue'
// import ChartPage from '@/pages/mockTrading/ChartPage.vue'
import { useUserStore } from '@/stores/user'
import MockTradingHome from '@/pages/mockTrading/MockTradingHome.vue'
import AssetStatus from '@/pages/mockTrading/AssetStatus.vue'
import Holdings from '@/pages/mockTrading/Holdings.vue'
import Transactions from '@/pages/mockTrading/Transactions.vue'
const routes = [
  {
    path: '/',
    name: 'Loginpage',
    component: LoginPage,
  },
  {
    path: '/login-form',
    name: 'LoginFormPage',
    component: LoginFormPage,
  },
  {
    path: '/signup',
    name: 'SignupForm',
    component: SignupFormPage,
  },

  {
    path: '/find-account',
    name: 'FindAccount',
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
  {
    path: '/investment-result',
    name: 'InvestmentResult',
    component: InvestmentResult,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
  },
  {
    path: '/journal',
    name: 'journal',
    component: JournalPage,
  },
  {
    path: '/journalwrite',
    name: 'journalwrite',
    component: JournalWritePage,
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: FeedbackPage,
  },
  {
    path: '/feedbacklist',
    name: 'feedbacklist',
    component: FeedbackListPage,
  },
  {
    path: '/chatbot',
    name: 'ChatBotPage',
    component: ChatBotPage,
  },
  {
    path: '/investment-test',
    name: 'InvestmentTest',
    component: InvestmentTestPage,
  },
  {
    path: '/learning',
    name: 'learning',
    component: LearningPage,
  },
  {
    path: '/learning/:id',
    name: 'learning-detail',
    component: LearningDetailPage,
  },
  {
    path: '/learning/:id/quiz',
    name: 'learning-quiz',
    component: LearningQuizPage,
  },
  {
    path: '/trading',
    name: 'Trading',
    component: TradingPage,
  },
  // {
  //   path: '/chart',
  //   name: 'Chart',
  //   component: ChartPage,
  // },
  {
    path: '/investment-test/retest',
    name: 'ReTestPage',
    component: ReTestPage,
  },
  {
    path: '/investment-test/retest/result',
    name: 'ReTestResult',
    component: ReTestResult,
  },
  {
    path: '/mock-trading',
    name: 'MockTradingHome',
    component: MockTradingHome,
  },
  {
    path: '/mock-trading/:stockCode/chart',
    name: 'ChartPage',
    component: () => import('@/pages/mockTrading/ChartPage.vue'),
    props: true, // route params를 props로 전달
  },
  // 새로 추가할 자산 현황 경로
  {
    path: '/mock-trading/asset-status',
    name: 'AssetStatus',
    component: AssetStatus,
    //meta: { requiresAuth: true } // 로그인 필요
  },
  {
    path: '/mock-trading/holdings',
    name: 'Holdings',
    component: Holdings,
  },
  {
    path: '/mock-trading/transactions',
    name: 'Transactions',
    component: Transactions,
  },
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
