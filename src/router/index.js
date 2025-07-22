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
import FindAccountPage from '@/pages/LoginPages/FindAccountPage.vue'
import FeedbackListPage from '@/pages/ProfilePages/FeedbackListPage.vue'
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
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
