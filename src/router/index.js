import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import TestPage from '../pages/TestPage.vue'
import ProfilePage from '@/pages//ProfilePages/ProfilePage.vue'
import JournalPage from '@/pages/ProfilePages//JournalPage.vue'
import JournalWritePage from '@/pages//ProfilePages/JournalWritePage.vue'
import FeedbackPage from '@/pages/ProfilePages/FeedbackPage.vue'
import LoginView from '@/pages/LoginPages/LoginPage.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/LoginPages/SignupFormPage.vue'
import ChatBotPage from '@/pages/ChatBotPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import FeedbackListPage from '@/pages/ProfilePages/FeedbackListPage.vue'
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
import LearningDetailPage from '@/pages/Learning/LearningDetailPage.vue'
import LearningQuizPage from '@/pages/Learning/LearningQuizPage.vue'
import LearningPage from '@/pages/Learning/LearningPage.vue'

import TradingPage from '@/pages/TradingPage.vue'
import ChartPage from '@/pages/ChartPage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'LoginFormPage',
    component: LoginFormPage,
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
    path: '/test',
    name: 'test',
    component: TestPage,
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
  // 나중에 /home, /mypage 등 추가 가능
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
