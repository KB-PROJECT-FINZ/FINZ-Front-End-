# FINZ Frontend 

이 레포지토리는 **AI 기반 금융 학습 및 모의투자 플랫폼 'FINZIE'의 프론트엔드 애플리케이션**입니다. Vue.js 3와 Vite를 기반으로 SPA 구조로 구성되며, 백엔드(Spring)와 REST API 통신을 통해 사용자 맞춤형 콘텐츠, 모의투자, 챗봇 기능을 제공합니다.

---

## 🛠 기술 스택

- **Vue.js 3 + Vite** : 고속 빌드 및 모듈 기반 UI
- **Pinia** : 글로벌 상태 관리 (로그인, 크레딧, 학습 진도 등)
- **Axios** : REST API 호출 모듈
- **Vue Router** : SPA 라우팅 구성
- **Tailwind CS**  : 반응형 UI 스타일링
- **Chart.js** : 포트폴리오 도넛차트, 수익률 추이 그래프 시각화

---

## 📁 프로젝트 구조

```
src/
├── assets/           # 이미지, 로고 등 정적 리소스
├── components/       # 공통 UI 컴포넌트
├── pages/            # 화면 단위 페이지 컴포넌트
├── router/           # 라우팅 설정
├── services/         # API 요청 모듈
├── store/            # Pinia 상태 저장소
├── utils/            # 유틸 함수, 포맷터 등
├── App.vue           # 최상위 컴포넌트
└── main.js           # 앱 초기 진입 파일
```

---

## 🚀 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 빌드 (배포용)
npm run build
```

---

## ⚙️ 환경변수 설정

`.env` 파일을 프로젝트 루트에 추가하고 다음 항목을 정의합니다:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_OPENAI_KEY=your_openai_key_here
```

> `.env`는 `.gitignore`에 포함되어야 하며 Git에 업로드하지 않습니다.

---

## 🌿 브랜치 규칙

```bash
feature/login
feature/my-page
feature/chat-bot
feature/mock-trading
bugfix/study
refactor/ranking
```

- `feature/파트/기능명`: 신규 기능 개발
- `bugfix/파트/기능명`: 버그 수정
- `refactor/파트/기능명`: 리팩토링

> 커밋 메시지, PR 제목, 머지 규칙 등은 [팀 Git 가이드](../backend/README.md) 또는 Notion 참고

---

## 🤝 협업 가이드

- Git Flow 브랜치 전략 준수
- 커밋 메시지는 `type: message #이슈번호` 형식
- PR 생성 후 리뷰어 지정 및 확인 요청
- 공통 API는 `services/`, 상태관리는 `store/`에 작성
- 라우팅은 `router/index.js`에 등록

---


## 📄 라이선스

본 레포지토리는 FINZIE 팀 프로젝트의 프론트엔드 전용 저장소이며, 외부 라이선스를 포함하지 않습니다.

---
