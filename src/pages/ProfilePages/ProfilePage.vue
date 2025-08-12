<template>
  <div class="bg-white min-h-screen pb-16">
    <!-- 헤더+프로필 공통 배경 -->
    <div style="background: #f2f6fd">
      <!-- 상단 헤더 -->
      <header
        class="flex items-center justify-end px-4 pt-4 pb-3 rounded-t-2xl sticky top-0 z-10"
        style="background: #f2f6fd; border-bottom: none"
      >
        <button
          class="w-8 h-8 flex items-center justify-center"
          aria-label="프로필 수정"
          @click="openProfileEditModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="#222"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182l-9.75 9.75a2 2 0 0 1-.708.464l-4.25 1.417a.5.5 0 0 1-.632-.632l1.417-4.25a2 2 0 0 1 .464-.708l9.75-9.75Z"
            />
          </svg>
        </button>
        <!-- 프로필 수정 모달 -->
        <profile-edit-modal
          v-if="showProfileEditModal"
          @close="showProfileEditModal = false"
          :profile="profile"
          @update-profile-image="onProfileImageUpdated"
          @update-nickname="onNicknameUpdated"
        />
      </header>

      <!-- 프로필 박스 -->
      <section class="rounded-b-2xl px-5 mt-5" style="background: #f2f6fd">
        <!-- 프로필 이미지 + 투자 성향 + 이름 (가운데 정렬) -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <div
              :class="[
                'w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2 border border-black',
                getProfileImageSrc().includes('finz.png') ? 'p-1' : '',
              ]"
            >
              <img
                :src="getProfileImageSrc()"
                alt="프로필"
                class="w-full h-full object-center object-contain p-2"
                @error="handleImageError"
              />
            </div>
          </div>

          <div class="text-sm text-gray-900 mb-1">{{ profile.nickname }}</div>
          <div class="text-xs text-gray-700 mb-6">{{ profile.type }} {{ nameKr }}</div>
        </div>
      </section>
    </div>

    <!-- 로딩 오버레이는 ProfileEditModal에서 처리 -->

    <!-- 맞춤 콘텐츠 카드형 메뉴 -->
    <section class="flex flex-col gap-3 mx-4 mb-5 mt-6">
      <router-link
        to="/mock-trading/ai-report"
        class="flex items-center bg-white rounded-xl px-6 py-4 text-inherit no-underline cursor-pointer hover:bg-gray-50 transition"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/12400/12400883.png"
          alt="뉴스 아이콘"
          width="24"
          height="24"
          class="mr-4"
        />
        <div class="flex-1 min-w-0">
          <div class="text-base text-gray-900 mb-0.5">AI 분석 리포트</div>
          <div class="text-sm text-gray-500">AI가 분석한 투자 리포트를 확인해보세요</div>
        </div>
        <span class="text-2xl text-black ml-2">&#8250;</span>
      </router-link>
    </section>
    <!-- 투자 일지 & 나의 투자 성향 알아보기 -->
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/journal"
        class="flex items-center bg-white rounded-xl px-6 py-4 text-inherit no-underline cursor-pointer hover:bg-gray-50 transition"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/7653/7653160.png"
          alt="뉴스 아이콘"
          width="24"
          height="24"
          class="mr-4"
        />
        <div class="flex-1 min-w-0">
          <div class="text-base text-gray-900 mb-0.5">투자 일지</div>
          <div class="text-sm text-gray-500">나의 투자 기록을 확인해보세요</div>
        </div>
        <span class="text-2xl text-black ml-2">&#8250;</span>
      </router-link>
    </section>
    <section class="flex flex-col gap-3 mx-4 mb-5">
      <div
        class="flex items-center bg-white rounded-xl px-6 py-4 text-inherit no-underline cursor-pointer hover:bg-gray-50 transition"
        @click="goToCustomContents"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/7931/7931221.png"
          alt="뉴스 아이콘"
          width="24"
          height="24"
          class="mr-4"
        />
        <div class="flex-1 min-w-0">
          <div class="text-base text-gray-900 mb-0.5">맞춤 콘텐츠</div>
          <div class="text-sm text-gray-500">나만을 위한 추천 콘텐츠를 확인해보세요</div>
        </div>
        <span class="text-2xl text-black ml-2">&#8250;</span>
      </div>
    </section>

    <section class="flex flex-col gap-3 mx-4 mb-5">
      <router-link
        to="/risk-profile"
        class="flex items-center bg-white rounded-xl px-6 py-4 text-inherit no-underline cursor-pointer hover:bg-gray-50 transition"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/14700/14700716.png"
          alt="뉴스 아이콘"
          width="24"
          height="24"
          class="mr-4"
        />
        <div class="flex-1 min-w-0">
          <div class="text-base text-gray-900 mb-0.5">나의 투자 성향 알아보기</div>
          <div class="text-sm text-gray-500">투자 성향을 분석해보세요</div>
        </div>
        <span class="text-2xl text-black ml-2">&#8250;</span>
      </router-link>
    </section>

    <footer-navigation></footer-navigation>

    <!-- 로그아웃 버튼 (네비게이션 아래) -->
    <div class="w-full flex justify-center mt-4 mb-8">
      <button
        @click="handleLogout"
        class="w-[90%] max-w-md h-12 bg-gray-100 text-gray-500 font-bold rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
      >
        Log out
      </button>
    </div>
  </div>
