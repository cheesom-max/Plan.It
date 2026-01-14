// AI Travel Planner - Main JavaScript

// ===== 전역 도시 데이터 저장소 =====
// 사용자가 요청한 인기 여행지 데이터 (한국어/영어 지원)
const destinations = [
    { ko: "파리", en: "Paris", country: "프랑스", score: 10 },
    { ko: "런던", en: "London", country: "영국", score: 10 },
    { ko: "로마", en: "Rome", country: "이탈리아", score: 10 },
    { ko: "도쿄", en: "Tokyo", country: "일본", score: 10 },
    { ko: "오사카", en: "Osaka", country: "일본", score: 10 },
    { ko: "후쿠오카", en: "Fukuoka", country: "일본", score: 9 },
    { ko: "삿포로", en: "Sapporo", country: "일본", score: 8 },
    { ko: "오키나와", en: "Okinawa", country: "일본", score: 8 },
    { ko: "교토", en: "Kyoto", country: "일본", score: 8 },
    { ko: "방콕", en: "Bangkok", country: "태국", score: 10 },
    { ko: "다낭", en: "Da Nang", country: "베트남", score: 10 },
    { ko: "나트랑", en: "Nha Trang", country: "베트남", score: 8 },
    { ko: "푸꾸옥", en: "Phu Quoc", country: "베트남", score: 7 },
    { ko: "하노이", en: "Hanoi", country: "베트남", score: 7 },
    { ko: "호치민", en: "Ho Chi Minh City", country: "베트남", score: 7 },
    { ko: "타이베이", en: "Taipei", country: "대만", score: 9 },
    { ko: "싱가포르", en: "Singapore", country: "싱가포르", score: 9 },
    { ko: "발리", en: "Bali", country: "인도네시아", score: 9 },
    { ko: "세부", en: "Cebu", country: "필리핀", score: 8 },
    { ko: "보라카이", en: "Boracay", country: "필리핀", score: 8 },
    { ko: "홍콩", en: "Hong Kong", country: "중국", score: 9 },
    { ko: "마카오", en: "Macau", country: "중국", score: 7 },
    { ko: "상하이", en: "Shanghai", country: "중국", score: 7 },
    { ko: "베이징", en: "Beijing", country: "중국", score: 7 },
    { ko: "뉴욕", en: "New York", country: "미국", score: 10 },
    { ko: "호놀룰루(하와이)", en: "Honolulu", country: "미국", score: 10 },
    { ko: "LA", en: "Los Angeles", country: "미국", score: 9 },
    { ko: "샌프란시스코", en: "San Francisco", country: "미국", score: 8 },
    { ko: "라스베이거스", en: "Las Vegas", country: "미국", score: 8 },
    { ko: "괌", en: "Guam", country: "미국", score: 9 },
    { ko: "사이판", en: "Saipan", country: "미국", score: 8 },
    { ko: "바르셀로나", en: "Barcelona", country: "스페인", score: 9 },
    { ko: "마드리드", en: "Madrid", country: "스페인", score: 8 },
    { ko: "세비야", en: "Seville", country: "스페인", score: 7 },
    { ko: "프라하", en: "Prague", country: "체코", score: 8 },
    { ko: "인터라켄", en: "Interlaken", country: "스위스", score: 9 },
    { ko: "취리히", en: "Zurich", country: "스위스", score: 7 },
    { ko: "베네치아", en: "Venice", country: "이탈리아", score: 8 },
    { ko: "피렌체", en: "Florence", country: "이탈리아", score: 8 },
    { ko: "밀라노", en: "Milan", country: "이탈리아", score: 7 },
    { ko: "암스테르담", en: "Amsterdam", country: "네덜란드", score: 8 },
    { ko: "빈", en: "Vienna", country: "오스트리아", score: 8 },
    { ko: "부다페스트", en: "Budapest", country: "헝가리", score: 8 },
    { ko: "베를린", en: "Berlin", country: "독일", score: 7 },
    { ko: "뮌헨", en: "Munich", country: "독일", score: 7 },
    { ko: "리스본", en: "Lisbon", country: "포르투갈", score: 7 },
    { ko: "이스탄불", en: "Istanbul", country: "튀르키예", score: 8 },
    { ko: "두바이", en: "Dubai", country: "아랍에미리트", score: 8 },
    { ko: "코타키나발루", en: "Kota Kinabalu", country: "말레이시아", score: 7 },
    { ko: "쿠알라룸푸르", en: "Kuala Lumpur", country: "말레이시아", score: 7 },
    { ko: "시드니", en: "Sydney", country: "호주", score: 8 },
    { ko: "멜버른", en: "Melbourne", country: "호주", score: 7 },
    { ko: "몰디브", en: "Maldives", country: "몰디브", score: 8 },
    { ko: "칸쿤", en: "Cancun", country: "멕시코", score: 7 },
    { ko: "제주", en: "Jeju", country: "대한민국", score: 10 },
    { ko: "서울", en: "Seoul", country: "대한민국", score: 10 },
    { ko: "부산", en: "Busan", country: "대한민국", score: 9 },
    { ko: "강릉", en: "Gangneung", country: "대한민국", score: 7 },
    { ko: "경주", en: "Gyeongju", country: "대한민국", score: 7 }
];

