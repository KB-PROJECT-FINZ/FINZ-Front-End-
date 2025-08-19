export function goToChatbot(riskType = '') {
  window.dispatchEvent(
    new CustomEvent('openChatBot', {
      detail: { risk: riskType },
    }),
  )
}
