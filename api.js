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

// ===== 일정 생성 =====
async function generateItinerary(data) {
    try {
        const response = await fetch(`${API_BASE}/api/generate-itinerary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate itinerary');
        }

        return await response.json();
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
