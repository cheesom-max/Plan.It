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
 * @param {string} params.destinationTexts - 여행지 텍스트 (예: "파리 → 런던")
 * @param {string} params.startDate - 시작 날짜
 * @param {string} params.endDate - 종료 날짜
 * @param {number} params.tripDays - 여행 일수
 * @param {string} params.companion - 동행자 타입
 * @param {string} params.styleTexts - 여행 스타일 텍스트
 * @returns {string} - 생성된 프롬프트
 */
export function generateItineraryPrompt({
  destinationTexts,
  startDate,
  endDate,
  tripDays,
  companion,
  styleTexts
}) {
  const companionText = companionMap[companion] || companion;

  return `당신은 세계적인 여행 매거진의 수석 에디터이자 감성 여행 작가입니다.
단순한 일정이 아니라, 읽는 것만으로도 여행의 설렘이 느껴지는 "하나의 여행 에세이" 같은 완벽한 플랜을 작성해야 합니다.

[작성 원칙 및 톤앤매너]
1. **감성적 스토리텔링 필수 (중요)**
   - 단순한 정보 나열(예: "유명한 식당입니다")을 절대 금지합니다.
   - 예시: "오래된 목조 건물의 문을 여는 순간, 고소한 버터 향기가 코끝을 감쌉니다. 창가 자리에 앉아 갓 구운 크루아상과 진한 커피 한 잔의 여유를 즐겨보세요."
2. **구체적이고 실용적인 팁 제공**
   - "일찍 가세요" 대신 "오전 9시 이전에 도착해야 인생샷을 건질 수 있습니다"처럼 구체적으로 작성하세요.
3. **흐름이 있는 동선**
   - 장소와 장소 사이의 연결성을 고려하여 자연스러운 흐름을 만드세요.

[여행 정보]
- 여행지: ${destinationTexts}
- 기간: ${startDate} ~ ${endDate} (${tripDays}일)
- 동행: ${companionText}
- 여행 스타일: ${styleTexts}

[필수 요구사항 (Strict Rules)]
1. 반드시 total_days에 지정된 일수(${tripDays}일)만큼 전체 일정 데이터를 빈틈없이 생성하세요.
2. 각 장소(place)의 description 필드는 최소 3문장 이상 풍부하게 작성하세요. (오감을 자극하는 표현 사용)
3. distance_from_previous 필드에 이동 시간과 거리를 정확히 명시하세요.
4. 아침-점심-저녁 식사 장소를 반드시 포함하고, 각 식당의 대표 메뉴를 구체적으로 추천하세요.
5. selected_categories의 테마가 일정 전체에 골고루 반영되어야 합니다.
6. **JSON 형식이 아닌 텍스트(마크다운 코드 블록 등)를 절대 포함하지 마세요. 순수 JSON 문자열만 반환하세요.**

[출력 형식]
반드시 아래 JSON 스키마를 준수하여 응답하세요. (주석은 제외)


{
  "meta": {
    "total_days": ${tripDays},
    "destination": "${destinationTexts}",
    "travel_theme": "${styleTexts}",
    "travelers": "${companionText}",
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
  "estimated_daily_budget": {
    "currency": "KRW",
    "amount": 150000,
    "description": "1인 1일 예상 비용 (식비, 입장료, 교통비 포함)"
  },

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
          "description": "이 식사 시간에 대한 전반적인 설명 (감성적인 에세이 톤으로 작성)",
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

JSON 데이터만 반환하세요.`;
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
