import { createRouter, createWebHistory } from 'vue-router'

import ChatBotHomePage from '@/pages/ChatBotPage/ChatBotHomePage.vue'
import RecommendPage from '@/pages/ChatBotPage/RecommendPage.vue'
import AnalyzePage from '@/pages/ChatBotPage/AnalyzePage.vue'
import TermExplainPage from '@/pages/ChatBotPage/TermExplainPage.vue'
import PortfolioPage from '@/pages/ChatBotPage/PortfolioPage.vue'

import LoginView from '@/pages/LoginPages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/LoginPages/SignupFormPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import HomePage from '@/pages/HomePage.vue'

import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'

import TradingPage from '@/pages/TradingPage.vue'
import ChartPage from '@/pages/ChartPage.vue'

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
    path: '/chatbot',
    name: 'ChatBotHomePage',
    component: ChatBotHomePage,
  },
  {
    path: '/chatbot/recommend',
    name: 'ChatBotRecommendPage',
    component: RecommendPage,
  },
  {
    path: '/chatbot/analyze',
    name: 'ChatBotAnalyzePage',
    component: AnalyzePage,
  },
  {
    path: '/chatbot/terms',
    name: 'ChatBotTermExplainPage',
    component: TermExplainPage,
  },
  {
    path: '/chatbot/portfolio',
    name: 'ChatBotPortfolioPage',
    component: PortfolioPage,
  },
  {
    path: '/investment-test',
    name: 'InvestmentTest',
    component: InvestmentTestPage,
  },
  {
    path: '/trading',
    name: 'Trading',
    component: TradingPage,
  },
  {
    path: '/chart',
    name: 'Chart',
    component: ChartPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
