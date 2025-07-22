// import { createRouter, createWebHistory } from 'vue-router'
// import LoginView from '@/pages/LoginPage.vue'
// import LoginFormPage from '@/pages/LoginFormPage.vue'
// import SignupFormPage from '@/pages/SignupFormPage.vue'
// import FindAccountPage from '@/pages/FindAccountPage.vue'
// import ChatBotPage from '@/pages/ChatBotPage.vue'
// import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
// import HomePage from '@/pages/HomePage.vue'
// import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'

// const routes = [
//   {
//     path: '/',
//     name: 'Login',
//     component: LoginView,
//   },
//   {
//     path: '/login-form',
//     name: 'LoginFormPage',
//     component: LoginFormPage,
//   },
//   {
//     path: '/signup',
//     name: 'SignupFormPage',
//     component: SignupFormPage,
//   },
//   {
//     path: '/find-account',
//     name: 'FindAccountPage',
//     component: FindAccountPage,
//   },
//   {
//     path: '/chatbot',
//     name: 'ChatBot',
//     component: ChatBotPage,

//     path: '/home',
//     name: 'HomePage',
//     component: HomePage,
//   },
//   {
//     path: '/investment-test',
//     name: 'InvestmentTestPage',
//     component: InvestmentTestPage,
//   },
//   // 나중에 /home, /mypage 등 추가 가능
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// })

// export default router
// 챗봇 기능 테스트용
//---------------------------------------------------------------------------//
import { createRouter, createWebHistory } from 'vue-router'
import ChatBotHomePage from '@/pages/ChatBotPage/ChatBotHomePage.vue'
import RecommendPage from '@/pages/ChatBotPage/RecommendPage.vue'
import AnalyzePage from '@/pages/ChatBotPage/AnalyzePage.vue'
import TermExplainPage from '@/pages/ChatBotPage/TermExplainPage.vue'
import PortfolioPage from '@/pages/ChatBotPage/PortfolioPage.vue'
// import LoginView from '@/views/LoginView.vue' // ← 로그인 뷰는 주석 처리하거나 제외

const routes = [
  {
    path: '/', // 기본 루트 경로
    redirect: '/chatbot', // → 챗봇으로 강제 이동
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
  // 로그인 뷰 제거 or 보류
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
