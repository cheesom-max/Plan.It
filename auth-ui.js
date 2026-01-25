// Auth UI Helper
// 모든 페이지에서 공통으로 사용되는 로그인/로그아웃 UI & 모달 처리

document.addEventListener('DOMContentLoaded', function () {
    // 1. UI 요소 가져오기
    const loginBtns = document.querySelectorAll('#loginBtn, .login-btn-trigger');
    const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn-trigger');
    const authContainers = document.querySelectorAll('#authButtons, .auth-entry');
    const profileContainers = document.querySelectorAll('#userProfile, .user-profile-display');
    const profileEmailEls = document.querySelectorAll('#profileEmail, .user-email-display');
    const profileAvatars = document.querySelectorAll('#userAvatar, .user-avatar-display');

    // Auth 객체 확인
    if (!window.Auth) {
        console.error('Auth module not found!');
        return;
    }

    // 2. 모달 생성 및 주입
    createAuthModal();

    // 3. 초기 상태 확인
    checkUserStatus();

    // 4. 상태 변경 리스너
    window.Auth.onAuthStateChange((event, session) => {
        updateUI(session?.user);
        if (session?.user) closeAuthModal();
    });

    // 5. 로그인 버튼 이벤트 -> 모달 열기
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal();
        });
    });

    // 6. 로그아웃 버튼 이벤트
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('로그아웃 하시겠습니까?')) {
                await window.Auth.signOut();
                window.location.reload();
            }
        });
    });

    async function checkUserStatus() {
        const session = await window.Auth.getSession();
        updateUI(session?.user);
    }

    function updateUI(user) {
        if (user) {
            authContainers.forEach(el => el.style.display = 'none');
            profileContainers.forEach(el => el.style.display = 'flex');
            profileEmailEls.forEach(el => {
                if (el) el.textContent = user.email.split('@')[0];
            });
            profileAvatars.forEach(el => {
                if (user.user_metadata?.avatar_url) {
                    el.style.backgroundImage = `url('${user.user_metadata.avatar_url}')`;
                } else {
                    el.style.backgroundImage = '';
                    el.style.backgroundColor = '#e2e8f0'; // Default gray
                }
            });
        } else {
            authContainers.forEach(el => el.style.display = 'block');
            profileContainers.forEach(el => el.style.display = 'none');
        }
    }

    // --- Modal Logic ---

    function createAuthModal() {
        // 이미 생성되었으면 중단
        if (document.getElementById('authModalOverlay')) return;

        const modalHtml = `
        <div id="authModalOverlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
            <div id="authModalContent" class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300">
                
                <!-- Close Button -->
                <button id="closeModalBtn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <!-- Header -->
                <div class="px-8 pt-8 pb-4 text-center">
                    <h2 class="text-2xl font-bold mb-1">VoyageAI 시작하기</h2>
                    <p class="text-sm text-gray-500">나만의 맞춤 여행 일정을 설계해보세요.</p>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-gray-100 dark:border-slate-800 px-8">
                    <button id="tabLogin" class="flex-1 pb-3 text-sm font-bold border-b-2 border-primary text-primary transition-colors">로그인</button>
                    <button id="tabSignup" class="flex-1 pb-3 text-sm font-bold border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition-colors">회원가입</button>
                </div>

                <!-- Form Container -->
                <div class="p-8">
                    <!-- Login Form -->
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">이메일</label>
                            <input type="email" id="loginEmail" class="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" placeholder="hello@example.com" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">비밀번호</label>
                            <input type="password" id="loginPassword" class="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex justify-center items-center gap-2">
                            <span>로그인</span>
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </form>

                    <!-- Signup Form (Initially Hidden) -->
                    <form id="signupForm" class="space-y-4 hidden">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">이메일</label>
                            <input type="email" id="signupEmail" class="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" placeholder="hello@example.com" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">비밀번호 (6자 이상)</label>
                            <input type="password" id="signupPassword" class="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" placeholder="••••••••" minlength="6" required>
                        </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">비밀번호 확인</label>
                            <input type="password" id="signupPasswordConfirm" class="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" placeholder="••••••••" minlength="6" required>
                        </div>
                        <button type="submit" class="w-full bg-[#0d141b] text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2">
                            <span>회원가입</span>
                            <span class="material-symbols-outlined text-sm">person_add</span>
                        </button>
                    </form>

                    <!-- Social Login -->
                    <div class="mt-6">
                        <div class="relative mb-6">
                            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
                            <div class="relative flex justify-center text-xs uppercase"><span class="bg-white dark:bg-slate-900 px-2 text-gray-400">또는</span></div>
                        </div>
                        <button id="googleLoginBtn" class="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google">
                            Google로 계속하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        setupModalEvents();
    }

    function setupModalEvents() {
        const overlay = document.getElementById('authModalOverlay');
        const content = document.getElementById('authModalContent');
        const closeBtn = document.getElementById('closeModalBtn');
        const tabLogin = document.getElementById('tabLogin');
        const tabSignup = document.getElementById('tabSignup');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const googleBtn = document.getElementById('googleLoginBtn');

        // Close Logic
        function close() {
            overlay.classList.add('opacity-0');
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }, 300);
        }

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Tab Logic
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('border-primary', 'text-primary');
            tabLogin.classList.remove('border-transparent', 'text-gray-400');
            tabSignup.classList.remove('border-primary', 'text-primary');
            tabSignup.classList.add('border-transparent', 'text-gray-400');

            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });

        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('border-primary', 'text-primary');
            tabSignup.classList.remove('border-transparent', 'text-gray-400');
            tabLogin.classList.remove('border-primary', 'text-primary');
            tabLogin.classList.add('border-transparent', 'text-gray-400');

            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });

        // Form Submit - Login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pw = document.getElementById('loginPassword').value;

            const btn = loginForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 로그인 중...';
            btn.disabled = true;

            const { error } = await window.Auth.signIn(email, pw);
            if (error) {
                alert('로그인 실패: ' + error);
                btn.innerHTML = originalText;
                btn.disabled = false;
            } else {
                // 성공 시 AuthStateChange가 호출되어 모달 닫힘
            }
        });

        // Form Submit - Signup
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const pw = document.getElementById('signupPassword').value;
            const pwConfirm = document.getElementById('signupPasswordConfirm').value;

            if (pw !== pwConfirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            const btn = signupForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 처리 중...';
            btn.disabled = true;

            const { data, error, needsEmailConfirmation } = await window.Auth.signUp(email, pw);

            if (error) {
                alert('회원가입 실패: ' + error);
                btn.innerHTML = originalText;
                btn.disabled = false;
            } else {
                if (needsEmailConfirmation) {
                    alert('회원가입 확인 메일이 발송되었습니다. 이메일을 확인해주세요.');
                    close();
                } else {
                    // 자동 로그인 되었으면 AuthStateChange가 처리
                    close();
                }
            }
        });

        // Google Login
        googleBtn.addEventListener('click', async () => {
            const { error } = await window.Auth.signInWithGoogle();
            if (error) alert(error);
        });
    }

    function openAuthModal() {
        const overlay = document.getElementById('authModalOverlay');
        const content = document.getElementById('authModalContent');
        if (!overlay) return;

        overlay.classList.remove('hidden');
        overlay.classList.add('flex');

        // Animation frame
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        });
    }

    // 외부에 노출 (필요 시)
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = function () {
        const overlay = document.getElementById('authModalOverlay');
        if (overlay) overlay.click(); // Trigger close via event
    };
});
