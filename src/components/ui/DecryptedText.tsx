import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    className?: string;
    parentClassName?: string;
    encryptedClassName?: string;
    animateOn?: 'view' | 'hover';
}

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    className = '',
    parentClassName = '',
    encryptedClassName = '',
    animateOn = 'view',
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (animateOn !== 'view') return;
        const el = containerRef.current;
        if (!el || hasAnimated) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsHovering(true);
                    setHasAnimated(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [animateOn, hasAnimated]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        let currentIteration = 0;

        const getNextIndex = (revealedSet: Set<number>) => {
            const textLength = text.length;
            switch (revealDirection) {
                case 'start':
                    return revealedSet.size;
                case 'end':
                    return textLength - 1 - revealedSet.size;
                case 'center': {
                    const middle = Math.floor(textLength / 2);
                    const offset = Math.floor(revealedSet.size / 2);
                    const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
                    if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) return nextIndex;
                    for (let i = 0; i < textLength; i++) if (!revealedSet.has(i)) return i;
                    return 0;
                }
                default:
                    return revealedSet.size;
            }
        };

        const availableChars = useOriginalCharsOnly
            ? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
            : characters.split('');

        const shuffleText = (originalText: string, currentRevealed: Set<number>) => {
            return originalText
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (currentRevealed.has(i)) return originalText[i];
                    return availableChars[Math.floor(Math.random() * availableChars.length)];
                })
                .join('');
        };

        let revealedIndices = new Set<number>();

        if (isHovering) {
            interval = setInterval(() => {
                if (sequential) {
                    if (revealedIndices.size < text.length) {
                        const nextIndex = getNextIndex(revealedIndices);
                        revealedIndices = new Set(revealedIndices);
                        revealedIndices.add(nextIndex);
                        setDisplayText(shuffleText(text, revealedIndices));
                    } else {
                        clearInterval(interval);
                    }
                } else {
                    setDisplayText(shuffleText(text, revealedIndices));
                    currentIteration++;
                    if (currentIteration >= maxIterations) {
                        clearInterval(interval);
                        setDisplayText(text);
                    }
                }
            }, speed);
        } else {
            setDisplayText(text);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [isHovering, text, speed, maxIterations, sequential, revealDirection, useOriginalCharsOnly, characters]);

    return (
        <motion.span
            ref={containerRef}
            className={parentClassName}
            onMouseEnter={animateOn === 'hover' ? () => setIsHovering(true) : undefined}
            onMouseLeave={animateOn === 'hover' ? () => { setIsHovering(false); setDisplayText(text); } : undefined}
            style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}
        >
            {displayText.split('').map((char, i) => (
                <span
                    key={i}
                    className={char !== text[i] ? `${encryptedClassName} ${className}` : className}
                >
                    {char}
                </span>
            ))}
        </motion.span>
    );
}
