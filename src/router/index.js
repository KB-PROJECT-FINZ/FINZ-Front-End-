import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginPages/LoginView.vue'
import LoginFormPage from '@/pages/LoginPages/LoginFormPage.vue'
import SignupFormPage from '@/pages/SignupFormPage.vue'
import ChatBotPage from '@/pages/ChatBotPage.vue'
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import HomePage from '@/pages/HomePage.vue'
import InvestmentTestPage from '@/pages/InvestmentTestPage/InvestMentTestPage.vue'
import LearningDetailPage from '@/pages/Learning/LearningDetailPage.vue';
import LearningQuizPage from '@/pages/Learning/LearningQuizPage.vue';
import LearningPage from '@/pages/Learning/LearningPage.vue';

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
