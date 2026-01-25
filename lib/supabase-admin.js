// Supabase Admin Client (서버 전용)
// service_role 키를 사용하여 RLS 우회 가능

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// service_role 클라이언트 (RLS 우회)
let supabaseAdmin = null;

export function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
        }
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return supabaseAdmin;
}

// 일반 anon 클라이언트 (RLS 적용)
let supabaseClient = null;

export function getSupabaseClient() {
    if (!supabaseClient) {
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
        }
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

/**
 * 사용자 크레딧 잔액 조회
 * @param {string} userId - 사용자 UUID
 * @returns {Promise<{balance: number, total_purchased: number, total_used: number} | null>}
 */
export async function getUserCredits(userId) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_credits')
        .select('balance, total_purchased, total_used')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('크레딧 조회 오류:', error);
        return null;
    }

    return data;
}

/**
 * 크레딧 충전 (래피드 결제 완료 시)
 * @param {string} userId - 사용자 UUID
 * @param {number} amount - 충전할 크레딧 양
 * @param {string} description - 설명
 * @param {string} referenceId - 결제 참조 ID
 * @returns {Promise<{success: boolean, newBalance: number, message: string}>}
 */
export async function addCredits(userId, amount, description = '크레딧 구매', referenceId = null) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .rpc('add_credits', {
            p_user_id: userId,
            p_amount: amount,
            p_type: 'purchase',
            p_description: description,
            p_reference_id: referenceId
        });

    if (error) {
        console.error('크레딧 충전 오류:', error);
        return { success: false, newBalance: 0, message: error.message };
    }

    const result = data[0];
    return {
        success: result.success,
        newBalance: result.new_balance,
        message: result.message
    };
}

/**
 * 크레딧 차감 (여행 계획 생성 시)
 * @param {string} userId - 사용자 UUID
 * @param {number} amount - 차감할 크레딧 양 (기본 1)
 * @param {string} description - 설명
 * @param {string} referenceId - 여행 ID 등 참조
 * @returns {Promise<{success: boolean, newBalance: number, message: string}>}
 */
export async function useCredits(userId, amount = 1, description = '여행 계획 생성', referenceId = null) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .rpc('use_credits', {
            p_user_id: userId,
            p_amount: amount,
            p_description: description,
            p_reference_id: referenceId
        });

    if (error) {
        console.error('크레딧 차감 오류:', error);
        return { success: false, newBalance: 0, message: error.message };
    }

    const result = data[0];
    return {
        success: result.success,
        newBalance: result.new_balance,
        message: result.message
    };
}

/**
 * 크레딧 거래 내역 조회
 * @param {string} userId - 사용자 UUID
 * @param {number} limit - 조회 개수 (기본 20)
 * @returns {Promise<Array>}
 */
export async function getCreditTransactions(userId, limit = 20) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('거래 내역 조회 오류:', error);
        return [];
    }

    return data;
}

/**
 * 크레딧 패키지 목록 조회
 * @returns {Promise<Array>}
 */
export async function getCreditPackages() {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('패키지 조회 오류:', error);
        return [];
    }

    return data;
}

/**
 * JWT에서 사용자 ID 추출
 * @param {string} authHeader - Authorization 헤더 값
 * @returns {Promise<string | null>}
 */
export async function getUserIdFromAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error('인증 오류:', error);
        return null;
    }

    return user.id;
}
