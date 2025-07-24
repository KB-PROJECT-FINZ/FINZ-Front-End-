import { defineStore } from 'pinia'
import {
  getMyRanking,
  getGroupedWeeklyRanking,
  getTop5Stocks,
  getWeeklyRanking,
} from '@/services/rankingService'

export const useRankingStore = defineStore('ranking', {
  state: () => ({
    myRanking: null,
    weeklyGrouped: {},
    top5: [],
    weeklyAll: [],
  }),
  actions: {
    async fetchMyRanking(userId) {
      const res = await getMyRanking(userId)
      this.myRanking = res.data
    },
    async fetchGroupedWeeklyRanking(week) {
      const res = await getGroupedWeeklyRanking(week)
      this.weeklyGrouped = res.data
    },
    async fetchTop5Stocks(week, traitType) {
      const res = await getTop5Stocks(week, traitType)
      this.top5 = res.data
    },
    async fetchWeeklyRanking(week) {
      const res = await getWeeklyRanking(week)
      this.weeklyAll = res.data
    },
  },
})
