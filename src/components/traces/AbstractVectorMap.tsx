import React, { useMemo } from 'react';

interface AbstractVectorMapProps {
    coordinates: string; // e.g. "37.7749° N, 122.4194° W"
    className?: string;
}

// Map Tile Helper: Robust coordinate parser
function parseCoordinates(coordStr: string) {
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

export default function AbstractVectorMap({ coordinates, className = '' }: AbstractVectorMapProps) {
    // Generate an abstract SVG layout pseudo-randomly based on coordinates
    const { gridLines, nodes, pointX, pointY } = useMemo(() => {
        const coords = parseCoordinates(coordinates);
        let seed = 12345;
        if (coords) {
            seed = Math.abs(coords.lat * 10000 + coords.lon * 10000);
        }

        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const gridLines = [];
        for (let i = 0; i < 15; i++) {
            gridLines.push({
                x1: random() * 100,
                y1: 0,
                x2: random() * 100,
                y2: 100,
                opacity: 0.08 + random() * 0.18,
                strokeWidth: 0.15 + random() * 0.15,
            });
            gridLines.push({
                x1: 0,
                y1: random() * 100,
                x2: 100,
                y2: random() * 100,
                opacity: 0.08 + random() * 0.18,
                strokeWidth: 0.15 + random() * 0.15,
            });
        }

        const nodes = [];
        for (let i = 0; i < 8; i++) {
            nodes.push({
                cx: random() * 100,
                cy: random() * 100,
                r: 0.4 + random() * 1.2,
                opacity: 0.15 + random() * 0.25,
            });
        }

        // The exact target point based on coords mapped to 0-100 range conceptually
        let px = 50, py = 50;
        if (coords) {
            px = ((coords.lon + 180) / 360) * 80 + 10;
            py = ((90 - coords.lat) / 180) * 80 + 10;
        }

        return { gridLines, nodes, pointX: px, pointY: py };
    }, [coordinates]);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 text-black dark:text-white"
            >
                {/* Abstract Topography / Grid Lines */}
                {gridLines.map((line, idx) => (
                    <line
                        key={`line-${idx}`}
                        x1={`${line.x1}%`}
                        y1={`${line.y1}%`}
                        x2={`${line.x2}%`}
                        y2={`${line.y2}%`}
                        stroke="currentColor"
                        strokeWidth={line.strokeWidth}
                        strokeOpacity={line.opacity}
                    />
                ))}

                {/* Ambient Nodes */}
                {nodes.map((node, idx) => (
                    <circle
                        key={`node-${idx}`}
                        cx={`${node.cx}%`}
                        cy={`${node.cy}%`}
                        r={node.r}
                        fill="currentColor"
                        fillOpacity={node.opacity}
                    />
                ))}

                {/* Target Coordinate Reticle */}
                <g transform={`translate(${pointX}, ${pointY})`}>
                    {/* Outer dashed orbit */}
                    <circle cx="0" cy="0" r="12" stroke="currentColor" strokeWidth="0.25" fill="none" strokeOpacity="0.5" strokeDasharray="1.2 1.2" className="animate-[spin_20s_linear_infinite]" />
                    {/* Middle ring */}
                    <circle cx="0" cy="0" r="5" fill="none" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.35" />
                    {/* Inner ring */}
                    <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.75" />
                    {/* Center dot */}
                    <circle cx="0" cy="0" r="0.9" fill="currentColor" opacity="0.9" />
                    {/* Crosshairs */}
                    <line x1="-16" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.45" />
                    <line x1="4" y1="0" x2="16" y2="0" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.45" />
                    <line x1="0" y1="-16" x2="0" y2="-4" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.45" />
                    <line x1="0" y1="4" x2="0" y2="16" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.45" />
                </g>
            </svg>
            
            {/* Coordinate label */}
            <div className="absolute bottom-3 left-3 text-[8px] font-mono uppercase tracking-widest text-black/45 dark:text-white/45 pointer-events-none leading-none">
                <span className="opacity-60">SYS_LOC //</span> {coordinates}
            </div>
        </div>
    );
}
