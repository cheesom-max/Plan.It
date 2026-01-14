# ✈️ AI Travel Planner (Plan.It)

AI 기반 맞춤형 여행 일정 생성기 웹 서비스

🌐 **Live Demo**: [https://ai-travel-planner-ivory-nu.vercel.app](https://ai-travel-planner-ivory-nu.vercel.app)

## 🌟 프로젝트 소개

AI Travel Planner는 Google Gemini AI를 활용하여 사용자의 여행 정보를 입력받아 최적의 여행 일정을 자동으로 설계해주는 웹 서비스입니다. 전 세계 어느 도시든 검색하고, 다중 목적지 여행도 계획할 수 있습니다.

## 🎯 주요 기능

### 📍 글로벌 도시 검색
- OpenStreetMap Nominatim API 기반 전 세계 도시 검색
- 자동완성 드롭다운으로 빠른 도시 선택
- 다중 목적지 추가/삭제 지원

### 📅 여행 일정 설정
- 출발일/도착일 캘린더 선택
- 동행자 유형 선택 (혼자, 친구, 연인, 가족)
- 8가지 여행 스타일 다중 선택 (맛집, 휴양, 액티비티, 문화예술, 쇼핑, 자연, 포토, 나이트라이프)

### 🤖 AI 일정 생성
- Google Gemini 2.0 Flash 모델 활용
- 일별 상세 일정 자동 생성
- 시간대별 활동, 장소, 설명 포함
- 여행 팁 및 추천 사항 제공

### 💾 일정 저장 및 관리
- 생성된 일정 로컬 저장
- 일정 인쇄 기능
- 일정 수정 및 재생성

## 🛠️ 기술 스택

### Frontend
- HTML5, CSS3 (Glass Morphism, Animations)
- Vanilla JavaScript (ES6+)
- Responsive Design

### Backend
- Node.js + Express.js
- Vercel Serverless Functions

### APIs & Services
- Google Gemini AI API
- OpenStreetMap Nominatim API
- Vercel (Hosting & Deployment)

## 📂 파일 구조

```
ai-travel-planner/
├── index.html           # 메인 페이지 (여행 정보 입력)
├── itinerary.html       # 일정 결과 페이지
├── styles.css           # 전체 스타일시트
├── script.js            # 메인 JavaScript
├── api.js               # API 호출 모듈
├── server.js            # Express 로컬 서버
├── api/
│   ├── search-cities.js     # Vercel: 도시 검색 API
│   └── generate-itinerary.js # Vercel: 일정 생성 API
├── vercel.json          # Vercel 배포 설정
├── package.json         # Node.js 의존성
└── README.md
```

## 🚀 실행 방법

### 로컬 개발 환경

1. **저장소 클론**
```bash
git clone https://github.com/cheesom-max/ai-travel-planner.git
cd ai-travel-planner
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
GOOGLE_API_KEY=your_gemini_api_key_here
```

4. **서버 실행**
```bash
npm start
```

5. **브라우저 접속**
```
http://localhost:3001
```

### Vercel 배포

1. Vercel CLI 설치: `npm i -g vercel`
2. 배포: `vercel --prod`
3. 환경 변수 설정: Vercel Dashboard → Settings → Environment Variables

## 🔑 API 키 발급

1. [Google AI Studio](https://aistudio.google.com/)에서 Gemini API 키 발급
2. `.env` 파일 또는 Vercel 환경 변수에 `GOOGLE_API_KEY` 설정

## 📄 라이선스

MIT License

---

Made with ❤️ by AI Travel Planner Team
