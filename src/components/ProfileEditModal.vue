<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 relative">
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        @click="$emit('close')"
        aria-label="닫기"
      >
        &times;
      </button>
      <!-- 프로필 이미지 -->
      <div class="flex flex-col items-center mb-4">
        <div class="relative">
          <div
            class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2"
          >
            <img
              :src="getProfileImageSrc()"
              alt="프로필"
              class="w-full h-full object-cover object-center"
              @error="handleImageError"
            />
          </div>
          <!-- 사진 변경 버튼 -->
          <button
            @click="triggerFileInput"
            class="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="white"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          </button>
          <!-- 숨겨진 파일 입력 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="hidden"
          />
        </div>
        <div class="text-base text-gray-900 mt-2 mb-1 flex items-center gap-1">
          {{ profile.name }}님
          <button
            class="ml-1 p-1 rounded hover:bg-gray-200 focus:outline-none"
            @click="emit('edit-nickname')"
            aria-label="닉네임 수정"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="#222"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 5.487a2.1 2.1 0 0 0-2.97 0l-7.5 7.5a.75.75 0 0 0-.19.33l-1 3a.75.75 0 0 0 .95.95l3-1a.75.75 0 0 0 .33-.19l7.5-7.5a2.1 2.1 0 0 0 0-2.97ZM15.45 6.9l-1.34-1.34m-7.5 7.5l1.34 1.34"
              />
            </svg>
          </button>
        </div>
        <div class="text-xs text-gray-700 mb-2">{{ profile.type }} {{ nameKr }}</div>
      </div>
      <div class="flex flex-col gap-2">
        <button
          class="w-full h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          @click="$emit('close')"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  profile: { type: Object, required: true },
})

const emit = defineEmits(['close', 'update-profile-image'])

import { ref } from 'vue'
const nameKr = computed(() => props.profile.nameKr || '')

const fileInput = ref(null)

const getProfileImageSrc = () => {
  if (props.profile.image && props.profile.image.trim() !== '') {
    if (props.profile.image.startsWith('/uploads/')) {
      return `http://localhost:8080${props.profile.image}`
    }
    return props.profile.image
  }
  return '/src/assets/finz.png'
}

const handleImageError = (event) => {
  event.target.src = '/src/assets/finz.png'
}

import axios from 'axios'
const isUploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 파일 크기 검증 (5MB 제한)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert('파일 크기는 5MB 이하여야 합니다.')
    return
  }

  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('JPG, PNG, WEBP 형식의 이미지만 업로드 가능합니다.')
    return
  }

  try {
    isUploading.value = true

    // FormData 생성
    const formData = new FormData()
    formData.append('image', file)

    // 서버에 업로드
    const response = await axios.post('/api/user/upload-profile-image', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // 성공 시 프로필 이미지 업데이트
    if (response.data.imageUrl) {
      // 부모로 emit
      emit('update-profile-image', response.data.imageUrl)
      alert('프로필 사진이 성공적으로 변경되었습니다.')
    } else {
      console.error('서버 응답에 imageUrl이 없습니다:', response.data)
    }
  } catch (error) {
    console.error('프로필 사진 업로드 실패:', error)
    alert('프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isUploading.value = false
    // 파일 입력 초기화
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<style scoped>
.bg-opacity-40 {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
