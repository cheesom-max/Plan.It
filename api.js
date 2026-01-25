// AI Travel Planner - API Module
// 백엔드 서버와 통신하는 함수들

const API_BASE = window.location.origin;

// ===== 도시 검색 =====
async function searchCities(query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${API_BASE}/api/search-cities?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('City search error:', error);
        return [];
    }
}

// ===== 인증 토큰 가져오기 =====
async function getAuthToken() {
    if (!window.supabaseClient) return null;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    return session?.access_token || null;
}

// ===== 일정 생성 =====
async function generateItinerary(data) {
    try {
        // 인증 토큰 가져오기
        const token = await getAuthToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        // 토큰이 있으면 Authorization 헤더 추가
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/generate-itinerary`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            const error = new Error(responseData.error?.message || responseData.message || 'Failed to generate itinerary');
            error.code = responseData.error?.code;
            error.status = response.status;
            throw error;
        }

        // 크레딧 잔액 업데이트 (응답에 포함된 경우)
        if (responseData._credits && window.Credits) {
            window.Credits.updateBalance(responseData._credits.remaining);
            // UI 업데이트
            const creditsBalanceEl = document.getElementById('creditsBalance');
            if (creditsBalanceEl) {
                creditsBalanceEl.textContent = responseData._credits.remaining.toLocaleString();
            }
        }

        return responseData;
    } catch (error) {
        console.error('Generate itinerary error:', error);
        throw error;
    }
}

// 전역으로 노출
window.TravelAPI = {
    searchCities,
    generateItinerary
};
