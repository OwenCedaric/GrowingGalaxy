import React, { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
}

export const TypewriterEffect: React.FC<TypewriterProps> = ({
    text,
    speed = 40,
    delay = 100,
    className = ""
}) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const startTyping = () => {
            let currentIndex = 0;
            const typeNextChar = () => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                    timeoutId = setTimeout(typeNextChar, speed);
                }
            };
            typeNextChar();
        };

        timeoutId = setTimeout(startTyping, delay);

        return () => clearTimeout(timeoutId);
    }, [text, speed, delay]);

    return (
        <span className={`inline-flex items-center ${className}`}>
            {displayedText}
            <span className="animate-[pulse_1s_ease-in-out_infinite] ml-0.5 opacity-50 font-mono">|</span>
        </span>
    );
};
