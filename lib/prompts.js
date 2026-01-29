// Prompt Templates for AI Travel Planner
// server.js와 api/generate-itinerary.js에서 공유되는 프롬프트

/**
 * 동행자 타입 한글 변환 맵
 */
export const companionMap = {
  'alone': '혼자',
  'friends': '친구들과',
  'couple': '연인과',
  'family': '가족과'
};

/**
 * 여행 스타일 한글 변환 맵
 */
export const styleMap = {
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
 * @param {string} params.departure - 출발지 (예: "서울")
 * @param {string} params.destinationTexts - 여행지 텍스트 (예: "파리 → 런던")
 * @param {string} params.startDate - 시작 날짜
 * @param {string} params.endDate - 종료 날짜
 * @param {string} params.arrivalTime - 첫날 도착 예정 시간 (예: "10:00")
 * @param {string} params.departureTime - 마지막날 출발 예정 시간 (예: "18:00")
 * @param {number} params.tripDays - 여행 일수
 * @param {string} params.companion - 동행자 타입
 * @param {string} params.styleTexts - 여행 스타일 텍스트
 * @returns {string} - 생성된 프롬프트
 */
export function generateItineraryPrompt({
  departure,
  destinationTexts,
  startDate,
  endDate,
  arrivalTime,
  departureTime,
  tripDays,
  companion,
  styleTexts
}) {
  const companionText = companionMap[companion] || companion;

  return `당신은 여행 플래너입니다. 감성적이고 실용적인 여행 일정을 JSON으로 작성하세요.

[여행 정보]
- 출발지: ${departure}
- 여행지: ${destinationTexts}
- 기간: ${startDate} ~ ${endDate} (${tripDays}일)
- 첫날 도착 예정: ${arrivalTime} (이 시간부터 여행 시작)
- 마지막날 출발 예정: ${departureTime} (이 시간 전에 공항/역 도착 필요)
- 동행: ${companionText}
- 스타일: ${styleTexts}

[규칙]
1. 정확히 ${tripDays}일 일정 생성
2. 하루 4-5개 장소 (식사 포함)
3. description은 2문장으로 감성적 작성
4. 순수 JSON만 반환 (마크다운 금지)
5. 각 장소의 위도(lat)와 경도(lng) 좌표를 반드시 포함

[시간 최적화 - 매우 중요]
- 첫날: ${arrivalTime}에 도착하므로 그 이후 시간부터 일정 시작
- 마지막날: ${departureTime}에 출발하므로 최소 1-2시간 전에 공항/역 근처에서 일정 마무리
- 이동 시간 고려: 공항에서 시내까지, 시내에서 공항까지 이동 시간 반영

[동선 최적화 - 매우 중요]
- 공항/역 위치 기준: 첫날은 도착지(공항/기차역) 근처에서 시작, 마지막 날은 출발지 근처에서 마무리
- 지역별 일정 구성: 하루는 한 지역/구역에서만 활동 (예: 제주 북부 → 제주 동부 → 제주 남부 → 제주 서부)
- 하루 내 이동거리: 같은 날 장소들은 도보 또는 차로 15분 이내 거리에 위치
- 날짜 간 이동: 전날 마지막 장소와 다음날 첫 장소가 가깝도록 구성
- 효율적 경로: 지도상 시계방향 또는 반시계방향으로 자연스럽게 이동
- 예시(제주도 3일): 1일차-제주시/공항 근처, 2일차-동부 또는 서부, 3일차-남부 후 공항 방향으로 복귀

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
            "address": "주소",
            "lat": 37.5665,
            "lng": 126.9780
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
 * @param {string[]} styles - 스타일 코드 배열
 * @returns {string} - 쉼표로 구분된 스타일 텍스트
 */
export function stylesToText(styles) {
  return styles.map(s => styleMap[s] || s).join(', ');
}

/**
 * 여행지 배열을 텍스트로 변환
 * @param {object[]} destinations - 여행지 객체 배열
 * @returns {string} - 화살표로 구분된 여행지 텍스트
 */
export function destinationsToText(destinations) {
  return destinations.map(d => d.name || d).join(' → ');
}