// 로컬 도시 검색 함수 (빠른 필터링 - 한글/영어 지원)
function searchCitiesLocal(query) {
    if (!query || query.length < 1) return []; // 한글은 1글자부터 검색 허용

    const searchTerm = query.toLowerCase();

    // 입력값이 한글인지 확인
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(searchTerm);

    let results = destinations.filter(city => {
        if (isKorean) {
            // 한글 검색: 도시명(ko) 또는 국가(country)에 포함
            return city.ko.includes(query) || city.country.includes(query);
        } else {
            // 영어 검색: 도시명(en)에 포함 (소문자 비교)
            return city.en.toLowerCase().includes(searchTerm);
        }
    });

    // 점수(score) 내림차순 정렬 (인기 도시 우선)
    results.sort((a, b) => b.score - a.score);

    // 최대 10개 결과 반환, 데이터 형식 변환 to match previous structure
    return results.slice(0, 10).map(city => ({
        name: isKorean ? city.ko : city.en,
        country: isKorean ? city.country : city.en, // Note: using en name as country fallback if needed or just display context
        // 원래 코드 구조에 맞추기 위해 변환
        original: city,
        displayName: isKorean ? `${city.ko}, ${city.country}` : `${city.en}, ${city.country}`
    }));
}

document.addEventListener('DOMContentLoaded', function () {

    // ===== Hero Search Box - Airbnb Style UX =====
    const heroSearchForm = document.getElementById('heroSearchForm');
    const heroDestination = document.getElementById('heroDestination');
    const heroStartDate = document.getElementById('heroStartDate');
    const heroEndDate = document.getElementById('heroEndDate');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const heroSuggestions = document.querySelector('.hero-suggestions');

    // Hero 날짜 필드 초기화 - 오늘 이후만 선택 가능
    if (heroStartDate && heroEndDate) {
        const today = new Date().toISOString().split('T')[0];
        heroStartDate.min = today;
        heroEndDate.min = today;

        // 체크인 변경 시 체크아웃 최소값 연동
        heroStartDate.addEventListener('change', function () {
            heroEndDate.min = this.value;
            if (heroEndDate.value && heroEndDate.value < this.value) {
                heroEndDate.value = this.value;
            }
            // 날짜 선택 후 다음 필드로 자동 이동
            if (this.value) {
                heroEndDate.focus();
            }
        });

        // 체크아웃 선택 완료 시 검색 버튼 하이라이트
        heroEndDate.addEventListener('change', function () {
            if (this.value && heroStartDate.value && heroDestination.value) {
                heroSearchBtn.classList.add('ready');
            }
        });
    }

    // Hero 자동완성 - 로컬 도시 데이터 사용 (API 비용 무료!)
    if (heroDestination && heroSuggestions) {
        // Debounce 함수
        function debounceHero(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Hero 도시 검색 (로컬 데이터 사용)
        const searchHeroCities = debounceHero(function (query) {
            if (!query || query.length < 2) {
                heroSuggestions.classList.remove('active');
                return;
            }

            // 로컬 도시 데이터에서 검색
            const cities = searchCitiesLocal(query);

            if (cities.length > 0) {
                heroSuggestions.innerHTML = cities.map(city => `
                    <div class="suggestion-item" data-name="${city.name}" data-country="${city.country}">
                        <span class="suggestion-icon">📍</span>
                        <span class="suggestion-text">
                            <span class="suggestion-name">${city.name}</span>
                            <span class="suggestion-country">${city.country}</span>
                        </span>
                    </div>
                `).join('');
                heroSuggestions.classList.add('active');
            } else {
                // 검색 결과 없을 때 직접 입력 허용
                heroSuggestions.innerHTML = `
                    <div class="suggestion-item" data-name="${query}" data-country="">
                        <span class="suggestion-icon">✏️</span>
                        <span class="suggestion-text">
                            <span class="suggestion-name">"${query}" 직접 입력</span>
                        </span>
                    </div>
                `;
                heroSuggestions.classList.add('active');
            }
        }, 150); // 로컬 검색은 더 빠르므로 debounce 시간 단축

        // 입력 이벤트
        heroDestination.addEventListener('input', function () {
            searchHeroCities(this.value.trim());
        });

        // 포커스 시 이전 검색 결과 보여주기
        heroDestination.addEventListener('focus', function () {
            if (this.value.trim().length >= 2) {
                searchHeroCities(this.value.trim());
            }
        });

        // 자동완성 항목 클릭 처리
        heroSuggestions.addEventListener('click', function (e) {
            const item = e.target.closest('.suggestion-item');
            if (item) {
                const name = item.dataset.name;
                const country = item.dataset.country;
                heroDestination.value = country ? `${name}, ${country}` : name;
                heroSuggestions.classList.remove('active');
                // 목적지 선택 후 체크인 필드로 자동 이동
                heroStartDate.focus();
            }
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', function (e) {
            if (!heroDestination.contains(e.target) && !heroSuggestions.contains(e.target)) {
                heroSuggestions.classList.remove('active');
            }
        });
    }

    // Hero 폼 Submit 방지 및 엔터키 처리
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // 검색 버튼 클릭 트리거
            if (heroSearchBtn) heroSearchBtn.click();
        });
    }

    // 엔터키로 다음 필드 이동 (에어비앤비 스타일)
    if (heroDestination) {
        heroDestination.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                heroSuggestions?.classList.remove('active');
                heroStartDate?.focus();
            }
        });
    }

    if (heroStartDate) {
        heroStartDate.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                heroEndDate?.focus();
            }
        });
    }

    if (heroEndDate) {
        heroEndDate.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                heroSearchBtn?.click();
            }
        });
    }

    // Hero 검색 버튼 클릭 - 메인 폼으로 데이터 동기화
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', function () {
            const destination = heroDestination?.value?.trim();
            const startDate = heroStartDate?.value;
            const endDate = heroEndDate?.value;

            // 유효성 검사
            if (!destination) {
                showNotification('📍 여행지를 입력해주세요!');
                heroDestination?.focus();
                return;
            }

            // 메인 폼 요소 찾기
            const mainDestInput = document.querySelector('#destinationsContainer .destination-input');
            const mainStartDate = document.getElementById('startDate');
            const mainEndDate = document.getElementById('endDate');

            // 데이터 동기화
            if (mainDestInput) {
                mainDestInput.value = destination;
                mainDestInput.dataset.name = destination.split(',')[0].trim();
                mainDestInput.dataset.country = destination.split(',')[1]?.trim() || '';
            }
            if (mainStartDate && startDate) mainStartDate.value = startDate;
            if (mainEndDate && endDate) mainEndDate.value = endDate;

            // 날짜 입력 안내
            if (!startDate || !endDate) {
                showNotification('📅 날짜를 선택하시면 더 정확한 일정을 받을 수 있어요!');
            } else {
                showNotification('✅ 상세 옵션을 선택한 후 일정을 생성하세요!');
            }

            // 메인 폼 섹션으로 스크롤
            const formSection = document.querySelector('.travel-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

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

    // 선택된 여행지 배열 (전역 변수 충돌 방지를 위해 주석 처리)
    // const destinations = []; // REMOVED: Duplicate declaration conflicting with global destinations
    const MAX_DESTINATIONS = 5;

    // DOM 요소
    const destinationsContainer = document.getElementById('destinationsContainer');
    const addDestinationBtn = document.getElementById('addDestinationBtn');
    const selectedDestinations = document.getElementById('selectedDestinations');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const travelPlanForm = document.getElementById('travelPlanForm');
    const itinerarySection = document.getElementById('itinerarySection');

    // Debounce 함수
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 메인 폼 도시 검색 (로컬 데이터 사용 - API 비용 무료!)
    const searchCitiesDebounced = debounce(function (query, suggestionsEl) {
        if (!query || query.length < 2) {
            suggestionsEl.classList.remove('active');
            return;
        }

        // 로컬 도시 데이터에서 검색
        const cities = searchCitiesLocal(query);

        if (cities.length > 0) {
            suggestionsEl.innerHTML = cities.map(city => `
                <div class="suggestion-item" data-name="${city.name}" data-country="${city.country}">
                    <span class="suggestion-icon">📍</span>
                    <span class="suggestion-text">
                        <span class="suggestion-name">${city.name}</span>
                        <span class="suggestion-country">${city.country}</span>
                    </span>
                </div>
            `).join('');
            suggestionsEl.classList.add('active');
        } else {
            // 검색 결과 없을 때 직접 입력 허용
            suggestionsEl.innerHTML = `
                <div class="suggestion-item" data-name="${query}" data-country="">
                    <span class="suggestion-icon">✏️</span>
                    <span class="suggestion-text">
                        <span class="suggestion-name">"${query}" 직접 입력</span>
                    </span>
                </div>
            `;
            suggestionsEl.classList.add('active');
        }
    }, 150); // 로컬 검색은 빠르므로 debounce 시간 단축

    // 여행지 입력 필드에 이벤트 리스너 추가
    function initDestinationInput(inputEl, index) {
        const suggestionsEl = inputEl.parentElement.querySelector('.search-suggestions');

        inputEl.addEventListener('input', function () {
            searchCitiesDebounced(this.value.trim(), suggestionsEl);
        });

        inputEl.addEventListener('focus', function () {
            if (this.value.trim().length >= 2) {
                searchCitiesDebounced(this.value.trim(), suggestionsEl);
            }
        });

        // 클릭 이벤트 위임
        suggestionsEl.addEventListener('click', function (e) {
            const item = e.target.closest('.suggestion-item');
            if (item) {
                const name = item.dataset.name;
                const country = item.dataset.country;
                inputEl.value = country ? `${name}, ${country}` : name;
                inputEl.dataset.name = name;
                inputEl.dataset.country = country;
                suggestionsEl.classList.remove('active');
                updateSelectedDestinationsTags();
            }
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', function (e) {
            if (!inputEl.contains(e.target) && !suggestionsEl.contains(e.target)) {
                suggestionsEl.classList.remove('active');
            }
        });
    }

    // 여행지 추가
    function addDestination() {
        const items = destinationsContainer.querySelectorAll('.destination-item');
        if (items.length >= MAX_DESTINATIONS) {
            showNotification(`⚠️ 최대 ${MAX_DESTINATIONS}개의 여행지만 추가할 수 있습니다.`);
            return;
        }

        const newIndex = items.length;
        const newItem = document.createElement('div');
        newItem.className = 'destination-item';
        newItem.dataset.index = newIndex;
        newItem.innerHTML = `
            <div class="destination-number">${newIndex + 1}</div>
            <div class="search-input-wrapper">
                <input type="text" class="form-input search-input destination-input" 
                    placeholder="도시 또는 국가를 검색하세요" autocomplete="off" data-index="${newIndex}">
                <span class="search-icon">🔍</span>
                <div class="search-suggestions"></div>
            </div>
            <button type="button" class="remove-destination-btn" title="삭제">
                <span>✕</span>
            </button>
        `;

        destinationsContainer.appendChild(newItem);

        // 새 입력 필드에 이벤트 리스너 추가
        const newInput = newItem.querySelector('.destination-input');
        initDestinationInput(newInput, newIndex);
        newInput.focus();

        // 삭제 버튼 이벤트
        const removeBtn = newItem.querySelector('.remove-destination-btn');
        removeBtn.addEventListener('click', function () {
            removeDestination(newItem);
        });

        // 첫 번째 아이템의 삭제 버튼 활성화
        updateRemoveButtons();

        // 추가 버튼 숨기기 (최대 개수 도달 시)
        if (items.length + 1 >= MAX_DESTINATIONS) {
            addDestinationBtn.style.display = 'none';
        }
    }

    // 여행지 삭제
    function removeDestination(item) {
        item.remove();
        updateDestinationNumbers();
        updateRemoveButtons();
        updateSelectedDestinationsTags();

        // 추가 버튼 다시 표시
        addDestinationBtn.style.display = 'inline-flex';
    }

    // 여행지 번호 업데이트
    function updateDestinationNumbers() {
        const items = destinationsContainer.querySelectorAll('.destination-item');
        items.forEach((item, index) => {
            item.dataset.index = index;
            item.querySelector('.destination-number').textContent = index + 1;
            item.querySelector('.destination-input').dataset.index = index;
        });
    }

    // 삭제 버튼 표시/숨김
    function updateRemoveButtons() {
        const items = destinationsContainer.querySelectorAll('.destination-item');
        items.forEach((item, index) => {
            const removeBtn = item.querySelector('.remove-destination-btn');
            if (items.length === 1) {
                removeBtn.style.visibility = 'hidden';
            } else {
                removeBtn.style.visibility = 'visible';
            }
        });
    }

    // 선택된 여행지 태그 업데이트
    function updateSelectedDestinationsTags() {
        if (!selectedDestinations) return;

        const inputs = destinationsContainer.querySelectorAll('.destination-input');
        const tags = [];

        inputs.forEach((input, index) => {
            const value = input.value.trim();
            if (value) {
                tags.push(`
                    <span class="selected-destination-tag">
                        <span class="tag-order">${index + 1}</span>
                        ${value}
                    </span>
                `);
            }
        });

        if (tags.length > 1) {
            selectedDestinations.innerHTML = `
                <span style="color: var(--text-light); font-size: 0.9rem;">📍 여행 경로: </span>
                ${tags.join('<span style="color: var(--text-light); margin: 0 0.25rem;">→</span>')}
            `;
        } else {
            selectedDestinations.innerHTML = '';
        }
    }

    // 폼에서 여행지 데이터 수집
    function collectDestinations() {
        const inputs = destinationsContainer.querySelectorAll('.destination-input');
        const result = [];

        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                result.push({
                    name: input.dataset.name || value,
                    country: input.dataset.country || '',
                    displayName: value
                });
            }
        });

        return result;
    }

    // 초기화
    if (addDestinationBtn) {
        addDestinationBtn.addEventListener('click', addDestination);
    }

    // 첫 번째 여행지 입력 필드 초기화
    const firstInput = destinationsContainer?.querySelector('.destination-input');
    if (firstInput) {
        initDestinationInput(firstInput, 0);
    }

    // 날짜 유효성 검사
    if (startDateInput && endDateInput) {
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

    // 로딩 오버레이 표시/숨기기
    function showLoading(message = 'AI가 일정을 생성하고 있습니다...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="loading-text">${message}</p>
        `;
        document.body.appendChild(overlay);
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }

    // 일정 결과 표시
    function displayItinerary(itinerary) {
        if (!itinerary || !itinerarySection) return;

        const titleEl = document.getElementById('itineraryTitle');
        const summaryEl = document.getElementById('itinerarySummary');
        const daysEl = document.getElementById('itineraryDays');
        const tipsEl = document.getElementById('itineraryTips');

        // 제목과 요약
        if (titleEl) titleEl.textContent = `🗺️ ${itinerary.title || '여행 일정'}`;
        if (summaryEl) summaryEl.textContent = itinerary.summary || '';

        // 일별 일정
        if (daysEl && Array.isArray(itinerary.days)) {
            daysEl.innerHTML = itinerary.days.map(day => `
                <div class="itinerary-day">
                    <div class="day-header">
                        <div class="day-number">Day ${day.day}</div>
                        <div class="day-info">
                            <h3>${day.date || `Day ${day.day}`}</h3>
                            <p>${day.location || ''}</p>
                        </div>
                    </div>
                    <div class="day-schedule">
                        ${day.schedule.map(item => renderScheduleItem(item)).join('')}
                    </div>
                </div>
            `).join('');
        }

        // 여행 팁
        if (tipsEl && itinerary.tips && itinerary.tips.length > 0) {
            tipsEl.innerHTML = `
                <h4>💡 여행 팁</h4>
                <ul>
                    ${itinerary.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            `;
        }

        // 섹션 표시 및 스크롤
        itinerarySection.style.display = 'block';
        itinerarySection.scrollIntoView({ behavior: 'smooth' });
    }

    // 스케줄 아이템 렌더링 (일반 활동 vs 맛집 분기)
    function renderScheduleItem(item) {
        // 맛집(3 options)인 경우
        if (item.type === 'food' && item.options) {
            return `
                <div class="schedule-item food-item">
                    <div class="schedule-time">${item.time} <span class="badge-food">🍽️ ${item.meal_type || '식사'}</span></div>
                    <div class="schedule-content">
                        <div class="food-options-grid">
                            ${item.options.map((opt, idx) => `
                                <div class="food-option-card">
                                    <div class="food-rank">Option ${idx + 1}</div>
                                    <div class="food-name">${opt.name}</div>
                                    <div class="food-meta">⭐ ${opt.rating_expect || '4.0'} | ${opt.menu || '대표 메뉴'}</div>
                                    <div class="food-desc">"${opt.features}"</div>
                                </div>
                            `).join('')}
                        </div>
                        ${item.travel_info ? `<div class="travel-info-badge">🚗 ${item.travel_info}</div>` : ''}
                    </div>
                </div>
            `;
        }

        // 일반 활동인 경우
        return `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-content">
                    <div class="schedule-header">
                        <span class="schedule-place">${item.place || item.activity || '장소'}</span>
                        <span class="schedule-type ${item.type}">${getTypeLabel(item.type)}</span>
                    </div>
                    <div class="schedule-description">${item.description}</div>
                    ${item.travel_info ? `<div class="travel-info-text">👣 ${item.travel_info}</div>` : ''}
                </div>
            </div>
        `;
    }

    // 활동 타입 라벨
    function getTypeLabel(type) {
        const labels = {
            food: '🍽️ 맛집',
            activity: '🏄 액티비티',
            culture: '🎭 문화',
            nature: '🌿 자연',
            shopping: '🛍️ 쇼핑',
            transport: '🚗 이동'
        };
        return labels[type] || type;
    }

    // 새 일정 만들기 버튼
    const newItineraryBtn = document.getElementById('newItineraryBtn');
    if (newItineraryBtn) {
        newItineraryBtn.addEventListener('click', function () {
            itinerarySection.style.display = 'none';
            const formSection = document.querySelector('.travel-form-section');
            if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // [Fix] 여행지 데이터 수집 함수 (누락된 함수 구현)
    function collectDestinations() {
        // destinationsContainer 내의 모든 입력 필드 값 수집
        const inputs = document.querySelectorAll('#destinationsContainer .destination-input');
        const results = [];
        inputs.forEach(input => {
            const val = input.value.trim();
            if (val) {
                results.push(val);
            }
        });
        return results;
    }

    // 폼 제출 핸들러
    if (travelPlanForm) {
        travelPlanForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // ===== 로그인 체크 =====
            if (typeof Auth !== 'undefined') {
                const session = await Auth.getSession();
                if (!session?.user) {
                    showNotification('⚠️ 일정 생성은 로그인 후 이용 가능합니다!');
                    openAuthModal('login');
                    return;
                }
            }

            // 폼 데이터 수집
            const destinations = collectDestinations();
            const startDate = startDateInput?.value;
            const endDate = endDateInput?.value;
            const companion = document.querySelector('input[name="companion"]:checked')?.value;
            const styles = Array.from(document.querySelectorAll('input[name="style"]:checked')).map(el => el.value);

            // 유효성 검사
            if (destinations.length === 0) {
                showNotification('⚠️ 최소 한 개의 여행지를 입력해주세요!');
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

            console.log('📋 여행 계획 데이터:', { destinations, startDate, endDate, companion, styles });

            // 로딩 표시
            showLoading('✨ AI가 맞춤 여행 일정을 생성하고 있습니다...');

            try {
                const itinerary = await TravelAPI.generateItinerary({
                    destinations,
                    startDate,
                    endDate,
                    companion,
                    styles
                });

                hideLoading();

                // 일정 데이터를 localStorage에 저장 (현재 세션)
                localStorage.setItem('travelItinerary', JSON.stringify(itinerary));
                localStorage.setItem('tripInfo', JSON.stringify({
                    destinations,
                    startDate,
                    endDate,
                    companion,
                    styles
                }));

                // [Fix] 내 여행 목록(savedTrips)에 영구 저장 (프로필 연동용)
                const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');

                const newTrip = {
                    id: Date.now().toString(),
                    title: itinerary.title || destinations.join(', ') + ' 여행',
                    summary: itinerary.summary,
                    startDate: startDate,
                    endDate: endDate,
                    destinations: destinations,
                    days: itinerary.days, // 상세 일정 데이터 보존
                    tips: itinerary.tips,
                    createdAt: new Date().toISOString()
                };

                savedTrips.unshift(newTrip); // 최신순 추가
                localStorage.setItem('savedTrips', JSON.stringify(savedTrips));

                // 결과 페이지로 이동
                window.location.href = 'itinerary.html';

            } catch (error) {
                hideLoading();
                console.error('Itinerary generation error:', error);
                showNotification('❌ 일정 생성에 실패했습니다. 다시 시도해주세요.');
            }
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

    // ===== 내 정보 / 내 여행 모달 핸들러 =====
    const myInfoBtn = document.getElementById('myInfoBtn');
    const myTripsBtn = document.getElementById('myTripsBtn');
    const myInfoModalOverlay = document.getElementById('myInfoModalOverlay');
    const myTripsModalOverlay = document.getElementById('myTripsModalOverlay');
    const myInfoModalClose = document.getElementById('myInfoModalClose');
    const myTripsModalClose = document.getElementById('myTripsModalClose');
    const saveInfoBtn = document.getElementById('saveInfoBtn');

    // 내 정보 모달 열기
    if (myInfoBtn && myInfoModalOverlay) {
        myInfoBtn.addEventListener('click', async function () {
            // 프로필 드롭다운 닫기
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileDropdown) profileDropdown.classList.remove('active');

            // 사용자 정보 로드
            if (typeof Auth !== 'undefined') {
                const session = await Auth.getSession();
                if (session?.user) {
                    const myInfoEmail = document.getElementById('myInfoEmail');
                    const myInfoNickname = document.getElementById('myInfoNickname');
                    const myInfoCreatedAt = document.getElementById('myInfoCreatedAt');

                    if (myInfoEmail) myInfoEmail.textContent = session.user.email;

                    // DB에서 최신 프로필 정보 가져오기
                    const profile = await Auth.getProfile();
                    if (myInfoNickname) {
                        myInfoNickname.value = profile?.nickname || '';
                    }

                    if (myInfoCreatedAt) {
                        const createdDate = new Date(session.user.created_at);
                        myInfoCreatedAt.textContent = createdDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                }
            }

            myInfoModalOverlay.classList.add('active');
        });
    }

    // 내 정보 모달 닫기
    if (myInfoModalClose && myInfoModalOverlay) {
        myInfoModalClose.addEventListener('click', function () {
            myInfoModalOverlay.classList.remove('active');
        });

        myInfoModalOverlay.addEventListener('click', function (e) {
            if (e.target === myInfoModalOverlay) {
                myInfoModalOverlay.classList.remove('active');
            }
        });
    }

    // 내 정보 저장 (DB 연동)
    if (saveInfoBtn) {
        saveInfoBtn.addEventListener('click', async function () {
            const nicknameInput = document.getElementById('myInfoNickname');
            const nickname = nicknameInput?.value?.trim();

            if (!nickname) {
                showNotification('⚠️ 닉네임을 입력해주세요!');
                nicknameInput?.focus();
                return;
            }

            // 로딩 상태 표시
            const originalBtnText = saveInfoBtn.textContent;
            saveInfoBtn.textContent = '저장 중...';
            saveInfoBtn.disabled = true;

            try {
                if (typeof Auth === 'undefined') {
                    throw new Error('인증 모듈을 찾을 수 없습니다.');
                }

                const { success, error } = await Auth.updateProfile({ nickname: nickname });

                if (success) {
                    showNotification('✅ 프로필이 성공적으로 저장되었습니다!');

                    // UI 업데이트 (프로필 버튼 닉네임 교체 등) -> 필요 시 구현
                    // const profileEmail = document.getElementById('profileEmail');
                    // if (profileEmail) profileEmail.textContent = nickname; // 이메일 대신 닉네임 표시 원할 경우

                    myInfoModalOverlay.classList.remove('active');
                } else {
                    throw new Error(error || '저장에 실패했습니다.');
                }
            } catch (err) {
                console.error('프로필 저장 오류:', err);
                showNotification(`❌ 오류: ${err.message}`);
            } finally {
                // 버튼 상태 복구
                saveInfoBtn.textContent = originalBtnText;
                saveInfoBtn.disabled = false;
            }
        });
    }

    // 내 여행 모달 열기 및 목록 로드
    if (myTripsBtn && myTripsModalOverlay) {
        myTripsBtn.addEventListener('click', function () {
            // 프로필 드롭다운 닫기
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileDropdown) profileDropdown.classList.remove('active');

            const tripsList = document.getElementById('tripsList');
            const tripsEmpty = document.getElementById('tripsEmpty');

            // localStorage에서 여행 데이터 확인 (실제 운영 시에는 DB 연동 권장)
            const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');

            if (savedTrips.length > 0 && tripsList) {
                tripsEmpty.style.display = 'none';
                tripsList.innerHTML = savedTrips.map((trip, index) => `
                    <div class="trip-card" data-index="${index}">
                        <span class="trip-icon">✈️</span>
                        <div class="trip-info">
                            <div class="trip-title">${trip.title || trip.destination || '나의 여행'}</div>
                            <div class="trip-dates">${trip.startDate || ''} ~ ${trip.endDate || ''}</div>
                        </div>
                        <span class="trip-arrow">→</span>
                    </div>
                `).join('');

                // 여행 아이템 클릭 이벤트 (동적 바인딩 확인을 위해 직접 추가)
                const tripCards = tripsList.querySelectorAll('.trip-card');
                tripCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const index = this.dataset.index;
                        const tripData = savedTrips[index];

                        if (tripData) {
                            // 모달 닫기
                            myTripsModalOverlay.classList.remove('active');

                            // 일정 표시
                            // displayItinerary 함수가 tripData 구조를 처리할 수 있는지 확인 (itinerary 객체가 tripData에 직접 있는지, 아니면 tripData 자체가 itinerary인지)
                            // 저장 구조: { id, title, startDate, endDate, summary, days, tips ... } 
                            // displayItinerary는 위 구조를 그대로 받음
                            displayItinerary(tripData);

                            showNotification(`📂 '${tripData.title}' 일정을 불러왔습니다!`);
                        }
                    });
                });

            } else if (tripsEmpty) {
                tripsEmpty.style.display = 'block';
                if (tripsList) tripsList.innerHTML = ''; // 기존 목록 초기화
                tripsList.appendChild(tripsEmpty);
            }

            myTripsModalOverlay.classList.add('active');
        });
    }

    // 내 여행 모달 닫기
    if (myTripsModalClose && myTripsModalOverlay) {
        myTripsModalClose.addEventListener('click', function () {
            myTripsModalOverlay.classList.remove('active');
        });

        myTripsModalOverlay.addEventListener('click', function (e) {
            if (e.target === myTripsModalOverlay) {
                myTripsModalOverlay.classList.remove('active');
            }
        });
    }

    // [New] 외부 페이지(itinerary.html)에서의 로그인 요청 처리
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'login') {
        // URL 파라미터 정리
        window.history.replaceState({}, document.title, window.location.pathname);
        // 약간의 지연 후 모달 열기 (UX 자연스럽게)
        setTimeout(() => {
            openAuthModal('login');
            showNotification('🔑 로그인이 필요한 서비스입니다.');
        }, 500);
    }

    console.log('📋 Profile modals initialized with DB connection');
});
