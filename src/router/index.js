import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import TestPage from '../pages/TestPage.vue'
import TradingPage from '../pages/TradingPage.vue'
import ChartPage from '../pages/ChartPage.vue'

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
      path: '/trading',
      name: 'trading',
      component: TradingPage,
    },
    {
      path: '/chart',
      name: 'chart',
      component: ChartPage,
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
