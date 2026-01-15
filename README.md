# Plan.It - AI 맞춤형 여행 일정 생성기

AI와 함께 만드는 나만의 감성 여행 일정

🌐 **Live Demo**: [https://ai-travel-planner-ivory-nu.vercel.app](https://ai-travel-planner-ivory-nu.vercel.app)

## 프로젝트 소개

Plan.It은 Google **Gemini 2.0 Flash** 모델과 **Supabase**를 결합한 차세대 여행 플래너입니다.
사용자의 취향(동행, 스타일, 예산)을 분석하여 최적화된 동선과 맞춤형 추천을 제안합니다.

## 주요 기능

### AI 일정 생성 (Gemini 2.0)
- 감성적인 장소 묘사와 에세이 톤의 설명
- 이동 거리(km) 및 소요 시간 자동 계산
- 네이버/구글 평점 4.0+ 검증된 맛집 & 명소 추천

### 사용자 인증 & 프로필
- Google 소셜 로그인 지원
- 여행 스타일, 선호 동행, 예산 수준 저장
- Supabase 기반 안전한 데이터 관리

### 슬라이드 아웃 메뉴 (Triple 스타일)
- 로그인 상태에 따른 메뉴 자동 전환
- 비로그인: AI 일정 만들기, 여행 견적, 설정
- 로그인: 내 여행, 내 정보, 로그아웃 추가

### 영구적인 데이터 저장
- 생성된 여행 일정 PostgreSQL DB 저장
- PC/모바일 어디서나 접근 가능
- 여행 목록 로드 및 상세 일정 보기

## 기술 스택

| 영역 | 기술 |
|-----|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js (Vercel Serverless Functions) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| AI | Google Gemini 2.0 Flash API |
| Auth | Supabase Auth (Email + Google OAuth) |
| API | OpenStreetMap Nominatim (도시 검색) |

## 프로젝트 구조

```
ai-travel-planner/
├── index.html           # 메인 페이지
├── itinerary.html       # 일정 상세 결과
├── profile.html         # 프로필 설정
├── styles.css           # 통합 스타일시트
├── script.js            # 메인 로직
├── auth.js              # Supabase 인증
├── supabase.js          # Supabase 클라이언트
├── api.js               # API 클라이언트
├── profile.js           # 프로필 로직
├── database/
│   └── schema.sql       # DB 스키마
├── api/                 # Serverless Functions
│   ├── search-cities.js
│   └── generate-itinerary.js
├── images/
│   └── hero-bg.png      # 히어로 배경
└── vercel.json          # 배포 설정
```

## 시작하기

### 1. 환경 변수 (.env)

```env
GOOGLE_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 데이터베이스 설정

Supabase SQL Editor에서 `database/schema.sql` 실행

### 3. 설치 및 실행

```bash
git clone https://github.com/cheesom-max/ai-travel-planner.git
cd ai-travel-planner
npm install
npm start
```

## 최근 업데이트 (2026-01-15)

- 파리 거리 배경 이미지 적용
- 이모지 제거 및 전문적인 UI 디자인
- 슬라이드 아웃 메뉴 개선 (로그인 상태별 메뉴)
- 여행 견적내기, 설정 메뉴 추가
- 색상 팔레트 및 그라데이션 최적화

## 라이선스

MIT License

---

Made with ❤️ by **Cheesom Max**
