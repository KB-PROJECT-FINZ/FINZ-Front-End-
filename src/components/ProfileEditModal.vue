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
            :class="[
              'w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2 ml-[3px]',
              getCurrentProfileImageSrc().includes('finz.png') ? 'p-2' : '',
            ]"
          >
            <img
              :src="getCurrentProfileImageSrc()"
              alt="프로필"
              :class="['w-full h-full object-center object-contain p-2']"
              @error="handleImageError"
            />
            <!-- X(기본 이미지) 버튼 -->
            <button
              type="button"
              class="absolute top-0 right-0 w-7 h-7 bg-white border border-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              style="transform: translate(35%, -35%)"
              @click="setDefaultProfileImage"
              aria-label="기본 이미지로 변경"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                stroke-width="2"
                stroke="black"
                class="w-4 h-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M6 14L14 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 이미지 선택기: 항상 표시, 기본 이미지는 제외 (2~7번만) -->
        <div class="mt-4 w-full">
          <div class="text-sm text-gray-600 mb-3 text-center">프로필 이미지를 선택해주세요</div>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="(image, index) in availableImages.slice(1)"
              :key="index + 2"
              @click="selectProfileImage(index + 2)"
              :class="[
                'w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200',
                getSelectedImageNumber() === index + 2
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300',
                image.includes('finz.png') ? 'p-1' : '',
              ]"
              :disabled="isUpdatingImage"
            >
              <img
                :src="image"
                :alt="`프로필 이미지 ${index + 2}`"
                :class="['w-full h-full object-center object-contain p-2']"
              />
            </button>
          </div>
        </div>

        <!-- 닉네임 표시 및 수정 -->
        <div class="text-base text-gray-900 mt-5 flex items-center">
          <span v-if="!isEditingNickname">{{ profile.nickname }}</span>
          <input
            v-else
            ref="nicknameInput"
            v-model="editingNickname"
            @keyup.enter="saveNickname"
            @keyup.escape="cancelNicknameEdit"
            @blur="cancelNicknameEdit"
            class="text-base text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxlength="10"
            :disabled="isUpdatingNickname"
          />
          <button
            v-if="!isEditingNickname"
            class="ml-1 p-1 rounded hover:bg-gray-200 focus:outline-none"
            @click="startNicknameEdit"
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
          <div v-if="isEditingNickname" class="flex gap-1">
            <button
              @mousedown.prevent="saveNickname"
              :disabled="isUpdatingNickname"
              class="p-1 rounded hover:bg-green-100 focus:outline-none text-green-600 disabled:opacity-50"
              aria-label="저장"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click="cancelNicknameEdit"
              :disabled="isUpdatingNickname"
              class="p-1 rounded hover:bg-red-100 focus:outline-none text-red-600 disabled:opacity-50"
              aria-label="취소"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import axios from 'axios'

const props = defineProps({
  profile: { type: Object, required: true },
})

const emit = defineEmits(['close', 'update-profile-image', 'update-nickname'])

// 사용 가능한 프로필 이미지들 (assets 경로)
const availableImages = [
  '/src/assets/finz.png', // 1번 - 기본 이미지
  '/src/assets/FINZ_고양이.png', // 2번
  '/src/assets/FINZ_곰.png', // 3번
  '/src/assets/FINZ_병아리.png', // 4번
  '/src/assets/FINZ_원숭이.png', // 5번
  '/src/assets/FINZ_코끼리.png', // 6번
  '/src/assets/FINZ_토끼.png', // 7번
]

// 이미지 선택 관련 상태
const showImageSelector = ref(false)
const isUpdatingImage = ref(false)

// 닉네임 편집 관련 상태
const isEditingNickname = ref(false)
const editingNickname = ref('')
const nicknameInput = ref(null)
const isUpdatingNickname = ref(false)

// 현재 프로필 이미지 소스 반환
const getCurrentProfileImageSrc = () => {
  const availableImages = [
    '/src/assets/finz.png', // 1번
    '/src/assets/FINZ_고양이.png', // 2번
    '/src/assets/FINZ_곰.png', // 3번
    '/src/assets/FINZ_병아리.png', // 4번
    '/src/assets/FINZ_원숭이.png', // 5번
    '/src/assets/FINZ_코끼리.png', // 6번
    '/src/assets/FINZ_토끼.png', // 7번
  ]

  // UserVo의 profileImage는 Integer
  const imageNumber = props.profile.profileImage

  // 유효한 이미지 번호인 경우
  if (typeof imageNumber === 'number' && imageNumber >= 1 && imageNumber <= 7) {
    return availableImages[imageNumber - 1]
  }

  // 기본 이미지 (null이거나 유효하지 않은 경우)
  return availableImages[0]
}

// 선택된 이미지 번호 반환
const getSelectedImageNumber = () => {
  const imageNumber = props.profile.profileImage
  if (typeof imageNumber === 'number' && imageNumber >= 1 && imageNumber <= 7) {
    return imageNumber
  }
  return 1 // 기본값
}
// 이미지 선택기 토글
const toggleImageSelector = () => {
  showImageSelector.value = !showImageSelector.value
}

// 프로필 이미지 선택
const selectProfileImage = async (imageNumber) => {
  if (isUpdatingImage.value) return

  try {
    isUpdatingImage.value = true

    const response = await axios.post(
      '/api/user/update-profile-image',
      {
        profile_image: imageNumber,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.data.success) {
      // 성공 시 부모로 emit
      emit('update-profile-image', imageNumber)
      showImageSelector.value = false
    }
  } catch (error) {
    console.error('프로필 이미지 변경 실패:', error)

    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error)
    } else {
      alert('프로필 이미지 변경에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isUpdatingImage.value = false
  }
}

// 기본 이미지로 변경
const setDefaultProfileImage = async () => {
  await selectProfileImage(1) // 1번이 기본 이미지
}

const handleImageError = (event) => {
  event.target.src = availableImages[0] // 기본 이미지로 폴백
}

// 닉네임 편집 관련 메서드
const startNicknameEdit = () => {
  isEditingNickname.value = true
  editingNickname.value = props.profile.nickname
  nextTick(() => {
    if (nicknameInput.value) {
      nicknameInput.value.focus()
      nicknameInput.value.select()
    }
  })
}

const cancelNicknameEdit = () => {
  isEditingNickname.value = false
  editingNickname.value = ''
}

const saveNickname = async () => {
  if (isUpdatingNickname.value) return

  const newNickname = editingNickname.value.trim()

  // 유효성 검사
  if (!newNickname) {
    alert('닉네임을 입력해주세요.')
    return
  }

  if (newNickname.length < 2 || newNickname.length > 10) {
    alert('닉네임은 2-10자로 입력해주세요.')
    return
  }

  if (newNickname === props.profile.nickname) {
    // 변경사항이 없으면 편집 모드 종료
    cancelNicknameEdit()
    return
  }

  try {
    isUpdatingNickname.value = true

    const response = await axios.post(
      '/api/user/update-nickname',
      {
        nickname: newNickname,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.data.nickname) {
      // 성공 시 부모 컴포넌트에 알림
      emit('update-nickname', response.data.nickname)
      alert('닉네임이 성공적으로 변경되었습니다.')
      isEditingNickname.value = false
    }
  } catch (error) {
    console.error('닉네임 변경 실패:', error)

    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error)
    } else {
      alert('닉네임 변경에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isUpdatingNickname.value = false
  }
}
</script>

<style scoped>
.bg-opacity-40 {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
