import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '@/utils/useTheme';

interface PixelTransitionProps {
    firstContent: React.ReactNode;
    secondContent: React.ReactNode;
    gridSize?: number;
    animationStepDuration?: number;
    once?: boolean;
    aspectRatio?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function PixelTransition({
    firstContent,
    secondContent,
    gridSize = 7,
    animationStepDuration = 0.3,
    once = false,
    aspectRatio = '100%',
    className = '',
    style = {},
}: PixelTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pixelGridRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLDivElement>(null);
    const delayedCallRef = useRef<gsap.core.Tween | null>(null);
    const [isActive, setIsActive] = useState(false);
    const isDark = useTheme();

    const pixelColor = isDark ? '#333333' : '#e5e5e5';

    useEffect(() => {
        const pixelGridEl = pixelGridRef.current;
        if (!pixelGridEl) return;
        pixelGridEl.innerHTML = '';

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const pixel = document.createElement('div');
                pixel.classList.add('pixel-transition__pixel');
                pixel.style.backgroundColor = pixelColor;
                const size = 100 / gridSize;
                pixel.style.width = `${size}%`;
                pixel.style.height = `${size}%`;
                pixel.style.left = `${col * size}%`;
                pixel.style.top = `${row * size}%`;
                pixelGridEl.appendChild(pixel);
            }
        }
    }, [gridSize, pixelColor]);

    const animatePixels = (activate: boolean) => {
        setIsActive(activate);
        const pixelGridEl = pixelGridRef.current;
        const activeEl = activeRef.current;
        if (!pixelGridEl || !activeEl) return;

        const pixels = pixelGridEl.querySelectorAll('.pixel-transition__pixel');
        if (!pixels.length) return;

        gsap.killTweensOf(pixels);
        if (delayedCallRef.current) delayedCallRef.current.kill();

        gsap.set(pixels, { display: 'none' });

        const totalPixels = pixels.length;
        const staggerDuration = animationStepDuration / totalPixels;

        gsap.to(pixels, {
            display: 'block',
            duration: 0,
            stagger: { each: staggerDuration, from: 'random' },
        });

        delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
            activeEl.style.display = activate ? 'block' : 'none';
            activeEl.style.pointerEvents = activate ? 'none' : '';
        });

        gsap.to(pixels, {
            display: 'none',
            duration: 0,
            delay: animationStepDuration,
            stagger: { each: staggerDuration, from: 'random' },
        });
    };

    const isTouchDevice = typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleEnter = () => { if (!isActive) animatePixels(true); };
    const handleLeave = () => { if (isActive && !once) animatePixels(false); };
    const handleClick = () => {
        if (!isActive) animatePixels(true);
        else if (!once) animatePixels(false);
    };

    return (
        <div
            ref={containerRef}
            className={`pixel-transition ${className}`}
            style={style}
            onMouseEnter={!isTouchDevice ? handleEnter : undefined}
            onMouseLeave={!isTouchDevice ? handleLeave : undefined}
            onClick={isTouchDevice ? handleClick : undefined}
            tabIndex={0}
        >
            <div style={{ paddingTop: aspectRatio }} />
            <div className="pixel-transition__default" aria-hidden={isActive}>
                {firstContent}
            </div>
            <div className="pixel-transition__active" ref={activeRef} aria-hidden={!isActive}>
                {secondContent}
            </div>
            <div className="pixel-transition__pixels" ref={pixelGridRef} />
        </div>
    );
}
