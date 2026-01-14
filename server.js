// AI Travel Planner - Express Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
        res.status(500).json({ error: 'Failed to search cities' });
    }
});

// ===== Gemini API를 통한 일정 생성 =====
app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { destinations, startDate, endDate, companion, styles } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        if (!destinations || destinations.length === 0) {
            return res.status(400).json({ error: 'Destinations are required' });
        }

        // 여행 일수 계산
        const start = new Date(startDate);
        const end = new Date(endDate);
        const tripDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // 동행자 타입 한글 변환
        const companionMap = {
            'alone': '혼자',
            'friends': '친구들과',
            'couple': '연인과',
            'family': '가족과'
        };

        // 여행 스타일 한글 변환
        const styleMap = {
            'food': '맛집 탐방',
            'relax': '휴양',
            'activity': '액티비티',
            'culture': '문화예술',
            'shopping': '쇼핑',
            'nature': '자연 탐험',
            'photo': '포토 스팟',
            'nightlife': '나이트라이프'
        };

        const styleTexts = styles.map(s => styleMap[s] || s).join(', ');
        const destinationTexts = destinations.map(d => d.name || d).join(' → ');

        // Gemini API 호출용 프롬프트
        const prompt = `
당신은 여행의 설렘과 감동을 글로 전달하는 '감성 여행 작가'이자 '전문 플래너'입니다.
주어진 정보를 바탕으로, 사용자의 마음을 움직이는 감성적이고 알찬 여행 일정을 계획해주세요.

[여행 정보]
- 여행지: ${destinationTexts}
- 기간: ${startDate} ~ ${endDate} (${tripDays}일)
- 동행: ${companionMap[companion] || companion}
- 여행 스타일: ${styleTexts}

[필수 요구사항 (Strict Rules)]
1. 반드시 total_days에 지정된 일수(${tripDays}일)만큼 전체 일정을 생성하세요. 중간에 멈추지 마세요.
2. 각 장소는 distance_from_previous 필드에 이전 장소로부터의 거리(km)와 이동시간을 반드시 포함하세요.
3. 하루 일정은 같은 지역(구/동) 내 장소들을 묶어 동선을 최적화하세요.
4. selected_categories에 있는 모든 카테고리를 전체 일정에 균등하게 배분하세요.
5. 네이버 블로그, Google Maps, 트립어드바이저 리뷰를 참고하여 평점 4.0 이상의 검증된 장소만 추천하세요.
6. 각 장소의 설명은 여행 에세이 톤으로 2문장 이상 감성적으로 작성하세요.

[출력 형식]
반드시 아래 JSON 스키마를 준수하여 응답하세요. (주석은 제외)

\`\`\`json
{
  "meta": {
    "total_days": ${tripDays},
    "destination": "${destinationTexts}",
    "travel_theme": "${styleTexts}",
    "travelers": "${companionMap[companion] || companion}",
    "selected_categories": ["맛집탐방", "휴양", "문화예술", "쇼핑", "자연탐험", "포토스팟", "나이트라이프", "액티비티"]
  },
  
  "generation_rules": {
    "must_generate_all_days": true,
    "optimize_route": true,
    "route_optimization_method": "geographic_clustering",
    "max_travel_time_between_spots": "30분",
    "include_distance_info": true,
    "search_based_recommendations": true
  },

  "title": "여행 제목 (예: 늦가을 교토, 붉게 물든 낭만 여행)",
  "summary": "여행 요약 (2-3문장)",
  
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "주요 지역",
      "day_theme": "그 날의 테마",
      "total_walking_distance": "3.2km",
      "schedule": [
        {
          "order": 1,
          "time": "14:00",
          "duration": "2시간",
          "category": "문화예술",
          "category_icon": "🏛️",
          "place": {
            "name_ko": "장소명",
            "name_en": "Place Name",
            "address": "주소"
          },
          "distance_from_previous": {
            "value": 1.2,
            "unit": "km",
            "travel_time": "도보 15분",
            "travel_method": "도보"
          },
          "travel_info": {
            "from": "이전 장소",
            "method": "이동 수단",
            "detail": "상세 이동 방법"
          },
          "description": "장소 설명 (감성적인 에세이 톤으로 작성)",
          "highlight": "핵심 포인트",
          "photo_spot": "추천 포토스팟",
          "recommended_by": "네이버 블로그 인기 후기 / 미쉐린 가이드 등",
          "rating": {
            "google": 4.5,
            "naver": 4.3
          },
          "tips": "방문 팁"
        },
        {
          "order": 2,
          "time": "17:00",
          "duration": "1시간 30분",
          "category": "맛집탐방",
          "category_icon": "🍽️",
          "meal_type": "저녁",
          "distance_from_previous": {
            "value": 0.8,
            "unit": "km",
            "travel_time": "도보 10분",
            "travel_method": "도보"
          },
          "travel_info": {
            "from": "이전 장소",
            "method": "도보",
            "detail": "상세 경로"
          },
          "options": [
            {
              "name": "식당 A",
              "rating": 4.5,
              "category_tags": ["한식", "만두전문"],
              "signature_menu": "대표 메뉴",
              "price_range": "1인 15,000-25,000원",
              "atmosphere": "분위기 설명",
              "description": "상세 설명",
              "recommended_by": "추천 출처",
              "wait_time": "예상 대기 시간",
              "reservation": "예약 방법"
            }
          ]
        }
      ]
    }
  ],
  
  "tips": [
    "여행 팁 1",
    "여행 팁 2"
  ]
}
\`\`\`
JSON 데이터만 반환하세요.
`;

        // Gemini API 호출
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                        maxOutputTokens: 4096
                    }
                })
            }
        );

        const geminiData = await geminiResponse.json();

        if (geminiData.error) {
            console.error('Gemini API error:', geminiData.error);
            return res.status(500).json({ error: geminiData.error.message });
        }

        // 응답에서 텍스트 추출
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            return res.status(500).json({ error: 'No response from AI' });
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
        res.status(500).json({ error: 'Failed to generate itinerary' });
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
