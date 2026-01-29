// Prompt Templates for AI Travel Planner (CommonJS version for server.js)
// This is the CommonJS version for local Express server
// ⚠️ prompts.js (ES Modules)와 동일한 내용을 유지해야 합니다.

/**
 * 동행자 타입 한글 변환 맵
 */
const companionMap = {
  'alone': '혼자',
  'friends': '친구들과',
  'couple': '연인과',
  'family': '가족과'
};

/**
 * 여행 스타일 한글 변환 맵
 */
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

/**
 * 일정 생성 프롬프트 생성
 * @param {object} params - 프롬프트 파라미터
 * @param {string} params.destinationTexts - 여행지 텍스트 (예: "파리 → 런던")
 * @param {string} params.startDate - 시작 날짜
 * @param {string} params.endDate - 종료 날짜
 * @param {number} params.tripDays - 여행 일수
 * @param {string} params.companion - 동행자 타입
 * @param {string} params.styleTexts - 여행 스타일 텍스트
 * @returns {string} - 생성된 프롬프트
 */
function generateItineraryPrompt({
  destinationTexts,
  startDate,
  endDate,
  tripDays,
  companion,
  styleTexts
}) {
  const companionText = companionMap[companion] || companion;

  return `당신은 여행 플래너입니다. 감성적이고 실용적인 여행 일정을 JSON으로 작성하세요.

[여행 정보]
- 여행지: ${destinationTexts}
- 기간: ${startDate} ~ ${endDate} (${tripDays}일)
- 동행: ${companionText}
- 스타일: ${styleTexts}

[규칙]
1. 정확히 ${tripDays}일 일정 생성
2. 하루 4-5개 장소 (식사 포함)
3. description은 2문장으로 감성적 작성
4. 순수 JSON만 반환 (마크다운 금지)

[JSON 형식]
{
  "meta": {
    "total_days": ${tripDays},
    "destination": "${destinationTexts}",
    "travel_theme": "${styleTexts}",
    "travelers": "${companionText}"
  },
  "title": "여행 제목",
  "summary": "2문장 요약",
  "estimated_daily_budget": {
    "currency": "KRW",
    "amount": 150000,
    "description": "1인 1일 예상 비용"
  },
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "location": "지역명",
      "day_theme": "테마",
      "schedule": [
        {
          "order": 1,
          "time": "09:00",
          "duration": "1시간",
          "category": "카테고리",
          "place": {
            "name_ko": "장소명",
            "name_en": "Place Name",
            "address": "주소"
          },
          "description": "감성적 설명 2문장",
          "tips": "팁"
        }
      ]
    }
  ],
  "tips": ["팁1", "팁2"]
}

JSON만 반환:`;
}

/**
 * 스타일 배열을 텍스트로 변환
 */
function stylesToText(styles) {
  return styles.map(s => styleMap[s] || s).join(', ');
}

/**
 * 여행지 배열을 텍스트로 변환
 */
function destinationsToText(destinations) {
  return destinations.map(d => d.name || d).join(' → ');
}

module.exports = {
  companionMap,
  styleMap,
  generateItineraryPrompt,
  stylesToText,
  destinationsToText
};
