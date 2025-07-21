// import { createRouter, createWebHistory } from 'vue-router'
// import LoginView from '@/pages/LoginPage.vue'
// import LoginFormPage from '@/pages/LoginFormPage.vue'
// import SignupFormPage from '@/pages/SignupFormPage.vue'
// import FindAccountPage from '@/pages/FindAccountPage.vue'

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
import ChatBotPage from '@/pages/ChatBotPage.vue'
// import LoginView from '@/views/LoginView.vue' // ← 로그인 뷰는 주석 처리하거나 제외

const routes = [
  {
    path: '/', // 기본 루트 경로
    redirect: '/chatbot', // → 챗봇으로 강제 이동
  },
  {
    path: '/chatbot',
    name: 'ChatBot',
    component: ChatBotPage,
  },
  // 로그인 뷰 제거 or 보류
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
