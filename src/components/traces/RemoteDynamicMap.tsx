import { useEffect, useState } from 'react';

interface RemoteDynamicMapProps {
    mapUrl: string;
    className?: string;
}

const svgCache = new Map<string, string>();

export default function RemoteDynamicMap({ mapUrl, className = "" }: RemoteDynamicMapProps) {
    const [svgContent, setSvgContent] = useState<string | null>(() => svgCache.get(mapUrl) || null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        if (!mapUrl) return;

        if (svgCache.has(mapUrl)) {
            setSvgContent(svgCache.get(mapUrl)!);
            return;
        }

        setSvgContent(null);
        setError(null);

        fetch(mapUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);
                return res.text();
            })
            .then(text => {
                if (!active) return;

                let processed = text;

                // Strip ALL rect backgrounds (any fill that looks like a solid color rect)
                // Replace fill on any <rect id="background" ...> or similar patterns
                processed = processed.replace(
                    /(<rect[^>]*?)(fill\s*=\s*["'][^"']*["'])/gi,
                    (match, prefix, fillAttr) => {
                        return `${prefix}fill="none"`;
                    }
                );

                // Also handle fill as a style attribute on rects
                processed = processed.replace(
                    /(<rect[^>]*?style\s*=\s*["'][^"']*?)fill\s*:\s*[^;}"']+/gi,
                    '$1fill:none'
                );

                // Remove background-color from SVG root style
                processed = processed.replace(
                    /(<svg[^>]*?style\s*=\s*["'][^"']*?)background(?:-color)?\s*:\s*[^;}"']+/gi,
                    '$1'
                );

                // Ensure SVG root has no background
                processed = processed.replace(
                    /(<svg[^>]*?)background(?:-color)?\s*=\s*["'][^"']*["']/gi,
                    '$1'
                );

                svgCache.set(mapUrl, processed);
                setSvgContent(processed);
            })
            .catch(err => {
                if (!active) return;
                console.error("Error loading remote map:", err);
                setError(err.message);
            });

        return () => { active = false; };
    }, [mapUrl]);

    if (error) {
        return (
            <div className={`flex items-center justify-center text-black/30 dark:text-white/30 text-xs font-mono ${className}`}>
                <span className="uppercase tracking-widest">MAP_UNAVAILABLE</span>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className={`relative overflow-hidden ${className}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-black/20 dark:text-white/20 animate-pulse">
                        loading...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${className} [&_svg]:w-full [&_svg]:h-full map-blend`}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
