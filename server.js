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
1. **감성적인 장소 묘사 (핵심)**: 
   - 각 여행지의 설명(\`description\`)은 단순한 정보 전달을 넘어, 그곳의 **분위기, 색감, 소리, 공기** 등 오감을 자극하는 표현을 사용하세요.
   - 사용자가 그곳에 있는 상상을 할 수 있도록 **여행 에세이 톤**으로 작성하세요.
   - **반드시 2문장 이상**으로 구체적이고 길게 작성해야 합니다.
2. **계절성 반영**: 여행 기간(${startDate}월)의 날씨와 계절적 풍경(꽃, 단풍, 눈, 햇살 등)을 묘사에 적극적으로 녹여내세요.
3. **동선 최적화**: 지리적으로 가까운 곳끼리 묶어 이동 시간을 최소화하고, 이동 방법과 시간을 구체적으로 명시하세요.
4. **맛집 추천 (3 options)**: 
   - 식사 일정에는 구글 맵 평점 4.0 이상으로 추정되는 맛집 **3곳**을 제안하세요.
   - 맛집의 특징(\`features\`) 또한 "맛있다"는 표현보다는 "입안 가득 퍼지는 육즙", "현지인들의 웃음소리가 들리는" 등 감각적으로 묘사하세요.

[출력 형식]
반드시 아래 JSON 형식으로만 응답하세요. (주석은 제외)

{
  "title": "여행 제목 (예: 늦가을 교토, 붉게 물든 낭만 여행)",
  "summary": "여행 요약 (여행의 전체적인 무드와 컨셉을 2-3문장으로 요약)",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "주요 지역",
      "schedule": [
        {
          "time": "09:00",
          "type": "activity",
          "place": "장소명 (한글/영문 병기)",
          "description": "이곳은 단순한 공원이 아닙니다. 아침 이슬이 맺힌 풀내음을 맡으며 산책하다 보면 복잡했던 머릿속이 맑아지는 것을 느낄 수 있습니다. 특히 호수에 비친 윤슬을 배경으로 연인과 함께 인생 사진을 남기기에 가장 완벽한 장소입니다.", 
          "travel_info": "호텔에서 도보 10분 산책"
        },
        {
          "time": "12:00",
          "type": "food",
          "meal_type": "점심",
          "travel_info": "공원 후문에서 도보 5분",
          "options": [
            {
              "name": "식당 A",
              "rating_expect": "4.5",
              "features": "오래된 목조 건물의 따뜻한 조명 아래서 즐기는 정통 가정식",
              "menu": "시그니처 메뉴"
            },
            {
              "name": "식당 B",
              "rating_expect": "4.3",
              "features": "통유리창 너머로 탁 트인 도시 뷰가 펼쳐지는 힙한 공간",
              "menu": "추천 메뉴"
            },
            {
              "name": "식당 C",
              "rating_expect": "4.7",
              "features": "현지 셰프의 장인정신이 느껴지는 오픈 키친 스타일",
              "menu": "추천 메뉴"
            }
          ]
        }
      ]
    }
  ],
  "tips": ["감성적인 팁 1", "실용적인 팁 2"]
}
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
