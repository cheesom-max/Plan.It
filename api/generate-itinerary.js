// API: Generate Itinerary using Gemini AI
import { setCorsHeaders, errorResponse, ErrorCodes } from '../lib/api-utils.js';
import { generateItineraryPrompt, stylesToText, destinationsToText } from '../lib/prompts.js';

export default async function handler(req, res) {
  // CORS 처리 (preflight면 조기 반환)
  if (setCorsHeaders(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json(
      errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'POST 요청만 허용됩니다.')
    );
  }

  try {
    const { destinations, startDate, endDate, companion, styles } = req.body;
    const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json(
        errorResponse(ErrorCodes.MISSING_API_KEY, 'API 키가 설정되지 않았습니다.')
      );
    }

    if (!destinations || destinations.length === 0) {
      return res.status(400).json(
        errorResponse(ErrorCodes.INVALID_INPUT, '여행지를 선택해주세요.')
      );
    }

    if (!startDate || !endDate) {
      return res.status(400).json(
        errorResponse(ErrorCodes.INVALID_INPUT, '여행 날짜를 선택해주세요.')
      );
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
            maxOutputTokens: 8192
          }
        })
      }
    );

    const geminiData = await geminiResponse.json();

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error);
      return res.status(500).json(
        errorResponse(ErrorCodes.API_ERROR, 'AI 서비스 오류가 발생했습니다.', geminiData.error)
      );
    }

    // 응답에서 텍스트 추출
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json(
        errorResponse(ErrorCodes.API_ERROR, 'AI 응답이 없습니다.')
      );
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
    res.status(500).json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '일정 생성에 실패했습니다. 다시 시도해주세요.')
    );
  }
}
