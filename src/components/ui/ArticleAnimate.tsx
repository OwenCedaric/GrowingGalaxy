import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ArticleAnimateProps {
    children: React.ReactNode;
    className?: string;
}

export default function ArticleAnimate({ children, className = '' }: ArticleAnimateProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Select all text and media block-level elements
        const elements = containerRef.current.querySelectorAll('p, h2, h3, h4, blockquote, ul, ol, img, pre');

        elements.forEach((el) => {
            gsap.fromTo(el,
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Cleanup
        return () => {
            elements.forEach(el => {
                gsap.killTweensOf(el);
            });
            ScrollTrigger.getAll().forEach(t => {
                if (elements.length > 0 && Array.from(elements).includes(t.trigger as Element)) {
                    t.kill();
                }
            });
        };
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
