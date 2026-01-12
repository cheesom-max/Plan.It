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
    const startBtn = document.getElementById('startBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            // 로그인 버튼 클릭 이벤트
            showNotification('로그인 기능이 곧 추가됩니다!');
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '50px',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
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
});
