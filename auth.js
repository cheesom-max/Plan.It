// Authentication Module
// AI Travel Planner - 인증 관련 함수

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
            const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
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
