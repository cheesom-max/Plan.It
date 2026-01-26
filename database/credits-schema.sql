-- =====================================================
-- AI Travel Planner - 크레딧 시스템 스키마
-- 실행 방법: Supabase Dashboard → SQL Editor에서 실행
-- =====================================================

-- =====================================================
-- 1. USER_CREDITS 테이블 (사용자 크레딧 잔액)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON user_credits(balance);

-- RLS 활성화
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- 정책: 본인만 조회 가능
CREATE POLICY "Users can view own credits"
    ON user_credits FOR SELECT
    USING (auth.uid() = user_id);

-- 정책: 본인 레코드 생성 (회원가입 시)
CREATE POLICY "Users can insert own credits"
    ON user_credits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 정책: 서비스 역할만 업데이트 가능 (보안상 직접 수정 불가)
-- 크레딧 충전/차감은 서버 측 service_role로만 처리

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 2. CREDIT_TRANSACTIONS 테이블 (크레딧 거래 내역)
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,  -- 양수: 충전, 음수: 사용
    type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'bonus', 'refund', 'admin')),
    description TEXT,
    reference_id TEXT,  -- 결제 ID 또는 trip_id 등 참조
    balance_after INTEGER NOT NULL,  -- 거래 후 잔액
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id);

-- RLS 활성화
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 거래 내역만 조회 가능
CREATE POLICY "Users can view own transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- 삽입은 서버 측 service_role로만 처리 (보안)


-- =====================================================
-- 3. CREDIT_PACKAGES 테이블 (크레딧 패키지 상품)
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL CHECK (credits > 0),
    price INTEGER NOT NULL CHECK (price >= 0),  -- 원화 단위
    currency TEXT NOT NULL DEFAULT 'KRW',
    latpeed_product_id TEXT,  -- 래피드 상품 ID
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_sort ON credit_packages(sort_order);

-- RLS 활성화
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 활성 패키지 조회 가능
CREATE POLICY "Anyone can view active packages"
    ON credit_packages FOR SELECT
    USING (is_active = true);


-- =====================================================
-- 4. 기본 크레딧 패키지 데이터 삽입
-- =====================================================
INSERT INTO credit_packages (name, description, credits, price, sort_order) VALUES
    ('무료 체험', '회원가입 보너스', 3, 0, 0),
    ('스타터', '여행 계획 10회', 10, 5000, 1),
    ('프로', '여행 계획 30회 (20% 할인)', 30, 12000, 2),
    ('프리미엄', '여행 계획 100회 (40% 할인)', 100, 30000, 3)
ON CONFLICT DO NOTHING;


-- =====================================================
-- 5. 회원가입 시 무료 크레딧 지급 함수
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    bonus_credits INTEGER := 3;  -- 무료 체험 크레딧
BEGIN
    -- 크레딧 잔액 테이블에 레코드 생성
    -- 보너스는 구매가 아니므로 total_purchased=0 유지
    INSERT INTO user_credits (user_id, balance, total_purchased)
    VALUES (NEW.id, bonus_credits, 0);

    -- 보너스 지급 내역 기록
    INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (NEW.id, bonus_credits, 'bonus', '회원가입 보너스 크레딧', bonus_credits);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 새 사용자 가입 시 크레딧 자동 지급
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_credits();


-- =====================================================
-- 6. 크레딧 충전 함수 (서버에서 호출)
-- =====================================================
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT DEFAULT 'purchase',
    p_description TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 현재 잔액 조회 (없으면 생성)
    SELECT balance INTO v_current_balance
    FROM user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO user_credits (user_id, balance)
        VALUES (p_user_id, 0);
        v_current_balance := 0;
    END IF;

    -- 새 잔액 계산
    v_new_balance := v_current_balance + p_amount;

    -- 잔액 업데이트
    UPDATE user_credits
    SET balance = v_new_balance,
        total_purchased = total_purchased + GREATEST(p_amount, 0)
    WHERE user_id = p_user_id;

    -- 거래 내역 기록
    INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
    VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_new_balance);

    RETURN QUERY SELECT true, v_new_balance, '크레딧이 충전되었습니다.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 7. 크레딧 차감 함수 (서버에서 호출)
-- =====================================================
CREATE OR REPLACE FUNCTION use_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT '여행 계획 생성',
    p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 차감량은 양수로 전달받음
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT false, 0, '차감할 크레딧은 0보다 커야 합니다.';
        RETURN;
    END IF;

    -- 현재 잔액 조회 (락 걸기)
    SELECT balance INTO v_current_balance
    FROM user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, '크레딧 정보가 없습니다.';
        RETURN;
    END IF;

    -- 잔액 확인
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, v_current_balance, '크레딧이 부족합니다.';
        RETURN;
    END IF;

    -- 새 잔액 계산
    v_new_balance := v_current_balance - p_amount;

    -- 잔액 업데이트
    UPDATE user_credits
    SET balance = v_new_balance,
        total_used = total_used + p_amount
    WHERE user_id = p_user_id;

    -- 거래 내역 기록 (음수로 기록)
    INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
    VALUES (p_user_id, -p_amount, 'use', p_description, p_reference_id, v_new_balance);

    RETURN QUERY SELECT true, v_new_balance, '크레딧이 사용되었습니다.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 8. 크레딧 잔액 조회 뷰
-- =====================================================
CREATE OR REPLACE VIEW user_credit_summary AS
SELECT
    uc.user_id,
    uc.balance,
    uc.total_purchased,
    uc.total_used,
    p.email,
    p.nickname,
    (SELECT COUNT(*) FROM credit_transactions ct WHERE ct.user_id = uc.user_id) as transaction_count,
    uc.updated_at as last_activity
FROM user_credits uc
LEFT JOIN profiles p ON uc.user_id = p.id;


-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '크레딧 시스템 스키마 생성 완료!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '생성된 테이블:';
    RAISE NOTICE '  - user_credits (사용자 크레딧 잔액)';
    RAISE NOTICE '  - credit_transactions (거래 내역)';
    RAISE NOTICE '  - credit_packages (크레딧 패키지)';
    RAISE NOTICE '';
    RAISE NOTICE '생성된 함수:';
    RAISE NOTICE '  - handle_new_user_credits() : 회원가입 시 보너스 지급';
    RAISE NOTICE '  - add_credits() : 크레딧 충전';
    RAISE NOTICE '  - use_credits() : 크레딧 차감';
    RAISE NOTICE '';
    RAISE NOTICE '기본 패키지:';
    RAISE NOTICE '  - 무료 체험: 3 크레딧 (0원)';
    RAISE NOTICE '  - 스타터: 10 크레딧 (5,000원)';
    RAISE NOTICE '  - 프로: 30 크레딧 (12,000원)';
    RAISE NOTICE '  - 프리미엄: 100 크레딧 (30,000원)';
    RAISE NOTICE '=====================================================';
END $$;
