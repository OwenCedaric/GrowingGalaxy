import { decodePbf } from './place';
import { resolveAreaId } from './areaLookup';

export interface RoadNode {
    lat: number;
    lon: number;
}

export interface RoadBounds {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    centerLat: number;
    centerLon: number;
}

export interface RoadNetwork {
    areaId: number;
    name: string;
    nodes: Map<number, RoadNode>;
    ways: number[][];
    bounds: RoadBounds;
}

const roadCache = new Map<string, RoadNetwork>();
const pendingRequests = new Map<string, Promise<RoadNetwork | null>>();

const OVERPASS_BACKENDS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.osm.jp/api/interpreter'
];

function parseCoordinateStr(coordStr?: string): { lat: number; lon: number } | null {
    if (!coordStr) return null;
    const parts = coordStr.split(',').map(s => s.trim());
    if (parts.length !== 2) return null;

    const parsePart = (str: string) => {
        const match = str.match(/^(-?[\d.]+)\s*°?\s*([NSEW])?$/i);
        if (match) {
            let val = parseFloat(match[1]);
            const dir = match[2] ? match[2].toUpperCase() : '';
            if (dir === 'S' || dir === 'W') val = -Math.abs(val);
            return val;
        }
        return parseFloat(str);
    };

    const lat = parsePart(parts[0]);
    const lon = parsePart(parts[1]);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon };
}

interface CityDelta {
    deltaLat: number;
    deltaLon: number;
}

const CITY_DELTAS: Record<string, CityDelta> = {
    tokyo: { deltaLat: 0.16, deltaLon: 0.20 },
    kyoto: { deltaLat: 0.11, deltaLon: 0.11 },
    paris: { deltaLat: 0.12, deltaLon: 0.18 },
    london: { deltaLat: 0.15, deltaLon: 0.24 },
    'san francisco': { deltaLat: 0.12, deltaLon: 0.16 },
    sf: { deltaLat: 0.12, deltaLon: 0.16 },
    'new york': { deltaLat: 0.14, deltaLon: 0.16 },
    nyc: { deltaLat: 0.14, deltaLon: 0.16 },
    seattle: { deltaLat: 0.14, deltaLon: 0.16 }
};

function computeClusterBounds(nodesList: RoadNode[], anchorStr?: string, cityName?: string): RoadBounds {
    if (!nodesList.length) {
        return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0, centerLat: 0, centerLon: 0 };
    }

    const anchor = parseCoordinateStr(anchorStr);

    // If anchor coordinate is provided, center bounds symmetrically around it
    // to prevent geographic asymmetries (e.g. coastal waters, mountain outskirts)
    // from skewing the urban core off-center.
    if (anchor) {
        let delta: CityDelta = { deltaLat: 0.14, deltaLon: 0.18 };
        if (cityName) {
            const lower = cityName.toLowerCase();
            for (const [key, val] of Object.entries(CITY_DELTAS)) {
                if (lower.includes(key)) {
                    delta = val;
                    break;
                }
            }
        } else {
            const cosLat = Math.cos(anchor.lat * Math.PI / 180);
            delta = {
                deltaLat: 0.14,
                deltaLon: Math.abs(cosLat) > 0.1 ? 0.14 / cosLat : 0.18
            };
        }

        return {
            minLat: anchor.lat - delta.deltaLat,
            maxLat: anchor.lat + delta.deltaLat,
            minLon: anchor.lon - delta.deltaLon,
            maxLon: anchor.lon + delta.deltaLon,
            centerLat: anchor.lat,
            centerLon: anchor.lon
        };
    }

    // Fallback: If no anchor coordinates, sample to compute median and cluster around it
    const sampleLats: number[] = [];
    const sampleLons: number[] = [];
    const step = Math.max(1, Math.floor(nodesList.length / 500));
    for (let i = 0; i < nodesList.length; i += step) {
        sampleLats.push(nodesList[i].lat);
        sampleLons.push(nodesList[i].lon);
    }
    sampleLats.sort((a, b) => a - b);
    sampleLons.sort((a, b) => a - b);
    const targetLat = sampleLats[Math.floor(sampleLats.length / 2)];
    const targetLon = sampleLons[Math.floor(sampleLons.length / 2)];

    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    let clusteredCount = 0;
    const maxLatDiff = 0.5;
    const maxLonDiff = 0.5;

    for (let i = 0; i < nodesList.length; i++) {
        const node = nodesList[i];
        if (Math.abs(node.lat - targetLat) <= maxLatDiff && Math.abs(node.lon - targetLon) <= maxLonDiff) {
            if (node.lat < minLat) minLat = node.lat;
            if (node.lat > maxLat) maxLat = node.lat;
            if (node.lon < minLon) minLon = node.lon;
            if (node.lon > maxLon) maxLon = node.lon;
            clusteredCount++;
        }
    }

    if (clusteredCount < 100) {
        minLat = Infinity; maxLat = -Infinity;
        minLon = Infinity; maxLon = -Infinity;
        for (let i = 0; i < nodesList.length; i++) {
            const node = nodesList[i];
            if (node.lat < minLat) minLat = node.lat;
            if (node.lat > maxLat) maxLat = node.lat;
            if (node.lon < minLon) minLon = node.lon;
            if (node.lon > maxLon) maxLon = node.lon;
        }
    }

    return {
        minLat,
        maxLat,
        minLon,
        maxLon,
        centerLat: (minLat + maxLat) / 2,
        centerLon: (minLon + maxLon) / 2
    };
}

