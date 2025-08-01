<template>
  <div class="aggressive-recommend-container">
    <h2 class="text-xl font-bold mb-4">🔥 적극적인 투자형에게 추천하는 콘텐츠</h2>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="content in contents"
        :key="content.id"
        class="border rounded-lg p-3 shadow cursor-pointer hover:bg-gray-50"
        @click="openContent(content)"
      >
        <img :src="content.thumbnail" alt="thumbnail" class="w-full h-32 object-cover rounded" />
        <div class="mt-2 font-semibold">{{ content.title }}</div>
        <div class="text-sm text-gray-500">
          {{ content.type === 'TEXT' ? '텍스트 콘텐츠' : '영상 콘텐츠' }}
        </div>
      </div>
    </div>

    <!-- 상세 콘텐츠 모달 -->
    <div v-if="selectedContent" class="modal-backdrop" @click.self="selectedContent = null">
      <div class="modal-content">
        <h3 class="text-lg font-bold mb-2">{{ selectedContent.title }}</h3>
        <div v-if="selectedContent.type === 'TEXT'">
          <p>{{ selectedContent.body }}</p>
        </div>
        <div v-else-if="selectedContent.type === 'VIDEO'">
          <iframe
            :src="selectedContent.videoUrl"
            width="100%"
            height="315"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
        <button @click="selectedContent = null" class="mt-4 btn">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const contents = ref([])
const selectedContent = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('/api/learning/recommend?riskType=AGR') // 적극적 성장형 기준
    contents.value = response.data
  } catch (e) {
    console.error('콘텐츠 불러오기 실패', e)
  }
})

const openContent = async (content) => {
  try {
    const res = await axios.get(`/api/learning/detail/${content.id}`)
    selectedContent.value = res.data
  } catch (e) {
    console.error('콘텐츠 상세 조회 실패', e)
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 2rem;
  width: 80%;
  max-width: 600px;
  border-radius: 1rem;
}
.btn {
  background: #2d6cdf;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>