</template>

<script setup>
// 맞춤 콘텐츠 카드 클릭 시 전체 보기로 이동
const goToCustomContents = () => {
  router.push('/profile/custom-contents')
}
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useAssetDataStore } from '@/services/useAssetData'
import FooterNavigation from '@/components/FooterNavigation.vue'

// 프로필 수정 모달 컴포넌트 import (경로에 맞게 조정 필요)
import ProfileEditModal from '@/components/ProfileEditModal.vue'

const router = useRouter()
const userStore = useUserStore()
const { loadUserData } = useAssetDataStore()

// 🔥 수정: profile 구조 변경 (image -> profileImage로 변경)
const profile = ref({
  profileImage: 1, // Integer 타입으로 변경
  name: '',
  nickname: '',
  type: '',
  level: 3,
})
const riskTypeName = ref('')
const recommendedContentsByRisk = ref([])
const selectedContent = ref(null)
const nameKr = ref('')

// 프로필 수정 모달 상태
const showProfileEditModal = ref(false)

const openProfileEditModal = () => {
  showProfileEditModal.value = true
}

// 🔥 수정: 프로필 이미지 소스 가져오기 (assets 이미지 시스템)
const getProfileImageSrc = () => {
  const availableImages = [
    '/src/assets/finz.png', // 1번
    '/src/assets/FINZ_고양이.png', // 2번
    '/src/assets/FINZ_곰.png', // 3번
    '/src/assets/FINZ_병아리.png', // 4번
    '/src/assets/FINZ_원숭이.png', // 5번
    '/src/assets/FINZ_코끼리.png', // 6번
    '/src/assets/FINZ_토끼.png', // 7번
  ]

  const imageNumber = profile.value.profileImage

  // 유효한 이미지 번호인 경우
  if (typeof imageNumber === 'number' && imageNumber >= 1 && imageNumber <= 7) {
    return availableImages[imageNumber - 1]
  }

  // 기본 이미지
  return availableImages[0]
}

// 🔥 삭제: getImageStyle 함수 제거 (더 이상 필요 없음)

// 🔥 수정: 이미지 로드 에러 처리
const handleImageError = (event) => {
  event.target.src = '/src/assets/finz.png'
  profile.value.profileImage = 1 // 기본 이미지 번호로 설정
}

// 🔥 수정: ProfileEditModal에서 이미지 변경 시 반영 (Integer 처리)
const onProfileImageUpdated = (newImageNumber) => {
  profile.value.profileImage = newImageNumber || 1
  console.log('프로필 이미지 업데이트됨:', newImageNumber)
}

// ProfileEditModal에서 닉네임 변경 시 반영
const onNicknameUpdated = (newNickname) => {
  profile.value.nickname = newNickname
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

// 🔥 수정: 서버 데이터를 받아서 처리하는 함수 추가
const processProfileData = (userData) => {
  // profileImage를 Integer로 변환
  let profileImageNumber = userData.profileImage

  if (typeof profileImageNumber === 'string') {
    profileImageNumber = parseInt(profileImageNumber)
  }

  // 유효하지 않은 값이면 기본값 1로 설정
  if (!profileImageNumber || profileImageNumber < 1 || profileImageNumber > 7) {
    profileImageNumber = 1
  }

  return {
    name: userData.name || '',
    nickname: userData.nickname || '',
    type: userData.riskType || '',
    level: typeof userData.level === 'number' ? userData.level : 3,
    profileImage: profileImageNumber,
  }
}

// 🔥 수정: onMounted에서 데이터 처리 방식 변경
onMounted(async () => {
  try {
    const me = await axios.get('/api/auth/me', { withCredentials: true })

    // 🔥 수정: processProfileData 함수 사용
    profile.value = processProfileData(me.data)

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
      profile.value = {
        name: localStorage.getItem('name') || '사용자',
        nickname: localStorage.getItem('nickname') || '',
        type: localStorage.getItem('riskType') || '정보 없음',
        level: 3,
        profileImage: 1, // 기본값
      }
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
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
