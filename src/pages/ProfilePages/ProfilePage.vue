<template>
  <div class="bg-white min-h-screen pb-16">
    <!-- 상단 헤더 -->
    <header
      class="flex items-center justify-between bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-200"
    >
      <div class="w-10"></div>
      <span class="text-lg font-bold text-gray-800">마이페이지</span>
      <img
        src="https://cdn-icons-png.flaticon.com/512/157/157316.png"
        alt="설정 아이콘"
        class="w-6 h-6 cursor-pointer"
        @click="handleLogout"
      />
    </header>

    <!-- 프로필 박스 -->
    <section class="rounded-2xl px-5 mt-5 bg-white">
      <!-- 프로필 이미지 + 투자 성향 + 이름 (가운데 정렬) -->
      <div class="flex flex-col items-center">
        <div class="relative">
          <div
            class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2"
          >
            <img
              :src="getProfileImageSrc()"
              alt="프로필"
              :style="getImageStyle()"
              @error="handleImageError"
            />
          </div>
          <!-- 사진 변경 버튼 -->
          <button
            @click="triggerFileInput"
            class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="white"
              class="w-3 h-3"
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

        <div
          class="inline-block mb-1 px-3 py-1 rounded-full text-xs font-semibold"
          style="
            background: #6366f1;
            color: #fff;
            box-shadow: 0 1px 4px 0 rgba(99, 102, 241, 0.08);
            letter-spacing: 0.01em;
          "
        >
          {{ profile.type }} {{ nameKr }}
        </div>
        <div class="text-base font-bold text-gray-900">{{ profile.name }}님</div>
      </div>
    </section>

    <!-- 로딩 오버레이 -->
    <div
      v-if="isUploading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span class="text-gray-700">사진을 업로드하는 중...</span>
        </div>
      </div>
    </div>

    <hr class="my-4 mx-15 border-gray-200" />

    <!-- 추천 콘텐츠 -->
    <div class="px-5">
      <div class="mb-2">
        <h2 class="text-md font-bold text-center w-full">{{ riskTypeName }} 맞춤 콘텐츠</h2>
        <div class="flex justify-end w-full mt-1">
          <button class="text-xs text-gray-600 underline" @click="goToContents">
            다른 성향도 알아보기 >
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 place-items-center">
        <div
          v-for="(item, index) in recommendedContentsByRisk.filter(
            (item) => !item.quizId && !item.hasQuiz,
          )"
          :key="item.contentId"
          class="min-w-[160px] h-28 bg-white p-3 rounded-xl shadow-sm shrink-0 cursor-pointer flex flex-col justify-center mb-6"
          @click="openContentModal(item)"
        >
          <p
            :class="
              index % 2 === 0
                ? 'text-purple-600 text-base font-bold'
                : 'text-blue-600 text-base font-bold'
            "
            class="mb-1"
          >
            {{ item.label || '추천' }}
          </p>
          <p class="text-sm font-semibold">{{ item.title }}</p>
        </div>
      </div>
    </div>

    <hr class="my-2 border-gray-200" />

    <!-- 추천 콘텐츠 상세 모달 -->
    <transition name="fade-scale">
      <div
        v-if="selectedContent"
        class="fixed inset-0 bg-gray-300/40 z-50 flex items-center justify-center"
      >
        <div
          class="bg-white p-6 rounded-xl w-[90%] max-w-md relative shadow-2xl ring-1 ring-gray-200 transition-all duration-300 ease-in-out"
        >
          <p
            v-if="selectedContent.label"
            class="text-xs text-gray-500 mb-1 uppercase tracking-wide"
          >
            {{ selectedContent.label }}
          </p>
          <h2 class="text-lg font-bold mb-1 text-gray-800">
            {{ selectedContent.title }}
          </h2>
          <div class="border-b border-gray-300 my-3"></div>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">
            {{ selectedContent.content }}
          </p>
          <button
            class="absolute top-3 right-4 text-gray-500 hover:text-black"
            @click="selectedContent = null"
          >
            ✕
          </button>
        </div>
      </div>
    </transition>

    <!-- 투자 일지 & 나의 투자 성향 알아보기 -->
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/journal"
        class="flex items-center bg-white rounded-xl px-4 py-4 text-inherit no-underline"
      >
        <span class="text-xl mr-4">📒</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">투자 일지</div>
          <div class="text-sm text-gray-500">나의 투자 기록을 확인해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>

    <hr class="my-4 border-gray-200" />

    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/mock-trading/ai-report"
        class="flex items-center bg-white rounded-xl px-4 py-4 text-inherit no-underline"
      >
        <span class="text-xl mr-4">🤖</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">AI 분석 리포트</div>
          <div class="text-sm text-gray-500">AI가 분석한 투자 리포트를 확인해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>

    <hr class="my-4 border-gray-200" />

    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/risk-profile"
        class="flex items-center bg-white rounded-xl px-4 py-4 text-inherit no-underline"
      >
        <span class="text-xl mr-4">📝</span>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-gray-900 mb-0.5">나의 투자 성향 알아보기</div>
          <div class="text-sm text-gray-500">투자 성향을 분석해보세요</div>
        </div>
        <span class="text-xl text-gray-300 ml-2">&#8250;</span>
      </router-link>
    </section>

    <hr class="my-2 border-gray-200" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useAssetDataStore } from '@/services/useAssetData'

