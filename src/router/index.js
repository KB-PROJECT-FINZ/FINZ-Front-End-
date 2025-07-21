import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import TestPage from '../pages/TestPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import JournalPage from '@/pages/JournalPage.vue'
import JournalWritePage from '@/pages/JournalWritePage.vue'
import FeedbackPage from '@/pages/FeedbackPage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
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
      // path: '/about',
      // name: 'about',
      // // route level code-splitting
      // // this generates a separate chunk (About.[hash].js) for this route
      // // which is lazy-loaded when the route is visited.
      // component: () => import('../pages/HomePage.vue'),
    },
  ],
})

export default router
