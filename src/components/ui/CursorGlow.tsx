import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: -500, y: -500 });
    const pos = useRef({ x: -500, y: -500 });

    useEffect(() => {
        // Only on devices with hover
        if (window.matchMedia('(hover: none)').matches) return;

        const onMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };
        document.addEventListener('mousemove', onMove);

        let raf: number;
        const animate = () => {
            pos.current.x += (mouse.current.x - pos.current.x) * 0.08;
            pos.current.y += (mouse.current.y - pos.current.y) * 0.08;
            if (glowRef.current) {
                glowRef.current.style.left = `${pos.current.x}px`;
                glowRef.current.style.top = `${pos.current.y}px`;
            }
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            ref={glowRef}
            style={{
                position: 'fixed',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(100,100,255,0.05), transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 0.3s',
            }}
        />
    );
}