const router = useRouter()
const userStore = useUserStore()
const { loadUserData } = useAssetDataStore()

// 기존 상태들
const profile = ref({ image: '', name: '', type: '', level: 3 })
const riskTypeName = ref('')
const recommendedContentsByRisk = ref([])
const selectedContent = ref(null)
const nameKr = ref('')

// 사진 업로드 관련 상태
const fileInput = ref(null)
const isUploading = ref(false)

// 프로필 이미지 소스 가져오기 (finz.png fallback)
const getProfileImageSrc = () => {
  if (profile.value.image && profile.value.image.trim() !== '') {
    // 상대 경로인 경우 절대 경로로 변환
    if (profile.value.image.startsWith('/uploads/')) {
      return `http://localhost:8080${profile.value.image}`
    }
    return profile.value.image
  }
  return '/src/assets/finz.png'
}

// 이미지 스타일 계산
const getImageStyle = () => {
  return profile.value.image
    ? 'width: 100%; height: 100%; object-fit: cover; object-position: center;'
    : 'width: 80%; height: 100%; object-fit: scale-down; object-position: center; background: transparent;'
}

// 파일 입력 트리거
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 파일 선택 처리
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
        'Content-Type': 'multipart/form-data'
      }
    })

    // 성공 시 프로필 이미지 업데이트
    if (response.data.imageUrl) {
      profile.value.image = response.data.imageUrl
      console.log('프로필 이미지 업데이트됨:', response.data.imageUrl) // 디버깅용
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
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 이미지 로드 에러 처리 (기본 이미지로 복원)
const handleImageError = (event) => {
  event.target.src = '/src/assets/finz.png'
  profile.value.image = ''
}

// 기존 함수들
const goToContents = () => router.push('/recommend')
const openContentModal = (item) => {
  selectedContent.value = item
}

const fetchRecommendedContentsByRiskType = async (riskType) => {
  try {
    const res = await axios.get(`/api/contents/recommend?riskType=${riskType}`, {
      withCredentials: true,
    })
    recommendedContentsByRisk.value = res.data
  } catch (e) {
    console.error('❌ 추천 콘텐츠 조회 실패:', e)
    recommendedContentsByRisk.value = []
  }
}

const handleLogout = async () => {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true })
  } catch (e) {
    console.warn('서버 세션 종료 실패', e)
  }

  localStorage.removeItem('user')
  router.push('/login-form')
}

onMounted(async () => {
  try {
    const me = await axios.get('/api/auth/me', { withCredentials: true })

    console.log('API 응답 확인:', me.data) // 디버깅용

    profile.value = {
      name: me.data.name,
      type: me.data.riskType,
      level: typeof me.data.level === 'number' ? me.data.level : 3,
      image: me.data.profileImage || '', // profileImage 필드 사용
    }

    console.log('프로필 이미지 경로:', profile.value.image) // 디버깅용

    // 투자 성향 한글명 가져오기
    const detailRes = await axios.get(`/api/user/risk-type-detail/${profile.value.type}`, {
      withCredentials: true,
    })
    nameKr.value = detailRes.data.nameKr
    riskTypeName.value = detailRes.data.nameKr

    // 추천 콘텐츠 불러오기
    await fetchRecommendedContentsByRiskType(profile.value.type)
    await loadUserData()

  } catch (e) {
    console.error('로딩 실패:', e)
    // 세션 실패 시 로컬스토리지 fallback
    try {
      profile.value.name = localStorage.getItem('name') || '사용자'
      profile.value.type = localStorage.getItem('riskType') || '정보 없음'
      riskTypeName.value = profile.value.type
      await loadUserData()
    } catch (fallbackError) {
      console.error('Fallback 로딩도 실패:', fallbackError)
    }
  }
})
</script>

<style scoped>
@import 'v-calendar/style.css';

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
