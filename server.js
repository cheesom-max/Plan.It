// AI Travel Planner - Express Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { generateItineraryPrompt, stylesToText, destinationsToText } = require('./lib/prompts.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

// Google GenAI 클라이언트 초기화
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// CORS 설정 (보안 강화)
// 환경 변수 ALLOWED_ORIGIN으로 추가 도메인 설정 가능
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN || 'https://ai-travel-planner-ivory-nu.vercel.app',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경 또는 허용된 origin만 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
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

    // Google GenAI SDK를 통한 API 호출
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 65536,
        thinkingConfig: {
          thinkingBudget: 0  // thinking 비활성화로 빠른 응답
        }
      }
    });

    const responseText = response.text;

    if (!responseText) {
      return res.status(500).json(errorResponse('API_ERROR', 'AI 응답이 없습니다.'));
    }

    // Improved JSON extraction: handle markdown fences and use balanced braces
    let itinerary;
    try {
      // Strip any markdown code fences (``` or ```json) and surrounding whitespace
      let clean = responseText.trim();
      clean = clean.replace(/```(?:json)?\s*\n?/gi, '').replace(/\n?```\s*$/gi, '');

      // Find the first opening brace and locate the matching closing brace
      const startIdx = clean.indexOf('{');
      if (startIdx === -1) throw new Error('No opening brace found in AI response');
      let depth = 0;
      let endIdx = -1;
      for (let i = startIdx; i < clean.length; i++) {
        if (clean[i] === '{') depth++;
        else if (clean[i] === '}') depth--;
        if (depth === 0) { endIdx = i + 1; break; }
      }
      if (endIdx === -1) throw new Error('No matching closing brace found');
      const jsonStr = clean.slice(startIdx, endIdx);
      itinerary = JSON.parse(jsonStr);
      console.log('✅ Successfully parsed itinerary JSON (balanced braces)');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Raw response preview:', responseText.substring(0, 500));

      // Return error response instead of raw text
      return res.status(500).json({
        error: 'PARSE_ERROR',
        message: 'AI 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
        debugInfo: process.env.NODE_ENV === 'development' ? responseText.substring(0, 200) : undefined
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
