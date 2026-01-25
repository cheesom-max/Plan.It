// API: 래피드(Latpeed) 결제 웹훅
// 결제 완료 시 자동으로 크레딧 충전

import { errorResponse, ErrorCodes } from '../../lib/api-utils.js';
import { addCredits, getSupabaseAdmin } from '../../lib/supabase-admin.js';
import crypto from 'crypto';

// 래피드 웹훅 검증 (필요시 시크릿 키로 서명 검증)
function verifyWebhookSignature(payload, signature, secret) {
    if (!secret) {
        // 시크릿이 설정되지 않으면 검증 스킵 (개발용)
        console.warn('⚠️ LATPEED_WEBHOOK_SECRET이 설정되지 않았습니다.');
        return true;
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

    return signature === expectedSignature;
}

export default async function handler(req, res) {
    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json(
            errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'POST 요청만 허용됩니다.')
        );
    }

    try {
        const payload = req.body;
        const signature = req.headers['x-latpeed-signature'] || req.headers['x-webhook-signature'];

        console.log('📥 래피드 웹훅 수신:', JSON.stringify(payload, null, 2));

        // 웹훅 서명 검증
        const webhookSecret = process.env.LATPEED_WEBHOOK_SECRET;
        if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
            console.error('❌ 웹훅 서명 검증 실패');
            return res.status(401).json(
                errorResponse(ErrorCodes.INVALID_WEBHOOK, '웹훅 서명이 올바르지 않습니다.')
            );
        }

        // 래피드 웹훅 페이로드 구조 (예상)
        // 실제 래피드 문서에 따라 수정 필요
        const {
            event,           // 이벤트 타입 (payment.completed 등)
            order_id,        // 주문 ID
            product_id,      // 상품 ID
            buyer_email,     // 구매자 이메일
            buyer_id,        // 구매자 ID (사용자 지정 필드)
            amount,          // 결제 금액
            product_name,    // 상품명
            custom_fields    // 커스텀 필드 (user_id 포함)
        } = payload;

        // 결제 완료 이벤트만 처리
        if (event !== 'payment.completed' && event !== 'order.completed') {
            console.log(`ℹ️ 처리하지 않는 이벤트: ${event}`);
            return res.status(200).json({ success: true, message: '이벤트 무시됨' });
        }

        // 사용자 ID 추출 (custom_fields에서 또는 buyer_email로 조회)
        let userId = custom_fields?.user_id || buyer_id;

        // user_id가 없으면 이메일로 사용자 조회
        if (!userId && buyer_email) {
            const supabase = getSupabaseAdmin();
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', buyer_email)
                .single();

            if (profile) {
                userId = profile.id;
            }
        }

        if (!userId) {
            console.error('❌ 사용자를 찾을 수 없음:', { buyer_email, buyer_id });
            return res.status(400).json(
                errorResponse(ErrorCodes.INVALID_INPUT, '사용자를 찾을 수 없습니다.')
            );
        }

        // 크레딧 패키지에서 충전할 크레딧 양 조회
        const supabase = getSupabaseAdmin();
        let creditsToAdd = 0;

        if (product_id) {
            const { data: pkg } = await supabase
                .from('credit_packages')
                .select('credits, name')
                .eq('latpeed_product_id', product_id)
                .single();

            if (pkg) {
                creditsToAdd = pkg.credits;
                console.log(`📦 패키지 매칭: ${pkg.name} (${pkg.credits} 크레딧)`);
            }
        }

        // 패키지를 찾지 못하면 금액으로 추정
        if (creditsToAdd === 0 && amount) {
            // 가격 기준 크레딧 계산 (5000원 = 10크레딧 기준)
            const pricePerCredit = 500;
            creditsToAdd = Math.floor(amount / pricePerCredit);
            console.log(`💰 금액 기준 크레딧 계산: ${amount}원 → ${creditsToAdd} 크레딧`);
        }

        if (creditsToAdd <= 0) {
            console.error('❌ 충전할 크레딧을 계산할 수 없음');
            return res.status(400).json(
                errorResponse(ErrorCodes.INVALID_INPUT, '크레딧 양을 결정할 수 없습니다.')
            );
        }

        // 중복 처리 방지: 같은 order_id로 이미 충전되었는지 확인
        if (order_id) {
            const { data: existingTx } = await supabase
                .from('credit_transactions')
                .select('id')
                .eq('reference_id', order_id)
                .single();

            if (existingTx) {
                console.log(`⚠️ 이미 처리된 주문: ${order_id}`);
                return res.status(200).json({ success: true, message: '이미 처리된 주문입니다.' });
            }
        }

        // 크레딧 충전
        const description = product_name
            ? `${product_name} 구매`
            : `크레딧 ${creditsToAdd}개 구매`;

        const result = await addCredits(userId, creditsToAdd, description, order_id);

        if (!result.success) {
            console.error('❌ 크레딧 충전 실패:', result.message);
            return res.status(500).json(
                errorResponse(ErrorCodes.INTERNAL_ERROR, result.message)
            );
        }

        console.log(`✅ 크레딧 충전 완료: 사용자 ${userId}, +${creditsToAdd} 크레딧, 새 잔액: ${result.newBalance}`);

        return res.status(200).json({
            success: true,
            message: '크레딧이 충전되었습니다.',
            credits_added: creditsToAdd,
            new_balance: result.newBalance
        });

    } catch (error) {
        console.error('❌ 웹훅 처리 오류:', error);
        return res.status(500).json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, '웹훅 처리 중 오류가 발생했습니다.')
        );
    }
}

// Vercel에서 raw body 접근을 위한 설정
export const config = {
    api: {
        bodyParser: true
    }
};
