// AI Travel Planner - Main JavaScript

document.addEventListener('DOMContentLoaded', function () {

    // ===== Navigation Scroll Effect =====
    const navbar = document.querySelector('.navbar');

    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);

    // ===== Button Click Handlers =====
    const loginBtn = document.getElementById('loginBtn');
    const signupBtnNav = document.getElementById('signupBtn');
    const startBtn = document.getElementById('startBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            // 로그인 모달 열기 (로그인 탭)
            openAuthModal('login');
        });
    }

    if (signupBtnNav) {
        signupBtnNav.addEventListener('click', function () {
            // 로그인 모달 열기 (회원가입 탭)
            openAuthModal('signup');
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', function () {
            // CTA 버튼 클릭 시 다음 섹션으로 스크롤
            const howItWorks = document.querySelector('.how-it-works');
            if (howItWorks) {
                howItWorks.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ===== Step Cards Animation on Scroll =====
    const stepCards = document.querySelectorAll('.step-card');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    stepCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        cardObserver.observe(card);
    });

    // ===== Notification Function =====
    function showNotification(message) {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="notification-icon">✨</span>
            <span class="notification-text">${message}</span>
        `;

        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #0066FF 0%, #003D99 100%)',
            color: '#fff',
            borderRadius: '50px',
            boxShadow: '0 10px 40px rgba(0, 102, 255, 0.4)',
            zIndex: '9999',
            fontSize: '1rem',
            fontWeight: '500',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });

        document.body.appendChild(notification);

        // 애니메이션
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // 자동 제거
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // ===== Parallax Effect for Hero =====
    const hero = document.querySelector('.hero');

    window.addEventListener('scroll', function () {
        const scrolled = window.scrollY;
        if (hero && scrolled < window.innerHeight) {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight * 0.8);
            }
        }
    });

    // ===== Logo Click - Scroll to Top =====
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Travel Form Functionality =====

    // 도시 검색 데이터
    const cities = [
        { name: '파리', country: '프랑스', icon: '🇫🇷' },
        { name: '도쿄', country: '일본', icon: '🇯🇵' },
        { name: '제주도', country: '대한민국', icon: '🇰🇷' },
        { name: '뉴욕', country: '미국', icon: '🇺🇸' },
        { name: '런던', country: '영국', icon: '🇬🇧' },
        { name: '로마', country: '이탈리아', icon: '🇮🇹' },
        { name: '바르셀로나', country: '스페인', icon: '🇪🇸' },
        { name: '방콕', country: '태국', icon: '🇹🇭' },
        { name: '싱가포르', country: '싱가포르', icon: '🇸🇬' },
        { name: '홍콩', country: '중국', icon: '🇭🇰' },
        { name: '시드니', country: '호주', icon: '🇦🇺' },
        { name: '두바이', country: 'UAE', icon: '🇦🇪' },
        { name: '오사카', country: '일본', icon: '🇯🇵' },
        { name: '부산', country: '대한민국', icon: '🇰🇷' },
        { name: '서울', country: '대한민국', icon: '🇰🇷' },
        { name: '하와이', country: '미국', icon: '🇺🇸' },
        { name: '발리', country: '인도네시아', icon: '🇮🇩' },
        { name: '프라하', country: '체코', icon: '🇨🇿' },
        { name: '암스테르담', country: '네덜란드', icon: '🇳🇱' },
        { name: '빈', country: '오스트리아', icon: '🇦🇹' }
    ];

    const destinationInput = document.getElementById('destinationInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const travelPlanForm = document.getElementById('travelPlanForm');

    // 도시 검색 기능
    if (destinationInput && searchSuggestions) {
        destinationInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();

            if (query.length === 0) {
                searchSuggestions.classList.remove('active');
                return;
            }

            const filtered = cities.filter(city =>
                city.name.toLowerCase().includes(query) ||
                city.country.toLowerCase().includes(query)
            );

            if (filtered.length > 0) {
                searchSuggestions.innerHTML = filtered.map(city => `
                    <div class="suggestion-item" data-city="${city.name}">
                        <span class="suggestion-icon">${city.icon}</span>
                        <span class="suggestion-text">
                            <span class="suggestion-name">${city.name}</span>
                            <span class="suggestion-country">${city.country}</span>
                        </span>
                    </div>
                `).join('');
                searchSuggestions.classList.add('active');

                // 클릭 이벤트 추가
                searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', function () {
                        destinationInput.value = this.dataset.city;
                        searchSuggestions.classList.remove('active');
                    });
                });
            } else {
                searchSuggestions.classList.remove('active');
            }
        });

        // 외부 클릭 시 검색 결과 닫기
        document.addEventListener('click', function (e) {
            if (!destinationInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });
    }

    // 날짜 유효성 검사
    if (startDateInput && endDateInput) {
        // 오늘 날짜를 최소값으로 설정
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        endDateInput.min = today;

        startDateInput.addEventListener('change', function () {
            endDateInput.min = this.value;
            if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = this.value;
            }
        });
    }

    // 폼 제출 핸들러
    if (travelPlanForm) {
        travelPlanForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 폼 데이터 수집
            const destination = destinationInput?.value.trim();
            const startDate = startDateInput?.value;
            const endDate = endDateInput?.value;
            const companion = document.querySelector('input[name="companion"]:checked')?.value;
            const styles = Array.from(document.querySelectorAll('input[name="style"]:checked')).map(el => el.value);

            // 유효성 검사
            if (!destination) {
                showNotification('⚠️ 여행지를 입력해주세요!');
                destinationInput.focus();
                return;
            }

            if (!startDate || !endDate) {
                showNotification('⚠️ 여행 날짜를 선택해주세요!');
                return;
            }

            if (!companion) {
                showNotification('⚠️ 동행자를 선택해주세요!');
                return;
            }

            if (styles.length === 0) {
                showNotification('⚠️ 최소 한 개의 여행 스타일을 선택해주세요!');
                return;
            }

            // 폼 데이터 로그
            console.log('📋 여행 계획 데이터:', {
                destination,
                startDate,
                endDate,
                companion,
                styles
            });

            // 로딩 상태 표시
            const submitBtn = document.getElementById('generateBtn');
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-sparkle">⏳</span><span class="btn-text">일정 생성 중...</span>';
            submitBtn.disabled = true;

            // 시뮬레이션 (실제로는 API 호출)
            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
                showNotification('✅ 일정이 성공적으로 생성되었습니다! (데모)');
            }, 2000);
        });
    }

    // ===== Update startBtn to scroll to form =====
    if (startBtn) {
        startBtn.removeEventListener('click', function () { }); // 기존 이벤트 제거 시도
        startBtn.onclick = function () {
            const travelFormSection = document.querySelector('.travel-form-section');
            if (travelFormSection) {
                travelFormSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }

    console.log('🌍 AI Travel Planner loaded successfully!');

    // ===== Authentication UI Handlers =====

    // DOM 요소 참조
    const authModalOverlay = document.getElementById('authModalOverlay');
    const modalClose = document.getElementById('modalClose');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authError = document.getElementById('authError');
    const userProfile = document.getElementById('userProfile');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileEmail = document.getElementById('profileEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    // 모달 열기 (tab: 'login' 또는 'signup')
    window.openAuthModal = function (tab = 'login') {
        if (authModalOverlay) {
            authModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 탭 전환
            if (tab === 'signup') {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
                signupForm.style.display = 'flex';
                loginForm.style.display = 'none';
            } else {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';
            }
        }
    };

    // 모달 닫기
    function closeAuthModal() {
        if (authModalOverlay) {
            authModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            hideAuthError();
            resetForms();
        }
    }

    // 에러 메시지 표시
    function showAuthError(message) {
        if (authError) {
            authError.textContent = message;
            authError.style.display = 'block';
        }
    }

    // 에러 메시지 숨기기
    function hideAuthError() {
        if (authError) {
            authError.style.display = 'none';
        }
    }

    // 이메일 인증 안내 메시지 표시
    function showEmailVerificationMessage(email) {
        const authModal = document.querySelector('.auth-modal');
        if (authModal) {
            authModal.innerHTML = `
                <div class="email-verification-message">
                    <div class="verification-icon">✉️</div>
                    <h2 class="verification-title">인증 메일을 보냈습니다!</h2>
                    <p class="verification-text">
                        <strong>${email}</strong> 주소로<br>
                        인증 메일을 발송했습니다.
                    </p>
                    <p class="verification-subtext">
                        이메일을 확인하고 인증 링크를 클릭해주세요.<br>
                        메일이 보이지 않으면 스팸함을 확인해주세요.
                    </p>
                    <button class="auth-submit-btn verification-close-btn" onclick="location.reload()">
                        <span class="btn-text">확인</span>
                    </button>
                </div>
            `;
        }
    }

    // 폼 초기화
    function resetForms() {
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }

    // 모달 닫기 버튼
    if (modalClose) {
        modalClose.addEventListener('click', closeAuthModal);
    }

    // 오버레이 클릭 시 닫기
    if (authModalOverlay) {
        authModalOverlay.addEventListener('click', function (e) {
            if (e.target === authModalOverlay) {
                closeAuthModal();
            }
        });
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && authModalOverlay?.classList.contains('active')) {
            closeAuthModal();
        }
    });

    // 탭 전환
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', function () {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'flex';
            signupForm.style.display = 'none';
            hideAuthError();
        });

        signupTab.addEventListener('click', function () {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.style.display = 'flex';
            loginForm.style.display = 'none';
            hideAuthError();
        });
    }

    // 구글 로그인 버튼
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async function () {
            const result = await Auth.signInWithGoogle();
            if (!result.success) {
                showAuthError(getErrorMessage(result.error));
            }
            // 성공 시 리다이렉트되므로 별도 처리 불필요
        });
    }

    // 로그인 폼 제출
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideAuthError();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const submitBtn = document.getElementById('loginSubmitBtn');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text">로그인 중...</span>';

            const result = await Auth.signIn(email, password);

            if (result.success) {
                closeAuthModal();
                showNotification('✅ 로그인 성공!');
                updateUIForLoggedInUser(result.data.user);
            } else {
                showAuthError(getErrorMessage(result.error));
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">로그인</span>';
        });
    }

    // 회원가입 폼 제출
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideAuthError();

            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
            const submitBtn = document.getElementById('signupSubmitBtn');

            // 비밀번호 확인
            if (password !== passwordConfirm) {
                showAuthError('비밀번호가 일치하지 않습니다.');
                return;
            }

            // 비밀번호 길이 확인
            if (password.length < 6) {
                showAuthError('비밀번호는 6자 이상이어야 합니다.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text">가입 중...</span>';

            const result = await Auth.signUp(email, password);

            if (result.success) {
                // 이메일 인증 필요 메시지 표시
                showEmailVerificationMessage(email);
            } else {
                showAuthError(getErrorMessage(result.error));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="btn-text">회원가입</span>';
            }
        });
    }

    // 프로필 드롭다운 토글
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            profileDropdown.classList.remove('active');
        });
    }

    // 로그아웃
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            const result = await Auth.signOut();
            if (result.success) {
                showNotification('👋 로그아웃 되었습니다.');
                updateUIForLoggedOutUser();
            }
        });
    }

    // 로그인 상태 UI 업데이트
    function updateUIForLoggedInUser(user) {
        const authButtons = document.getElementById('authButtons');
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            if (profileEmail) profileEmail.textContent = user.email;
        }
    }

    // 로그아웃 상태 UI 업데이트
    function updateUIForLoggedOutUser() {
        const authButtons = document.getElementById('authButtons');
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (profileDropdown) profileDropdown.classList.remove('active');
    }

    // 에러 메시지 한글화
    function getErrorMessage(error) {
        const messages = {
            'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
            'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.',
            'User already registered': '이미 가입된 이메일입니다.',
            'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
            'Signup requires a valid password': '유효한 비밀번호를 입력해주세요.'
        };
        return messages[error] || error || '오류가 발생했습니다.';
    }

    // 페이지 로드 시 세션 확인
    async function checkSession() {
        if (typeof Auth === 'undefined') return;

        const session = await Auth.getSession();
        if (session?.user) {
            updateUIForLoggedInUser(session.user);
        }
    }

    // 인증 상태 변경 리스너
    if (typeof Auth !== 'undefined') {
        Auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                updateUIForLoggedInUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                updateUIForLoggedOutUser();
            }
        });
        checkSession();
    }

    console.log('🔐 Auth UI initialized');
});
