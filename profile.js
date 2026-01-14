document.addEventListener('DOMContentLoaded', async function () {
    // 1. 초기화 및 인증 체크
    let user = null;

    // 안전장치: Auth 모듈 확인
    if (typeof window.Auth === 'undefined') {
        console.warn('Auth module not loaded.');
    }

    // 세션 확인
    if (window.Auth) {
        try {
            const session = await window.Auth.getSession();
            if (!session || !session.user) {
                if (confirm('🔒 로그인이 필요한 페이지입니다.\n메인 페이지로 이동하여 로그인하시겠습니까?')) {
                    window.location.href = 'index.html?action=login';
                }
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
        // UI 초기화 (선택 해제)
        resetButtons();

        if (user) {
            // A. 기본 정보 (Auth User)
            emailInput.value = user.email;
            const date = new Date(user.created_at);
            joinDateInput.value = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

            // B. 프로필 정보 (DB에서 로드)
            try {
                const profile = await window.Auth.getProfile();

                if (profile) {
                    // 닉네임
                    nicknameInput.value = profile.nickname || '';

                    // 취향 정보 (DB 컬럼 사용)
                    // travel_styles가 DB에서 배열로 오는지 확인 필요 (schema는 TEXT[])
                    const savedStyles = profile.travel_styles || [];
                    const savedCompanion = profile.preferred_companion || '';
                    const savedBudget = profile.preferred_budget || '';

                    // UI 반영
                    updateSelectionUI(styleBtns, savedStyles, true);
                    updateSelectionUI(companionBtns, savedCompanion, false);
                    updateSelectionUI(budgetBtns, savedBudget, false);
                }
            } catch (e) {
                console.warn('Profile fetch failed', e);
            }
        } else {
            // 데모용 데이터 (비로그인 테스트용 Fallback)
            console.log('Demo mode: User not logged in, using LocalStorage');
            loadFromLocalStorage();
        }

        // C. 통계 정보 (현재는 LocalStorage/Mock 사용)
        const stats = {
            plannedTrips: localStorage.getItem('profile_statPlanned') || '0',
            savedItineraries: localStorage.getItem('profile_statSaved') || '0',
            upcomingDestinations: localStorage.getItem('profile_statUpcoming') || '0'
        };

        statPlanned.textContent = stats.plannedTrips + '회';
        statSaved.textContent = stats.savedItineraries + '개';
        statUpcoming.textContent = stats.upcomingDestinations + '곳';
    }

    function resetButtons() {
        [styleBtns, companionBtns, budgetBtns].forEach(group => {
            group.forEach(btn => btn.classList.remove('active'));
        });
    }

    function updateSelectionUI(buttons, value, isArray) {
        buttons.forEach(btn => {
            const btnVal = btn.dataset.value;
            if (isArray) {
                if (Array.isArray(value) && value.includes(btnVal)) {
                    btn.classList.add('active');
                }
            } else {
                if (btnVal === value) {
                    btn.classList.add('active');
                }
            }
        });
    }

    function loadFromLocalStorage() {
        emailInput.value = localStorage.getItem('profile_email') || 'cheeson79@gmail.com';
        nicknameInput.value = localStorage.getItem('profile_nickname') || '치솜';
        joinDateInput.value = '2026년 1월 15일';

        const savedStyles = JSON.parse(localStorage.getItem('profile_travelStyles') || '[]');
        const savedCompanion = localStorage.getItem('profile_companionType') || '';
        const savedBudget = localStorage.getItem('profile_budgetLevel') || '';

        updateSelectionUI(styleBtns, savedStyles, true);
        updateSelectionUI(companionBtns, savedCompanion, false);
        updateSelectionUI(budgetBtns, savedBudget, false);
    }

    // 4. 버튼 이벤트 설정
    styleBtns.forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('active')));

    companionBtns.forEach(btn => btn.addEventListener('click', () => {
        companionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }));

    budgetBtns.forEach(btn => btn.addEventListener('click', () => {
        budgetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }));

    // 저장 버튼 클릭
    saveBtn.addEventListener('click', async () => {
        const newNickname = nicknameInput.value.trim();

        if (!newNickname) {
            alert('닉네임을 입력해주세요.');
            nicknameInput.focus();
            return;
        }

        const originalText = saveBtn.textContent;
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;

        // UI에서 데이터 수집
        const selectedStyles = Array.from(styleBtns)
            .filter(btn => btn.classList.contains('active'))
            .map(btn => btn.dataset.value);

        const selectedCompanion = document.querySelector('#companionGroup .select-btn.active')?.dataset?.value || null;
        const selectedBudget = document.querySelector('#budgetGroup .select-btn.active')?.dataset?.value || null;

        try {
            if (window.Auth && user) {
                // DB 업데이트 (Supabase)
                const updates = {
                    nickname: newNickname,
                    travel_styles: selectedStyles,     // TEXT[]
                    preferred_companion: selectedCompanion, // TEXT
                    preferred_budget: selectedBudget,       // TEXT
                    updated_at: new Date()
                };

                const { success, error } = await window.Auth.updateProfile(updates);

                if (!success) throw new Error(error || 'DB update failed');

                showToast('✅ 프로필이 안전하게 저장되었습니다 (DB 동기화)');

                // 백업용 LocalStorage (선택사항 - DB 로드 실패 시 활용 가능하나, 지금은 제거해도 됨)
                // localStorage.setItem('profile_nickname', newNickname);
            } else {
                // 데모/오프라인 모드
                localStorage.setItem('profile_nickname', newNickname);
                localStorage.setItem('profile_travelStyles', JSON.stringify(selectedStyles));
                localStorage.setItem('profile_companionType', selectedCompanion || '');
                localStorage.setItem('profile_budgetLevel', selectedBudget || '');
                showToast('✅ 프로필이 로컬에 저장되었습니다 (데모 모드)');
            }

            // 잠시 후 메인으로 (선택사항)
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (err) {
            console.error('Save failed:', err);
            showToast('❌ 저장 실패: ' + err.message);
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });

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
