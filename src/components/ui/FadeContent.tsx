import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps {
    children: React.ReactNode;
    blur?: boolean;
    duration?: number;
    ease?: string;
    delay?: number;
    threshold?: number;
    initialOpacity?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function FadeContent({
    children,
    blur = true,
    duration = 800,
    ease = 'power2.out',
    delay = 0,
    threshold = 0.1,
    initialOpacity = 0,
    className = '',
    style,
}: FadeContentProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const startPct = (1 - threshold) * 100;
        const getSeconds = (val: number) => (typeof val === 'number' && val > 10 ? val / 1000 : val);

        gsap.set(el, {
            autoAlpha: initialOpacity,
            filter: blur ? 'blur(10px)' : 'blur(0px)',
            y: 20,
            willChange: 'opacity, filter, transform',
        });

        const tl = gsap.timeline({
            paused: true,
            delay: getSeconds(delay),
        });

        tl.to(el, {
            autoAlpha: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: getSeconds(duration),
            ease,
        });

        const st = ScrollTrigger.create({
            trigger: el,
            start: `top ${startPct}%`,
            once: true,
            onEnter: () => tl.play(),
        });

        return () => {
            st.kill();
            tl.kill();
            gsap.killTweensOf(el);
        };
    }, [blur, duration, ease, delay, threshold, initialOpacity]);

    return (
        <div ref={ref} className={className} style={style}>
            {children}
        </div>
    );
}
