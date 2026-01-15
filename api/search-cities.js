// API: City Search using OpenStreetMap Nominatim
import { setCorsHeaders, errorResponse, ErrorCodes } from '../lib/api-utils.js';

export default async function handler(req, res) {
    // CORS 처리 (preflight면 조기 반환)
    if (setCorsHeaders(req, res)) {
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json(
            errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'GET 요청만 허용됩니다.')
        );
    }

    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1&featuretype=city`,
            {
                headers: {
                    'User-Agent': 'AI-Travel-Planner/1.0'
                }
            }
        );

        const data = await response.json();

        // 도시 데이터 정제
        const cities = data
            .filter(item => item.type === 'city' || item.type === 'town' || item.type === 'village' || item.class === 'place')
            .map(item => ({
                name: item.address?.city || item.address?.town || item.address?.village || item.name,
                country: item.address?.country || '',
                displayName: item.display_name,
                lat: item.lat,
                lon: item.lon
            }))
            .filter(city => city.name);

        res.json(cities);
    } catch (error) {
        console.error('City search error:', error);
        res.status(500).json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, '도시 검색에 실패했습니다.')
        );
    }
}
