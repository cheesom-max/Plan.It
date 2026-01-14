document.addEventListener('DOMContentLoaded', async function () {
    // 1. 초기화 및 인증 체크
    // defer 속성으로 로드되므로 실행 시점에는 window.Auth가 존재해야 함
    let user = null;

    // 안전장치: Auth 모듈 확인
    if (typeof window.Auth === 'undefined') {
        console.warn('Auth module not loaded. Waiting...');
        // 잠시 대기하거나, 데모 모드로 진행
    }

    // 세션 확인 (Auth가 있을 때만)
    if (window.Auth) {
        try {
            const session = await window.Auth.getSession();
            if (!session || !session.user) {
                // 비로그인 상태면 로그인 페이지(메인)로 이동 알림
                if (confirm('🔒 로그인이 필요한 페이지입니다.\n메인 페이지로 이동하여 로그인하시겠습니까?')) {
                    window.location.href = 'index.html?action=login';
                }
                // (취소 시 페이지 유지하지만 데이터는 비어있음)
                return;
            }
            user = session.user;
        } catch (e) {
            console.error('Session check failed', e);
        }
    }

    // 2. DOM 요소 참조
    const emailInput = document.getElementById('email');
    const nicknameInput = document.getElementById('nickname');
    const joinDateInput = document.getElementById('joinDate');

    const styleBtns = document.querySelectorAll('#styleGroup .select-btn');
    const companionBtns = document.querySelectorAll('#companionGroup .select-btn');
    const budgetBtns = document.querySelectorAll('#budgetGroup .select-btn');

    const statPlanned = document.getElementById('statPlanned');
    const statSaved = document.getElementById('statSaved');
    const statUpcoming = document.getElementById('statUpcoming');

    const saveBtn = document.getElementById('saveBtn');

    // 3. 데이터 로드 및 UI 초기화
    async function loadUserData() {
        // A. 기본 정보 (우선순위: Supabase Auth > LocalStorage > Default)
        if (user) {
            emailInput.value = user.email;

            const date = new Date(user.created_at);
            joinDateInput.value = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

            // 닉네임 로드
            let nickname = '';
            try {
                const profile = await window.Auth.getProfile();
                if (profile && profile.nickname) nickname = profile.nickname;
            } catch (e) { console.warn('Profile fetch failed', e); }

            if (!nickname) {
                nickname = localStorage.getItem('profile_nickname') || '';
            }
            nicknameInput.value = nickname;

        } else {
            // 데모용 데이터 (비로그인 테스트 시)
            emailInput.value = localStorage.getItem('profile_email') || 'cheeson79@gmail.com';
            nicknameInput.value = localStorage.getItem('profile_nickname') || '치솜';
            joinDateInput.value = localStorage.getItem('profile_joinDate') || '2026년 1월 15일';
        }

        // B. 취향 정보 (LocalStorage 'profile_' 접두사 사용)
        const savedStyles = JSON.parse(localStorage.getItem('profile_travelStyles') || '[]');
        const savedCompanion = localStorage.getItem('profile_companionType') || '';
        const savedBudget = localStorage.getItem('profile_budgetLevel') || '';

        // 여행 스타일 UI 반영
        styleBtns.forEach(btn => {
            if (savedStyles.includes(btn.dataset.value)) {
                btn.classList.add('active');
            }
        });

        // 동행 유형 UI 반영
        companionBtns.forEach(btn => {
            if (btn.dataset.value === savedCompanion) {
                btn.classList.add('active');
            }
        });

        // 예산 수준 UI 반영
        budgetBtns.forEach(btn => {
            if (btn.dataset.value === savedBudget) {
                btn.classList.add('active');
            }
        });

        // C. 통계 정보 (LocalStorage)
        const stats = {
            plannedTrips: localStorage.getItem('profile_statPlanned') || '0',
            savedItineraries: localStorage.getItem('profile_statSaved') || '0',
            upcomingDestinations: localStorage.getItem('profile_statUpcoming') || '0'
        };

        statPlanned.textContent = stats.plannedTrips + '회';
        statSaved.textContent = stats.savedItineraries + '개';
        statUpcoming.textContent = stats.upcomingDestinations + '곳';
    }

    // 4. 버튼 이벤트 설정

    // 여행 스타일 (다중 선택 토글)
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // 동행 유형 (단일 선택)
    companionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            companionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 예산 수준 (단일 선택)
    budgetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            budgetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 저장 버튼 클릭
    saveBtn.addEventListener('click', async () => {
        const newNickname = nicknameInput.value.trim();

        if (!newNickname) {
            alert('닉네임을 입력해주세요.');
            nicknameInput.focus();
            return;
        }

        // 로딩 상태
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;

        try {
            // A. Supabase DB 업데이트 (닉네임)
            if (window.Auth && user) {
                const { success, error } = await window.Auth.updateProfile({ nickname: newNickname });
                if (!success) throw new Error(error || 'DB update failed');
            }

            // B. LocalStorage 저장 (모든 데이터)
            localStorage.setItem('profile_nickname', newNickname); // 닉네임 백업

            // 여행 스타일 저장
            const selectedStyles = Array.from(styleBtns)
                .filter(btn => btn.classList.contains('active'))
                .map(btn => btn.dataset.value);
            localStorage.setItem('profile_travelStyles', JSON.stringify(selectedStyles));

            // 동행 유형 저장
            const selectedCompanion = document.querySelector('#companionGroup .select-btn.active')?.dataset?.value || '';
            localStorage.setItem('profile_companionType', selectedCompanion);

            // 예산 수준 저장
            const selectedBudget = document.querySelector('#budgetGroup .select-btn.active')?.dataset?.value || '';
            localStorage.setItem('profile_budgetLevel', selectedBudget);

            // 성공 메시지
            showToast('✅ 프로필이 성공적으로 저장되었습니다');

            // 1.5초 후 메인으로 이동 (선택사항)
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (err) {
            console.error('Save failed:', err);
            showToast('❌ 저장 실패: ' + err.message);
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });

    // 토스트 메시지 함수
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        } else {
            alert(message);
        }
    }

    // 앱 시작
    loadUserData();
});
