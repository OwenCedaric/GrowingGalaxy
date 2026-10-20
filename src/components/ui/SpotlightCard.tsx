import { useRef } from 'react';
import { useTheme } from '@/utils/useTheme';

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColorLight?: string;
    spotlightColorDark?: string;
}

export default function SpotlightCard({
    children,
    className = '',
    spotlightColorLight = 'rgba(0, 0, 0, 0.04)',
    spotlightColorDark = 'rgba(255, 255, 255, 0.07)',
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const isDark = useTheme();

    const updateSpotlight = (clientX: number, clientY: number) => {
        const rect = divRef.current?.getBoundingClientRect();
        if (!rect || !divRef.current) return;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        divRef.current.style.setProperty('--spotlight-color', isDark ? spotlightColorDark : spotlightColorLight);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        updateSpotlight(e.clientX, e.clientY);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        updateSpotlight(e.clientX, e.clientY);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            className={`card-spotlight ${className}`}
        >
            {children}
        </div>
    );
}
