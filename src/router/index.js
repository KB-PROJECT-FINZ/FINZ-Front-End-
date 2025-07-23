import { createRouter, createWebHistory } from 'vue-router'
import MockTradingHome from '@/pages/mockTrading/MockTradingHome.vue'


const routes = [
  {
    path: '/',
    redirect: '/mock-trading'
  },
  {
    path: '/mock-trading',
    name: 'MockTradingHome',
    component: MockTradingHome
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
