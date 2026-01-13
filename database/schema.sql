-- =====================================================
-- AI Travel Planner - Supabase Database Schema
-- 실행 방법: Supabase Dashboard → SQL Editor에서 실행
-- =====================================================

-- =====================================================
-- 1. PROFILES 테이블 (사용자 프로필)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 프로필 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 본인만 조회/수정 가능
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 회원가입 시 자동 프로필 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: auth.users에 새 사용자 추가 시 profiles 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- 2. TRIPS 테이블 (여행 계획 메인)
-- =====================================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    companion TEXT NOT NULL CHECK (companion IN ('alone', 'friends', 'couple', 'family')),
    styles TEXT[] NOT NULL CHECK (array_length(styles, 1) > 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- 날짜 유효성 검사
    CONSTRAINT valid_trip_dates CHECK (end_date >= start_date)
);

-- trips 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- RLS 활성화
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- trips 정책
CREATE POLICY "Users can view own trips" 
    ON trips FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips" 
    ON trips FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" 
    ON trips FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" 
    ON trips FOR DELETE 
    USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trips updated_at 트리거
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 3. TRIP_DAYS 테이블 (일차별 일정)
-- =====================================================
CREATE TABLE IF NOT EXISTS trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number > 0),
    date DATE NOT NULL,
    title TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- 같은 여행 내 day_number 중복 방지
    CONSTRAINT unique_trip_day UNIQUE (trip_id, day_number)
);

-- trip_days 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_date ON trip_days(date);

-- RLS 활성화
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

-- trip_days 정책 (trips를 통해 권한 확인)
CREATE POLICY "Users can view own trip days" 
    ON trip_days FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_days.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own trip days" 
    ON trip_days FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_days.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own trip days" 
    ON trip_days FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_days.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own trip days" 
    ON trip_days FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_days.trip_id 
            AND trips.user_id = auth.uid()
        )
    );


-- =====================================================
-- 4. TRIP_ITEMS 테이블 (개별 일정 항목)
-- =====================================================
CREATE TABLE IF NOT EXISTS trip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_day_id UUID NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    time TIME,
    place_name TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'food', 'relax', 'activity', 'culture', 
        'shopping', 'nature', 'photo', 'nightlife',
        'transport', 'accommodation', 'other'
    )),
    description TEXT,
    address TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    image_url TEXT,
    duration_minutes INT CHECK (duration_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- trip_items 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_trip_items_trip_day_id ON trip_items(trip_day_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_category ON trip_items(category);
CREATE INDEX IF NOT EXISTS idx_trip_items_order ON trip_items(trip_day_id, order_index);

-- RLS 활성화
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;

-- trip_items 정책 (trip_days → trips를 통해 권한 확인)
CREATE POLICY "Users can view own trip items" 
    ON trip_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM trip_days
            JOIN trips ON trips.id = trip_days.trip_id
            WHERE trip_days.id = trip_items.trip_day_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own trip items" 
    ON trip_items FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trip_days
            JOIN trips ON trips.id = trip_days.trip_id
            WHERE trip_days.id = trip_items.trip_day_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own trip items" 
    ON trip_items FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM trip_days
            JOIN trips ON trips.id = trip_days.trip_id
            WHERE trip_days.id = trip_items.trip_day_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own trip items" 
    ON trip_items FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM trip_days
            JOIN trips ON trips.id = trip_days.trip_id
            WHERE trip_days.id = trip_items.trip_day_id 
            AND trips.user_id = auth.uid()
        )
    );


-- =====================================================
-- 유용한 뷰 (Views)
-- =====================================================

-- 여행 전체 정보 뷰 (일차/항목 수 포함)
CREATE OR REPLACE VIEW trip_summary AS
SELECT 
    t.*,
    p.nickname as user_nickname,
    p.email as user_email,
    COUNT(DISTINCT td.id) as total_days,
    COUNT(ti.id) as total_items,
    (t.end_date - t.start_date + 1) as duration_days
FROM trips t
LEFT JOIN profiles p ON t.user_id = p.id
LEFT JOIN trip_days td ON t.id = td.trip_id
LEFT JOIN trip_items ti ON td.id = ti.trip_day_id
GROUP BY t.id, p.nickname, p.email;


-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ AI Travel Planner 데이터베이스 스키마 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '생성된 테이블:';
    RAISE NOTICE '  - profiles (사용자 프로필)';
    RAISE NOTICE '  - trips (여행 계획)';
    RAISE NOTICE '  - trip_days (일차별 일정)';
    RAISE NOTICE '  - trip_items (개별 일정 항목)';
    RAISE NOTICE '';
    RAISE NOTICE '생성된 뷰:';
    RAISE NOTICE '  - trip_summary (여행 요약 정보)';
END $$;
