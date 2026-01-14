// Authentication Module
// AI Travel Planner - 인증 관련 함수
// [중요] Supabase OAuth 설정 가이드:
// 1. Supabase 대시보드 > Authentication > URL Configuration으로 이동
// 2. "Redirect URLs"에 현재 배포된 도메인(예: https://ai-travel-planner-ivory-nu.vercel.app)을 반드시 추가해야 합니다.
// 3. 로컬 테스트를 위해 http://localhost:3000 등도 포함되어 있어야 합니다.

// supabaseClient를 window 객체에서 가져오기
const getSupabaseClient = () => window.supabaseClient;

const Auth = {
    // 현재 사용자 정보
    currentUser: null,

    // 이메일 회원가입
    async signUp(email, password) {
        try {
            const { data, error } = await getSupabaseClient().auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;

            // 이메일 인증 필요 여부 확인
            if (data.user && !data.user.confirmed_at) {
                return {
                    success: true,
                    data,
                    needsEmailConfirmation: true
                };
            }

            return { success: true, data };
        } catch (error) {
            console.error('회원가입 오류:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 이메일 로그인
    async signIn(email, password) {
        try {
            const { data, error } = await getSupabaseClient().auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            this.currentUser = data.user;
            return { success: true, data };
        } catch (error) {
            console.error('로그인 오류:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 구글 로그인
    async signInWithGoogle() {
        try {
            // 현재 도메인을 Redirect URL로 설정
            const redirectUrl = window.location.origin;
            console.log('🔵 Google Login Redirect URL 설정:', redirectUrl);

            const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('구글 로그인 오류:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 로그아웃
    async signOut() {
        try {
            const { error } = await getSupabaseClient().auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('로그아웃 오류:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 현재 세션 확인
    async getSession() {
        try {
            const { data: { session }, error } = await getSupabaseClient().auth.getSession();
            if (error) throw error;

            if (session) {
                this.currentUser = session.user;
            }
            return session;
        } catch (error) {
            console.error('세션 확인 오류:', error.message);
            return null;
        }
    },

    // 인증 상태 변경 리스너 설정
    onAuthStateChange(callback) {
        return getSupabaseClient().auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            callback(event, session);
        });
    },

    // 현재 사용자 가져오기
    getUser() {
        return this.currentUser;
    },

    // 프로필 정보 가져오기
    async getProfile() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await getSupabaseClient()
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('프로필 조회 오류:', error.message);
            return null;
        }
    },

    // 프로필 업데이트
    async updateProfile(updates) {
        if (!this.currentUser) return { success: false, error: '로그인이 필요합니다.' };

        try {
            const { data, error } = await getSupabaseClient()
                .from('profiles')
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('프로필 업데이트 오류:', error.message);
            return { success: false, error: error.message };
        }
    }
};

// Auth를 전역으로 노출
window.Auth = Auth;

console.log('✅ Auth module loaded');
