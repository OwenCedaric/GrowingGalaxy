/**
 * Known areaId cache for common cities to enable instant loading without waiting for Nominatim
 * In OSM convention:
 * - relations: osm_id + 3600000000
 * - ways: osm_id + 2400000000
 */
export const KNOWN_CITY_AREAS: Record<string, number> = {
    // Exact matches & common aliases (lowercased)
    'seattle': 3600237385,
    'seattle, usa': 3600237385,
    'paris': 3600007444,
    'paris, france': 3600007444,
    'london': 3600065606,
    'london, uk': 3600065606,
    'greater london': 3600065606,
    'tokyo': 3601543125,
    'tokyo, japan': 3601543125,
    'shibuya': 3601705866,
    'new york': 3600175905,
    'new york city': 3600175905,
    'new york, usa': 3600175905,
    'nyc': 3600175905,
    'manhattan': 3609691750,
    'san francisco': 3600111968,
    'san francisco, usa': 3600111968,
    'sf': 3600111968,
    'kyoto': 3600357794,
    'kyoto, japan': 3600357794,
};

/**
 * Resolve an areaId from a city name or site_name.
 * First checks local dictionary, then dynamically queries Nominatim if needed.
 */
export async function resolveAreaId(cityName: string): Promise<number | null> {
    if (!cityName) return null;

    const normalized = cityName.trim().toLowerCase();
    if (KNOWN_CITY_AREAS[normalized]) {
        return KNOWN_CITY_AREAS[normalized];
    }

    // Try splitting by comma (e.g. "Seattle, USA" -> "seattle")
    const mainPart = normalized.split(',')[0].trim();
    if (KNOWN_CITY_AREAS[mainPart]) {
        return KNOWN_CITY_AREAS[mainPart];
    }

    // Fallback: Query OpenStreetMap Nominatim
    try {
        const query = encodeURIComponent(mainPart);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const first = data[0];
        if (first.osm_type === 'relation') {
            return Number(first.osm_id) + 3600000000;
        } else if (first.osm_type === 'way') {
            return Number(first.osm_id) + 2400000000;
        }
    } catch (e) {
        console.warn(`[city-roads] Failed to geocode city "${cityName}":`, e);
    }

    return null;
}
