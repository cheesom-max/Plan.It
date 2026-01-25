// API: 크레딧 조회 및 관리
import { setCorsHeaders, successResponse, errorResponse, ErrorCodes } from '../lib/api-utils.js';
import { getUserCredits, getCreditTransactions, getCreditPackages, getUserIdFromAuth } from '../lib/supabase-admin.js';

export default async function handler(req, res) {
    // CORS 처리
    if (setCorsHeaders(req, res)) {
        return;
    }

    // GET 요청만 허용
    if (req.method !== 'GET') {
        return res.status(405).json(
            errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'GET 요청만 허용됩니다.')
        );
    }

    try {
        const { action } = req.query;

        // 패키지 목록 조회 (인증 불필요)
        if (action === 'packages') {
            const packages = await getCreditPackages();
            return res.json(successResponse({ packages }));
        }

        // 인증 확인
        const userId = await getUserIdFromAuth(req.headers.authorization);

        if (!userId) {
            return res.status(401).json(
                errorResponse(ErrorCodes.UNAUTHORIZED, '로그인이 필요합니다.')
            );
        }

        // 잔액 조회
        if (action === 'balance' || !action) {
            const credits = await getUserCredits(userId);

            if (!credits) {
                // 크레딧 정보가 없으면 기본값 반환
                return res.json(successResponse({
                    balance: 0,
                    total_purchased: 0,
                    total_used: 0
                }));
            }

            return res.json(successResponse(credits));
        }

        // 거래 내역 조회
        if (action === 'transactions') {
            const limit = parseInt(req.query.limit) || 20;
            const transactions = await getCreditTransactions(userId, limit);
            return res.json(successResponse({ transactions }));
        }

        return res.status(400).json(
            errorResponse(ErrorCodes.INVALID_INPUT, '올바르지 않은 action입니다.')
        );

    } catch (error) {
        console.error('Credits API error:', error);
        return res.status(500).json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, '크레딧 정보를 불러올 수 없습니다.')
        );
    }
}
