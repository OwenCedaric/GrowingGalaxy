import type { CSSProperties, ReactNode } from 'react';

interface GlareHoverProps {
    children: ReactNode;
    width?: string;
    height?: string;
    borderRadius?: string;
    glareColor?: string;
    glareOpacity?: number;
    glareAngle?: number;
    glareSize?: number;
    transitionDuration?: number;
    playOnce?: boolean;
    className?: string;
    style?: CSSProperties;
}

export default function GlareHover({
    children,
    width = '100%',
    height = '100%',
    borderRadius = '0px',
    glareColor = '#ffffff',
    glareOpacity = 0.3,
    glareAngle = -45,
    glareSize = 250,
    transitionDuration = 650,
    playOnce = false,
    className = '',
    style = {},
}: GlareHoverProps) {
    const hex = glareColor.replace('#', '');
    let rgba = glareColor;
    if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }

    const vars: CSSProperties & Record<string, string> = {
        '--gh-width': width,
        '--gh-height': height,
        '--gh-br': borderRadius,
        '--gh-angle': `${glareAngle}deg`,
        '--gh-duration': `${transitionDuration}ms`,
        '--gh-size': `${glareSize}%`,
        '--gh-rgba': rgba,
    };

    return (
        <div
            className={`glare-hover ${playOnce ? 'glare-hover--play-once' : ''} ${className}`}
            style={{ ...vars, ...style } as CSSProperties}
        >
            {children}
        </div>
    );
}