function buildNetworkFromPlaceData(placeData: any, areaId: number, cityName: string, coordinates?: string): RoadNetwork {
    const nodes = new Map<number, RoadNode>();
    const nodesList: RoadNode[] = [];

    for (let i = 0; i < placeData.nodes.length; i++) {
        const node = placeData.nodes[i];
        const item = { lat: node.lat, lon: node.lon };
        nodes.set(node.id, item);
        nodesList.push(item);
    }

    const ways: number[][] = [];
    for (let i = 0; i < placeData.ways.length; i++) {
        const way = placeData.ways[i];
        if (way.nodes && way.nodes.length > 1) {
            ways.push(way.nodes);
        }
    }

    const bounds = computeClusterBounds(nodesList, coordinates, cityName);

    return {
        areaId,
        name: placeData.name || cityName,
        nodes,
        ways,
        bounds
    };
}

/**
 * Fetch road network for a given city name / area ID, optionally anchored by coordinates
 */
export async function getRoadNetwork(cityName: string, coordinates?: string): Promise<RoadNetwork | null> {
    const areaId = await resolveAreaId(cityName);
    if (!areaId) return null;

    const cacheKey = `${areaId}-${coordinates || ''}`;

    if (roadCache.has(cacheKey)) {
        return roadCache.get(cacheKey)!;
    }

    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!;
    }

    const promise = (async () => {
        // Channel 0: Try local pre-cached PBF first (/maps/{areaId}.pbf)
        try {
            const localUrl = `/maps/${areaId}.pbf`;
            const localRes = await fetch(localUrl);
            if (localRes.ok) {
                const buffer = await localRes.arrayBuffer();
                const placeData = decodePbf(buffer);
                const network = buildNetworkFromPlaceData(placeData, areaId, cityName, coordinates);
                roadCache.set(cacheKey, network);
                return network;
            }
        } catch {
            // continue to remote CDN
        }

        // Channel 1: Try CloudFront PBF Cache
        try {
            const pbfUrl = `https://d2uf7yjjctyxf.cloudfront.net/nov-02-2020/${areaId}.pbf`;
            const pbfRes = await fetch(pbfUrl);
            if (pbfRes.ok) {
                const buffer = await pbfRes.arrayBuffer();
                const placeData = decodePbf(buffer);
                const network = buildNetworkFromPlaceData(placeData, areaId, cityName, coordinates);
                roadCache.set(cacheKey, network);
                return network;
            }
        } catch (e) {
            console.warn(`[city-roads] PBF cache miss for area ${areaId}, attempting Overpass fallback...`, e);
        }

        // Channel 2: Fallback to Overpass API
        try {
            const overpassQuery = `[out:json][timeout:30];
area(${areaId})->.searchArea;
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential)"](area.searchArea);
);
out body;
>;
out skel qt;`;

            for (const backend of OVERPASS_BACKENDS) {
                try {
                    const res = await fetch(backend, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        body: 'data=' + encodeURIComponent(overpassQuery)
                    });

                    if (!res.ok) continue;
                    const json = await res.json();
                    if (!json.elements || !json.elements.length) continue;

                    const nodes = new Map<number, RoadNode>();
                    const nodesList: RoadNode[] = [];
                    const ways: number[][] = [];

                    for (let i = 0; i < json.elements.length; i++) {
                        const elem = json.elements[i];
                        if (elem.type === 'node') {
                            const item = { lat: elem.lat, lon: elem.lon };
                            nodes.set(elem.id, item);
                            nodesList.push(item);
                        } else if (elem.type === 'way' && elem.nodes && elem.nodes.length > 1) {
                            ways.push(elem.nodes);
                        }
                    }

                    const bounds = computeClusterBounds(nodesList, coordinates, cityName);

                    const network: RoadNetwork = {
                        areaId,
                        name: cityName,
                        nodes,
                        ways,
                        bounds
                    };

                    roadCache.set(cacheKey, network);
                    return network;
                } catch {
                    continue;
                }
            }
        } catch (err) {
            console.error(`[city-roads] Failed to load roads for ${cityName}:`, err);
        }

        return null;
    })();

    pendingRequests.set(cacheKey, promise);
    const result = await promise;
    pendingRequests.delete(cacheKey);
    return result;
}
