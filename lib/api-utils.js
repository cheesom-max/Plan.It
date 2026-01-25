// API Utilities for AI Travel Planner
// 공통 CORS 설정 및 에러 핸들링

// 허용된 도메인 목록
const ALLOWED_ORIGINS = [
    'https://ai-travel-planner-ivory-nu.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000'
];

/**
 * CORS 헤더 설정
 * @param {object} req - HTTP 요청 객체
 * @param {object} res - HTTP 응답 객체
 * @returns {boolean} - preflight 요청인 경우 true
 */
export function setCorsHeaders(req, res) {
    const origin = req.headers.origin;

    // 허용된 도메인이거나 개발 환경인 경우 허용
    if (origin && (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Same-origin 요청은 허용
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24시간 캐시

    // Preflight 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}

/**
 * 성공 응답 형식
 * @param {any} data - 응답 데이터
 * @returns {object} - 표준화된 응답 객체
 */
export function successResponse(data) {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };
}

/**
 * 에러 응답 형식
 * @param {string} code - 에러 코드
 * @param {string} message - 사용자 친화적 메시지
 * @param {object} details - 개발용 상세 정보 (선택)
 * @returns {object} - 표준화된 에러 객체
 */
export function errorResponse(code, message, details = null) {
    const response = {
        success: false,
        error: {
            code,
            message
        },
        timestamp: new Date().toISOString()
    };

    // 개발 환경에서만 상세 정보 포함
    if (details && process.env.NODE_ENV === 'development') {
        response.error.details = details;
    }

    return response;
}

/**
 * 에러 코드 상수
 */
export const ErrorCodes = {
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_API_KEY: 'MISSING_API_KEY',
    API_ERROR: 'API_ERROR',
    PARSE_ERROR: 'PARSE_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
    INVALID_WEBHOOK: 'INVALID_WEBHOOK'
};
