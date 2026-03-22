import { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
    text: string;
    className?: string;
    scrollStart?: string;
    scrollEnd?: string;
    stagger?: number;
    containerClassName?: string;
}

export default function ScrollFloat({
    text,
    className = '',
    scrollStart = 'top bottom-=100',
    scrollEnd = 'top center',
    stagger = 0.03,
    containerClassName = '',
}: ScrollFloatProps) {
    const containerRef = useRef<HTMLHeadingElement>(null);
    const tokens = useMemo(() => {
        const elements: string[] = [];
        let currentWord = "";
        const isCJK = (char: string) => /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7a3]/.test(char);

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === " ") {
                if (currentWord) { elements.push(currentWord); currentWord = ""; }
                elements.push(" ");
            } else if (isCJK(char)) {
                if (currentWord) { elements.push(currentWord); currentWord = ""; }
                elements.push(char);
            } else {
                currentWord += char;
            }
        }
        if (currentWord) elements.push(currentWord);
        return elements;
    }, [text]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const charEls = el.querySelectorAll('.scroll-float-char');
        if (!charEls.length) return;

        gsap.fromTo(
            charEls,
            {
                opacity: 0.1,
                y: 20,
                scale: 0.95,
                filter: 'blur(4px)',
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                stagger,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: scrollStart,
                    end: scrollEnd,
                    scrub: true,
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.trigger === el) st.kill();
            });
        };
    }, [tokens, scrollStart, scrollEnd, stagger]);

    return (
        <span ref={containerRef} className={`inline-block overflow-hidden ${containerClassName}`}>
            <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
                {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {token.split('').map((char, i) => (
                            <span
                                key={`${tokenIndex}-${i}`}
                                className="scroll-float-char"
                                style={{
                                    display: 'inline-block',
                                    willChange: 'transform, opacity, filter',
                                }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </span>
                ))}
            </span>
        </span>
    );
}
