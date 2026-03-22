import React, { useRef, useEffect, useState } from 'react';

const formatTime = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const TimeRewindAnimation: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasTriggered, setHasTriggered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [diffText, setDiffText] = useState("");

    useEffect(() => {
        const target = new Date(targetDate);
        const now = new Date();

        let years = now.getFullYear() - target.getFullYear();
        let months = now.getMonth() - target.getMonth();
        let days = now.getDate() - target.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        let timeParts = [];
        if (years > 0) timeParts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) timeParts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0) timeParts.push(`${days} day${days > 1 ? 's' : ''}`);

        let textStr = "";
        if (timeParts.length === 0) {
            textStr = "This is a story from today.";
        } else if (timeParts.length === 1) {
            textStr = `This is a story from ${timeParts[0]} ago.`;
        } else if (timeParts.length === 2) {
            textStr = `This is a story from ${timeParts[0]} and ${timeParts[1]} ago.`;
        } else {
            textStr = `This is a story from ${timeParts[0]}, ${timeParts[1]}, and ${timeParts[2]} ago.`;
        }

        setDiffText(textStr);

        setHasTriggered(false);
        setIsFinished(false);
        setCurrentTime(Date.now());

    }, [targetDate]);

    useEffect(() => {
        if (!containerRef.current || hasTriggered) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasTriggered) {
                setHasTriggered(true);
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [hasTriggered]);

    useEffect(() => {
        if (!hasTriggered) return;

        const startTs = Date.now();
        const endTs = new Date(targetDate).getTime();

        const steps = 333;
        const duration = 1333;
        let step = 0;

        const intervalId = setInterval(() => {
            step++;
            const progress = step / steps;
            const current = startTs - (startTs - endTs) * progress;
            setCurrentTime(current);

            if (step >= steps) {
                clearInterval(intervalId);
                setCurrentTime(endTs);
                setIsFinished(true);
            }
        }, duration / steps); // ~4ms

        return () => clearInterval(intervalId);
    }, [hasTriggered, targetDate]);

    return (
        <div
            ref={containerRef}
            className="flex flex-col md:items-end gap-1.5 text-zinc-500 dark:text-zinc-300 font-light"
        >
            <div className="font-mono text-sm tracking-widest uppercase">
                {formatTime(currentTime)}
            </div>
            <div
                className={`text-xs md:text-sm tracking-wide transition-opacity duration-1000 ${isFinished ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={!isFinished}
            >
                {diffText}
            </div>
        </div>
    );
};
