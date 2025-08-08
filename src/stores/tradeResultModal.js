import { defineStore } from 'pinia'

export const useTradeResultModalStore = defineStore('tradeResultModal', {
  state: () => ({
    visible: false,
    type: 'BUY',
    stockName: '',
    isFilled: false,
    timer: null,
  }),
  actions: {
    open(type, stockName, isFilled = false) {
      this.type = type
      this.stockName = stockName
      this.isFilled = isFilled
      this.visible = true
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.visible = false
      }, 5000)
    },
    close() {
      this.visible = false
      if (this.timer) clearTimeout(this.timer)
    },
  },
})
