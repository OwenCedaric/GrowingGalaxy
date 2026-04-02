import { useState, useEffect } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        setIsDark(root.classList.contains('dark'));

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    setIsDark(root.classList.contains('dark'));
                }
            }
        });

        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        // Handle View Transitions swap
        const handleAfterSwap = () => {
             setIsDark(document.documentElement.classList.contains('dark'));
             // Re-bind observer to new element
             observer.disconnect();
             observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        };

        document.addEventListener('astro:after-swap', handleAfterSwap);

        return () => {
            observer.disconnect();
            document.removeEventListener('astro:after-swap', handleAfterSwap);
        };
    }, []);

    return isDark;
}
