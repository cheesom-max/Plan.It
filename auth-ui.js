// Auth UI Helper
// 모든 페이지에서 공통으로 사용되는 로그인/로그아웃 UI 처리

document.addEventListener('DOMContentLoaded', function () {
    // UI 요소 가져오기 (각 페이지마다 ID가 다를 수 있으므로 체크)
    const loginBtns = document.querySelectorAll('#loginBtn, .login-btn-trigger');
    const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn-trigger');
    const authContainers = document.querySelectorAll('#authButtons, .auth-entry');
    const profileContainers = document.querySelectorAll('#userProfile, .user-profile-display');
    const profileEmailEls = document.querySelectorAll('#profileEmail, .user-email-display');
    const profileAvatars = document.querySelectorAll('#userAvatar, .user-avatar-display');

    // Auth 객체가 로드되었는지 확인
    if (!window.Auth) {
        console.error('Auth module not found! Make sure auth.js is loaded before auth-ui.js');
        return;
    }

    // 초기 상태 확인
    checkUserStatus();

    // 상태 변경 리스너
    window.Auth.onAuthStateChange((event, session) => {
        updateUI(session?.user);
    });

    // 로그인 버튼 이벤트
    loginBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            // 로그인 모달이 없으므로 구글 로그인 바로 실행 또는 인덱스 페이지로 이동
            // 현재 간단하게 구글 로그인 실행
            const { error } = await window.Auth.signInWithGoogle();
            if (error) alert('로그인 실패: ' + error);
        });
    });

    // 로그아웃 버튼 이벤트
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
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
            // 로그인 상태
            authContainers.forEach(el => el.style.display = 'none');
            profileContainers.forEach(el => el.style.display = 'flex'); // or block

            // 이메일/닉네임 표시
            profileEmailEls.forEach(el => {
                if (el) el.textContent = user.email.split('@')[0];
            });

            // 아바타 표시 (만약 아바타 URL이 있다면)
            profileAvatars.forEach(el => {
                if (user.user_metadata?.avatar_url) {
                    el.style.backgroundImage = `url('${user.user_metadata.avatar_url}')`;
                }
            });

        } else {
            // 비로그인 상태
            authContainers.forEach(el => el.style.display = 'block'); // or flex
            profileContainers.forEach(el => el.style.display = 'none');

            // 프로필 페이지 접근 차단 (선택적)
            if (window.location.pathname.includes('profile.html')) {
                // profile.html은 비로그인 시 접근 불가 처리를 여기서 하면 깜빡임이 있을 수 있음.
                // 페이지 자체 스크립트에서 처리하는게 더 나음.
            }
        }
    }
});
