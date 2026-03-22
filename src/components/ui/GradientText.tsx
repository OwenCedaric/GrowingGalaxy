import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react';
import { useTheme } from '@/utils/useTheme';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    colorsDark?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
    pauseOnHover?: boolean;
    yoyo?: boolean;
}

export default function GradientText({
    children,
    className = '',
    colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
    colorsDark,
    animationSpeed = 8,
    showBorder = false,
    direction = 'horizontal',
    pauseOnHover = false,
    yoyo = true,
}: GradientTextProps) {
    const isDark = useTheme();
    const activeColors = isDark && colorsDark ? colorsDark : colors;
    const [isPaused, setIsPaused] = useState(false);
    const progress = useMotionValue(0);
    const elapsedRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);

    const animationDuration = animationSpeed * 1000;

    useAnimationFrame((time) => {
        if (isPaused) { lastTimeRef.current = null; return; }
        if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        elapsedRef.current += deltaTime;

        if (yoyo) {
            const fullCycle = animationDuration * 2;
            const cycleTime = elapsedRef.current % fullCycle;
            if (cycleTime < animationDuration) {
                progress.set((cycleTime / animationDuration) * 100);
            } else {
                progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
            }
        } else {
            progress.set((elapsedRef.current / animationDuration) * 100);
        }
    });

    useEffect(() => {
        elapsedRef.current = 0;
        progress.set(0);
    }, [animationSpeed, progress, yoyo]);

    const backgroundPosition = useTransform(progress, (p) => {
        if (direction === 'horizontal') return `${p}% 50%`;
        if (direction === 'vertical') return `50% ${p}%`;
        return `${p}% 50%`;
    });

    const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true); }, [pauseOnHover]);
    const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false); }, [pauseOnHover]);

    const gradientAngle = direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right';
    const gradientColors = [...activeColors, activeColors[0]].join(', ');

    const gradientStyle = {
        backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
        backgroundSize: direction === 'horizontal' ? '300% 100%' : direction === 'vertical' ? '100% 300%' : '300% 300%',
        backgroundRepeat: 'repeat' as const,
    };

    return (
        <motion.span
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'inline-block' }}
        >
            <motion.span
                style={{
                    ...gradientStyle,
                    backgroundPosition,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    display: 'inline-block',
                }}
            >
                {children}
            </motion.span>
        </motion.span>
    );
}
