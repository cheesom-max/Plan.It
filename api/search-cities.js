// API: City Search using OpenStreetMap Nominatim
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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
        res.status(500).json({ error: 'Failed to search cities' });
    }
}
