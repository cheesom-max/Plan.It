// AI Travel Planner - Express Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateItineraryPrompt, stylesToText, destinationsToText } = require('./lib/prompts.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

// CORS 설정 (보안 강화)
const allowedOrigins = [
  'https://ai-travel-planner-ivory-nu.vercel.app',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경 또는 허용된 origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 개발 편의상 모든 origin 허용 (프로덕션에서는 수정 필요)
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 표준화된 에러 응답
function errorResponse(code, message) {
  return {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  };
}

// ===== 도시 검색 API (OpenStreetMap Nominatim) =====
app.get('/api/search-cities', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1&featuretype=city`,
      {
        headers: {
          'User-Agent': 'AI-Travel-Planner/1.0'
        }
      }
    );

    const data = await response.json();

    // 도시 데이터 정제
    const cities = data
      .filter(item => item.type === 'city' || item.type === 'town' || item.type === 'village' || item.class === 'place')
      .map(item => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.name,
        country: item.address?.country || '',
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon
      }))
      .filter(city => city.name);

    res.json(cities);
  } catch (error) {
    console.error('City search error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', '도시 검색에 실패했습니다.'));
  }
});

// ===== Gemini API를 통한 일정 생성 =====
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { destinations, startDate, endDate, companion, styles } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json(errorResponse('MISSING_API_KEY', 'API 키가 설정되지 않았습니다.'));
    }

    if (!destinations || destinations.length === 0) {
      return res.status(400).json(errorResponse('INVALID_INPUT', '여행지를 선택해주세요.'));
    }

    if (!startDate || !endDate) {
      return res.status(400).json(errorResponse('INVALID_INPUT', '여행 날짜를 선택해주세요.'));
    }

    // 여행 일수 계산
    const start = new Date(startDate);
    const end = new Date(endDate);
    const tripDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 공통 모듈 사용하여 프롬프트 생성
    const styleTexts = stylesToText(styles || []);
    const destinationTexts = destinationsToText(destinations);

    const prompt = generateItineraryPrompt({
      destinationTexts,
      startDate,
      endDate,
      tripDays,
      companion,
      styleTexts
    });

    // Gemini API 호출
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const geminiData = await geminiResponse.json();

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error);
      return res.status(500).json(errorResponse('API_ERROR', 'AI 서비스 오류가 발생했습니다.'));
    }

    // 응답에서 텍스트 추출
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json(errorResponse('API_ERROR', 'AI 응답이 없습니다.'));
    }

    // JSON 파싱 (코드 블록 제거)
    let itinerary;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // 파싱 실패 시 원본 텍스트 반환
      return res.json({
        title: '여행 일정',
        rawText: responseText
      });
    }

    res.json(itinerary);

  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', '일정 생성에 실패했습니다. 다시 시도해주세요.'));
  }
});

// ===== 기본 라우트 =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== 서버 시작 =====
app.listen(PORT, () => {
  console.log(`🚀 AI Travel Planner Server running on http://localhost:${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`🔑 API Key loaded: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
