// API: Generate Itinerary using Gemini AI
import { setCorsHeaders, errorResponse, ErrorCodes } from '../lib/api-utils.js';
import { generateItineraryPrompt, stylesToText, destinationsToText } from '../lib/prompts.js';
import { getUserIdFromAuth, useCredits } from '../lib/supabase-admin.js';

// 여행 계획 1회 생성에 필요한 크레딧
const CREDITS_PER_GENERATION = 1;

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

    // ========================================
    // 입력 검증 (크레딧 차감 전에 먼저 수행)
    // ========================================
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

    // ========================================
    // 크레딧 시스템: 인증 및 크레딧 선차감
    // Race Condition 방지: 잔액 확인과 차감을 원자적으로 처리
    // ========================================
    const userId = await getUserIdFromAuth(req.headers.authorization);

    if (!userId) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED, '로그인이 필요합니다.')
      );
    }

    // 크레딧 선차감 (use_credits 함수 내에서 잔액 확인 + 차감이 원자적으로 처리됨)
    const creditResult = await useCredits(
      userId,
      CREDITS_PER_GENERATION,
      `여행 계획 생성: ${destinations[0]?.name || '여행'}`,
      null
    );

    if (!creditResult.success) {
      // 잔액 부족 또는 차감 실패
      const currentBalance = creditResult.newBalance || 0;
      return res.status(402).json(
        errorResponse(
          ErrorCodes.INSUFFICIENT_CREDITS,
          `크레딧이 부족합니다. 현재 잔액: ${currentBalance} 크레딧`,
          { balance: currentBalance, required: CREDITS_PER_GENERATION }
        )
      );
    }

    console.log(`💳 크레딧 선차감: -${CREDITS_PER_GENERATION}, 새 잔액: ${creditResult.newBalance}`);

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

    // Gemini API 호출 (REST API) - API 키를 헤더로 전달 (URL 노출 방지)
    // AbortController로 타임아웃 설정 (Vercel Free tier 10초 제한 대응)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55초 타임아웃

    let geminiResponse;
    try {
      geminiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 16384
            }
          }),
          signal: controller.signal
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json(
          errorResponse(ErrorCodes.API_ERROR, 'AI 응답 시간이 초과되었습니다. 더 짧은 여행 기간으로 다시 시도해주세요.')
        );
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    const geminiData = await geminiResponse.json();

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error);
      return res.status(500).json(
        errorResponse(ErrorCodes.API_ERROR, geminiData.error.message || 'AI 서비스 오류가 발생했습니다.')
      );
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json(
        errorResponse(ErrorCodes.API_ERROR, 'AI 응답이 없습니다.')
      );
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

      // 응답에 크레딧 정보 포함 (이미 선차감됨)
      itinerary._credits = {
        used: CREDITS_PER_GENERATION,
        remaining: creditResult.newBalance
      };

    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Raw response preview:', responseText.substring(0, 500));

      // Return error response instead of raw text
      return res.status(500).json(
        errorResponse(ErrorCodes.PARSE_ERROR, 'AI 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
      );
    }

    res.json(itinerary);

  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '일정 생성에 실패했습니다. 다시 시도해주세요.')
    );
  }
}
