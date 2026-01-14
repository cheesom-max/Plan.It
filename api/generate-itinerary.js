// API: Generate Itinerary using Gemini AI
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { destinations, startDate, endDate, companion, styles } = req.body;
        const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

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
        const prompt = `당신은 전문 여행 플래너입니다. 다음 조건에 맞는 상세한 여행 일정을 작성해주세요.

여행 정보:
- 여행지: ${destinationTexts}
- 기간: ${startDate} ~ ${endDate} (${tripDays}일)
- 동행: ${companionMap[companion] || companion}
- 여행 스타일: ${styleTexts}

다음 JSON 형식으로 응답해주세요:
{
  "title": "여행 제목",
  "summary": "여행 요약 (2-3문장)",
  "days": [
    {
      "day": 1,
      "date": "날짜",
      "location": "해당 일 주요 지역",
      "schedule": [
        {
          "time": "시간 (예: 09:00)",
          "activity": "활동 이름",
          "description": "상세 설명",
          "type": "food/activity/culture/nature/shopping/transport"
        }
      ]
    }
  ],
  "tips": ["여행 팁 1", "여행 팁 2"]
}

각 날짜별로 아침부터 저녁까지 구체적인 일정을 포함하고, 이동 시간과 식사 시간도 고려해주세요.
JSON만 반환하고 다른 설명은 포함하지 마세요.`;

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
}
