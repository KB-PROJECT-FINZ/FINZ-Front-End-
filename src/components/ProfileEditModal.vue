<template>
  <!-- ToastMessage는 상위에서 관리 -->
  <teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
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
        <div class="flex flex-col items-center">
          <div class="relative">
            <div
              :class="[
                'w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ml-[3px]',
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
                @click="selectTemporaryImage(1)"
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
          <div class="mt-2 w-full ml-[3px]">
            <div class="text-sm text-gray-600 mb-3 text-center ml-[3px]">
              프로필 이미지를 선택해주세요
            </div>
            <div class="grid grid-cols-3 gap-3 ml-[3px]">
              <button
                v-for="(image, index) in availableImages.slice(1)"
                :key="index + 2"
                @click="selectTemporaryImage(index + 2)"
                :class="[
                  'w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200',
                  selectedImageNumber === index + 2
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300',
                  image.includes('finz.png') ? 'p-1' : '',
                  'ml-[3px]',
                ]"
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
          <div class="text-base text-gray-900 mt-3 flex items-center ml-[3px]">
            <span v-if="!isEditingNickname">{{ temporaryNickname }}</span>
            <input
              v-else
              ref="nicknameInput"
              v-model="editingNickname"
              @keyup.enter="confirmNicknameEdit"
              @blur="confirmNicknameEdit"
              class="text-base text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxlength="10"
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
          </div>

          <!-- 확인/취소 버튼 (확인 왼쪽, 취소 오른쪽) -->
          <div class="flex gap-3 mt-4 w-full">
            <button
              @click="saveChanges"
              :disabled="isUpdating || !hasChanges"
              :class="[
                'flex-1 py-2 px-4 rounded-lg transition-colors',
                isUpdating || !hasChanges
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600',
              ]"
            >
              {{ isUpdating ? '저장 중...' : '확인' }}
            </button>
            <button
              @click="$emit('close')"
              class="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
// ToastMessage는 상위에서 관리
import { computed, ref, nextTick, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  profile: { type: Object, required: true },
})

const emit = defineEmits(['close', 'update-profile-image', 'update-nickname', 'show-toast'])

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

// 임시 상태 (확인 버튼 누르기 전까지는 임시 저장)
const selectedImageNumber = ref(1)
const temporaryNickname = ref('')

// 닉네임 편집 관련 상태
const isEditingNickname = ref(false)
const editingNickname = ref('')
const nicknameInput = ref(null)

// 업데이트 상태
const isUpdating = ref(false)

// 선택된 이미지 번호 반환 (원본 프로필에서)
const getSelectedImageNumber = () => {
  const imageNumber = props.profile.profileImage
  if (typeof imageNumber === 'number' && imageNumber >= 1 && imageNumber <= 7) {
    return imageNumber
  }
  return 1 // 기본값
}

// 현재 프로필 이미지 소스 반환 (임시 선택된 이미지 반영)
const getCurrentProfileImageSrc = () => {
  const imageNumber = selectedImageNumber.value

  if (typeof imageNumber === 'number' && imageNumber >= 1 && imageNumber <= 7) {
    return availableImages[imageNumber - 1]
  }

  return availableImages[0]
}

// 초기값 설정
watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile) {
      selectedImageNumber.value = getSelectedImageNumber()
      temporaryNickname.value = newProfile.nickname || ''
    }
  },
  { immediate: true },
)

// 변경사항이 있는지 확인
const hasChanges = computed(() => {
  const originalImageNumber = getSelectedImageNumber()
  const originalNickname = props.profile.nickname || ''

  return (
    selectedImageNumber.value !== originalImageNumber ||
    temporaryNickname.value !== originalNickname
  )
})

// 임시로 이미지 선택 (아직 저장하지 않음)
const selectTemporaryImage = (imageNumber) => {
  selectedImageNumber.value = imageNumber
}

const handleImageError = (event) => {
  event.target.src = availableImages[0] // 기본 이미지로 폴백
}

// 닉네임 편집 관련 메서드
const startNicknameEdit = () => {
  isEditingNickname.value = true
  editingNickname.value = temporaryNickname.value
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

const confirmNicknameEdit = () => {
  const newNickname = editingNickname.value.trim()

  // 유효성 검사
  if (!newNickname) {
    toastMessage.value = '닉네임을 입력해주세요.'
    showToast.value = false
    nextTick(() => {
      showToast.value = true
    })
    return
  }

  if (newNickname.length < 2 || newNickname.length > 10) {
    toastMessage.value = '닉네임은 2-10자로 입력해주세요.'
    showToast.value = false
    nextTick(() => {
      showToast.value = true
    })
    return
  }

  // 임시 닉네임 업데이트
  temporaryNickname.value = newNickname
  isEditingNickname.value = false
}

// 모든 변경사항 저장
const saveChanges = async () => {
  if (isUpdating.value || !hasChanges.value) return

  try {
    isUpdating.value = true

    // 이미지 변경이 있는 경우
    if (selectedImageNumber.value !== getSelectedImageNumber()) {
      const imageResponse = await axios.post(
        '/api/user/update-profile-image',
        {
          profile_image: selectedImageNumber.value,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (imageResponse.data.success) {
        emit('update-profile-image', selectedImageNumber.value)
      }
    }

    // 닉네임 변경이 있는 경우
    if (temporaryNickname.value !== props.profile.nickname) {
      const nicknameResponse = await axios.post(
        '/api/user/update-nickname',
        {
          nickname: temporaryNickname.value,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (nicknameResponse.data.nickname) {
        emit('update-nickname', nicknameResponse.data.nickname)
      }
    }

    // 성공 메시지: 상위에 전달
    emit('show-toast', '프로필이 성공적으로 변경되었습니다.')
    emit('close')
  } catch (error) {
    console.error('프로필 변경 실패:', error)

    if (error.response && error.response.data && error.response.data.error) {
      emit('show-toast', error.response.data.error)
    } else {
      emit('show-toast', '프로필 변경에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.bg-opacity-40 {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
