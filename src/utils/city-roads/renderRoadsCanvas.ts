import type { RoadNetwork } from './fetchRoads';

export interface RenderOptions {
    canvas: HTMLCanvasElement;
    network: RoadNetwork;
    isDark?: boolean;
    paddingRatio?: number;
}

function projectMercator(lat: number, lon: number, centerLon: number): { x: number; y: number } {
    const rad = Math.PI / 180;
    const lambda = lon * rad;
    const phi = Math.max(-85, Math.min(85, lat)) * rad;
    const lambda0 = centerLon * rad;
    const x = lambda - lambda0;
    const y = -Math.log(Math.tan(Math.PI / 4 + phi / 2));
    return { x, y };
}

export function renderRoadsOnCanvas({
    canvas,
    network,
    isDark = false,
    paddingRatio = 0.06
}: RenderOptions): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const { bounds, nodes, ways } = network;
    const pMin = projectMercator(bounds.minLat, bounds.minLon, bounds.centerLon);
    const pMax = projectMercator(bounds.maxLat, bounds.maxLon, bounds.centerLon);

    const projWidth = Math.abs(pMax.x - pMin.x) || 0.001;
    const projHeight = Math.abs(pMin.y - pMax.y) || 0.001;

    const availWidth = width * (1 - paddingRatio * 2);
    const availHeight = height * (1 - paddingRatio * 2);

    const scale = Math.min(availWidth / projWidth, availHeight / projHeight);
    const projCenterX = (pMin.x + pMax.x) / 2;
    const projCenterY = (pMin.y + pMax.y) / 2;

    const offsetX = width / 2 - projCenterX * scale;
    const offsetY = height / 2 - projCenterY * scale;

    ctx.lineWidth = 0.8;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 15, 20, 0.75)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    let drawnSegments = 0;

    for (let i = 0; i < ways.length; i++) {
        const wayNodes = ways[i];
        if (!wayNodes || wayNodes.length < 2) continue;

        let first = true;
        for (let j = 0; j < wayNodes.length; j++) {
            const node = nodes.get(wayNodes[j]);
            if (!node) continue;

            const p = projectMercator(node.lat, node.lon, bounds.centerLon);
            const sx = p.x * scale + offsetX;
            const sy = p.y * scale + offsetY;

            if (first) {
                ctx.moveTo(sx, sy);
                first = false;
            } else {
                ctx.lineTo(sx, sy);
                drawnSegments++;
            }
        }

        // Flush in batches to keep canvas pipeline responsive
        if (drawnSegments > 2000) {
            ctx.stroke();
            ctx.beginPath();
            drawnSegments = 0;
        }
    }

    if (drawnSegments > 0) {
        ctx.stroke();
    }

    ctx.restore();
}
