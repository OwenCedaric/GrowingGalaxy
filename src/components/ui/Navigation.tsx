import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import AnimatedNavLink from "@/components/ui/AnimatedNavLink";
import { useTheme } from "@/utils/useTheme";

interface NavItem {
    text: string;
    href: string;
}

interface NavigationProps {
    title: string;
    navItems: NavItem[];
    pathname?: string;
}

export default function Navigation({ title, navItems, pathname = "" }: NavigationProps) {
    const isDark = useTheme();
    const [isSearchActive, setIsSearchActive] = useState(pathname.includes("/search"));
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle initial query population on client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const q = urlParams.get("q");
            if (q) setSearchQuery(q);
        }
    }, []);

    // Focus input when search becomes active (only if it wasn't active on mount)
    useEffect(() => {
        if (isSearchActive && inputRef.current && !pathname.includes("/search")) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isSearchActive, pathname]);

    // Handle global Cmd+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchActive(true);
            }
            if (e.key === "Escape" && isSearchActive) {
                setIsSearchActive(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchActive]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="glass pl-4 pr-3 py-2 sm:pl-6 sm:pr-5 sm:py-3 flex items-center gap-3 sm:gap-6 overflow-hidden">
                    {/* Persistent Logo */}
                    <div className="shrink-0">
                        <AnimatedNavLink href="/" text={title} isLogo={true} />
                    </div>

                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 shrink-0" />

                    {/* Dynamic Section: Links vs Search */}
                    <AnimatePresence mode="popLayout" initial={false}>
                        {!isSearchActive ? (
                            <motion.div
                                key="nav-links"
                                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                                className="flex items-center gap-3 sm:gap-6 whitespace-nowrap"
                            >
                                {/* Nav Items */}
                                {navItems.map((item) => (
                                    <div key={item.href}>
                                        <AnimatedNavLink href={item.href} text={item.text} />
                                    </div>
                                ))}

                                <div className="h-4 w-px bg-black/10 dark:bg-white/10 shrink-0 hidden sm:block" />

                                {/* Search Trigger */}
                                <button
                                    onClick={() => setIsSearchActive(true)}
                                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-secondary-text"
                                    aria-label="Open search"
                                >
                                    <RiSearchLine className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="search-form"
                                initial={{ opacity: 0, x: 20, width: 0, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, width: "auto", filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 20, width: 0, filter: "blur(4px)" }}
                                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                                className="flex items-center min-w-[200px] sm:min-w-[320px] w-full"
                                onSubmit={handleSearchSubmit}
                            >
                                <div className="flex-1 flex items-center px-1 sm:px-2 w-full">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="flex-1 bg-transparent border-none outline-none text-primary-text font-serif italic font-light text-base sm:text-lg placeholder-secondary-text/40 min-w-0"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2 border-l border-black/5 dark:border-white/10 pl-2 sm:pl-3">
                                        <button
                                            type="submit"
                                            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-primary-text"
                                            aria-label="Submit search"
                                        >
                                            <RiSearchLine className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsSearchActive(false)}
                                            className="relative inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-secondary-text opacity-40 hover:opacity-100"
                                            aria-label="Close search"
                                        >
                                            <RiCloseLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </nav>
            </header>

            {/* Floating Theme Toggles */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass p-1 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                >
                    <ThemeToggle />
                </motion.div>
            </div>
        </>
    );
}
