<template>
  <div class="flex flex-col items-center justify-center w-full h-screen bg-white">
    <DotLottieVue
      style="height: 200px; width: 200px"
      :speed="0.9"
      autoplay
      loop
      src="https://lottie.host/c404786e-2d84-4239-a092-5fa55366d5a7/DRPRrsgJH4.json"
    />
    <p class="mt-6 text-xl font-bold text-gray-800 text-center">
      축하합니다!<br />
      8000 크레딧을 획득하였습니다!
    </p>
  </div>
</template>
<script setup>
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/home') // 3초 뒤 홈으로 이동
  }, 3000)
})
</script>
