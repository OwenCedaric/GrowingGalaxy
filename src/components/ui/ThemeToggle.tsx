import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/utils/useTheme";

export default function ThemeToggle() {
    const isDark = useTheme();
    const theme = isDark ? "dark" : "light";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Handle Astro view transitions
        const handlePageSwap = () => {
            // isDark from hook will update automatically because it listens to DOM
        };

        document.addEventListener("astro:after-swap", handlePageSwap);
        return () => document.removeEventListener("astro:after-swap", handlePageSwap);
    }, []);

    const updateDOM = (mode: "light" | "dark") => {
        const isDark = mode === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.style.colorScheme = mode;
        
        // Update theme-color meta tags
        const themeColor = isDark ? "#0a0a0a" : "#ffffff";
        let metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement("meta");
            metaThemeColor.name = "theme-color";
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute("content", themeColor);
    };

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        updateDOM(newTheme);
    };

    if (!mounted) {
        return <div className="w-10 h-10" />; // Prevent hydration mismatch
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover-trigger cursor-pointer"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.svg
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="h-5 w-5 text-accent-dark absolute"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="moon"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="h-5 w-5 text-accent absolute"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </motion.svg>
                )}
            </AnimatePresence>
        </button>
    );
}
