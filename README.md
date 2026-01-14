# ✈️ AI Travel Planner (Plan.It)

AI와 함께 만드는 나만의 감성 여행 일정, **Plan.It**

🌐 **Live Demo**: [https://ai-travel-planner-ivory-nu.vercel.app](https://ai-travel-planner-ivory-nu.vercel.app)

## 🌟 프로젝트 소개

Plan.It은 구글 **Gemini 2.0 Flash** 모델의 강력한 성능과 **Supabase**의 안전한 데이터 관리를 결합한 차세대 여행 플래너입니다.
단순한 장소 나열을 넘어, 사용자의 취향(동행, 스타일, 예산)을 분석하여 에세이처럼 감성적인 설명과 최적화된 동선(거리, 시간 포함)을 제안합니다.

## 🎯 주요 기능

### 1. 🤖 AI 일정 생성 (Powered by Gemini 2.0)
- **감성적인 장소 묘사**: 단순 정보 전달이 아닌, 여행의 설렘을 자극하는 에세이 톤의 장소 설명
- **정교한 동선 설계**: 각 장소 간 **이동 거리(km)**와 **소요 시간** 자동 계산 및 동선 최적화
- **맛집 & 명소 추천**: 네이버/구글 평점 4.0 이상의 검증된 장소 추천 (옵션 3개 제공)
- **다양한 테마**: 휴양, 액티비티, 문화예술, 맛집탐방, 쇼핑 등 균형 잡힌 일정 분배

### 2. 👤 사용자 프로필 & 취향 분석
- **프로필 관리**: 닉네임, 가입일 관리 및 **Google 소셜 로그인** 지원
- **취향 맞춤**: 여행 스타일(8종), 선호 동행(가족, 연인 등), 예산 수준을 DB에 저장하여 매 검색마다 반영

### 3. 💾 영구적인 데이터 저장 (Supabase)
- **클라우드 동기화**: 생성된 여행 일정은 로그인된 계정의 **DB(PostgreSQL)**에 자동 저장
- **상세 일정 보존**: 여행지, 날짜, 시간, 메모, 이동 경로 등 모든 상세 정보가 안전하게 보관됨
- **어디서나 접근**: PC/모바일 어디서든 내 여행 일정을 불러올 수 있음

### 4. 📍 글로벌 검색 & 편의성
- **전 세계 도시 지원**: OpenStreetMap 기반 글로벌 장소 검색
- **직관적인 UI**: Glassmorphism 디자인이 적용된 깔끔하고 모던한 인터페이스
- **공유하기**: 생성된 일정을 링크로 손쉽게 공유

## 🛠️ 기술 스택

### Frontend
- **HTML5 / CSS3**: 모던 웹 디자인 (Flexbox/Grid, Animations)
- **JavaScript (Vanilla)**: ES6+ 비동기 처리, DOM 조작
- **UI/UX**: 반응형 디자인 (Mobile First), Toast 알림 구현

### Backend & Database
- **Node.js (Serverless)**: Vercel Functions 기반 API 라우팅
- **Supabase**:
  - **Auth**: 이메일/비밀번호 및 Google OAuth 로그인
  - **Database**: PostgreSQL (Row Level Security 적용)
- **Google Gemini API**: 고성능 LLM을 통한 창의적 일정 생성

## 📂 프로젝트 구조

```text
ai-travel-planner/
├── index.html           # 메인 페이지 (여행 입력 & 프로필)
├── itinerary.html       # 일정 상세 결과 페이지 (생성/저장/공유)
├── profile.html         # 프로필 설정 페이지
├── styles.css           # 통합 스타일시트
├── script.js            # 메인 로직 및 인증 UI 처리
├── profile.js           # 프로필 데이터 관리 로직
├── auth.js              # Supabase 인증 모듈
├── supabase.js          # Supabase 클라이언트 초기화
├── database/
│   └── schema.sql       # PostgreSQL 데이터베이스 스키마
├── api/                 # Vercel Serverless Functions
│   ├── search-cities.js
│   └── generate-itinerary.js
├── vercel.json          # 배포 설정
└── README.md            # 프로젝트 문서
```

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정 (.env)
프로젝트 루트에 `.env` 파일을 생성하고 다음 키를 입력하세요.

```env
# Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 데이터베이스 설정
Supabase 대시보드 SQL Editor에서 `database/schema.sql`의 내용을 실행하여 테이블을 생성합니다.
(Users, Profiles, Trips, Trip_Days, Trip_Items 테이블 생성)

### 3. 설치 및 실행

```bash
# 저장소 복제
git clone https://github.com/cheesom-max/ai-travel-planner.git

# 이동
cd ai-travel-planner

# 패키지 설치
npm install

# 로컬 서버 실행 (Frontend + Backend Proxy)
npm start
```

## 📄 라이선스
MIT License

---
Made with ❤️ by **Cheesom Max**
