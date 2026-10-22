import { useEffect, useRef, useState } from 'react';
import { getRoadNetwork, type RoadNetwork } from '@/utils/city-roads/fetchRoads';
import { renderRoadsOnCanvas } from '@/utils/city-roads/renderRoadsCanvas';

interface CityRoadMapProps {
    siteName?: string;
    coordinates?: string;
    className?: string;
}

export default function CityRoadMap({
    siteName,
    coordinates = '',
    className = ''
}: CityRoadMapProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [network, setNetwork] = useState<RoadNetwork | null>(null);
    const [isDrawn, setIsDrawn] = useState<boolean>(false);
    const [failed, setFailed] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        if (!siteName) {
            setNetwork(null);
            setIsDrawn(false);
            setFailed(true);
            return;
        }

        setIsDrawn(false);
        setFailed(false);

        getRoadNetwork(siteName, coordinates)
            .then(net => {
                if (!active) return;
                if (net && net.ways.length > 0) {
                    setNetwork(net);
                } else {
                    setFailed(true);
                }
            })
            .catch(err => {
                if (!active) return;
                console.warn('[CityRoadMap] Failed to load road network:', err);
                setFailed(true);
            });

        return () => {
            active = false;
        };
    }, [siteName, coordinates]);

    // Render roads on canvas whenever network, resize, or theme changes
    useEffect(() => {
        if (!network || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const checkDark = () => document.documentElement.classList.contains('dark');

        const draw = () => {
            if (!canvas) return;
            renderRoadsOnCanvas({
                canvas,
                network,
                isDark: checkDark()
            });
            setIsDrawn(true);
        };

        // Render on next animation frame to ensure container bounds are calculated
        const frameId = requestAnimationFrame(() => {
            draw();
        });

        // Handle window / container resize
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => draw());
        });
        resizeObserver.observe(containerRef.current);

        // Handle light/dark theme switch
        const mutationObserver = new MutationObserver(() => {
            draw();
        });
        mutationObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [network]);

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Real OpenStreetMap Road Network Canvas */}
            <canvas
                ref={canvasRef}
                className={`w-full h-full block pointer-events-none transition-opacity duration-700 ${
                    isDrawn ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Coordinate Docket Label */}
            {coordinates && (
                <div className="absolute bottom-3 left-3 text-[9px] font-mono uppercase tracking-widest text-black/60 dark:text-zinc-400 pointer-events-none leading-none select-none">
                    <span className="opacity-50">SYS_LOC //</span> {siteName ? `${siteName.toUpperCase()} — ` : ''}{coordinates}
                    {!isDrawn && !failed && (
                        <span className="ml-2 animate-pulse text-[8px] opacity-70">
                            [SYNCING_ROADS...]
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
