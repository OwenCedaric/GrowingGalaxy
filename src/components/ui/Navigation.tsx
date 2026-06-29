import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import AnimatedNavLink from "@/components/ui/AnimatedNavLink";
import { useTheme } from "@/utils/useTheme";

interface NavItem {
    text: string;
    href: string;
    children?: { text: string; href: string }[];
}

interface NavigationProps {
    title: string;
    navItems: NavItem[];
    pathname?: string;
}

export default function Navigation({ title, navItems, pathname = "" }: NavigationProps) {
    const isDark = useTheme();
    const [currentPath, setCurrentPath] = useState(pathname);
    const [isSearchActive, setIsSearchActive] = useState(currentPath.includes("/search"));
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Listen for Astro page navigations when using transition:persist
    useEffect(() => {
        const handlePageChange = () => {
            setCurrentPath(window.location.pathname);
        };
        document.addEventListener("astro:after-swap", handlePageChange);
        document.addEventListener("astro:page-load", handlePageChange);
        return () => {
            document.removeEventListener("astro:after-swap", handlePageChange);
            document.removeEventListener("astro:page-load", handlePageChange);
        };
    }, []);

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
        if (isSearchActive && inputRef.current && !currentPath.includes("/search")) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isSearchActive, currentPath]);

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
            {/* Minimalist Top Navigation (Left/Right Layout) */}
            <header className="absolute top-0 left-0 w-full z-50 pointer-events-none transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10 grid grid-cols-[1fr_auto] md:flex md:flex-nowrap md:items-center md:justify-between pointer-events-auto gap-y-5 md:gap-y-0 md:gap-8">
                    
                    {/* 1. Logo (Always Top Left) */}
                    <div className="col-start-1 row-start-1 flex items-center shrink-0 font-sans font-medium text-sm tracking-tight opacity-90 order-1">
                        <AnimatedNavLink href="/" text={title} isLogo={true} />
                    </div>

                    {/* 2. Controls: Search Trigger & Theme Toggle (Mobile Top Right, Desktop Rightmost) */}
                    <div className="col-start-2 row-start-1 flex items-center justify-end gap-4 sm:gap-6 order-3 shrink-0">
                        <button
                            onClick={() => setIsSearchActive(!isSearchActive)}
                            className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-primary-text md:hidden"
                            aria-label={isSearchActive ? "Close search" : "Open search"}
                        >
                            {isSearchActive ? <RiCloseLine className="w-4 h-4" /> : <RiSearchLine className="w-4 h-4" />}
                        </button>
                        
                        {/* Divider */}
                        <div className="hidden md:block w-px h-4 bg-black/10 dark:bg-white/10" />

                        {/* Theme Toggle */}
                        <div className="opacity-40 hover:opacity-100 transition-opacity flex items-center">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* 3. Dynamic Section: Nav / Search Form (Mobile Row 2 Full Width, Desktop Middle) */}
                    <div className="col-span-2 row-start-2 flex items-center w-full md:w-auto md:flex-1 md:justify-end order-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest">
                        <AnimatePresence mode="wait">
                            {!isSearchActive ? (
                                <motion.div
                                    key="nav-links"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between md:justify-end w-full md:w-auto gap-5 sm:gap-8"
                                >
                                    {/* Nav Items */}
                                    <div className="flex items-center justify-between w-full md:w-auto px-4 md:px-0 gap-2 sm:gap-8">
                                        {navItems.map((item) => {
                                            const isActive = item.href === "/"
                                                ? currentPath === "/"
                                                : currentPath.startsWith(item.href);
                                            return (
                                                <div key={item.href} className="relative group/navitem">
                                                    <a 
                                                        href={item.href} 
                                                        className={`transition-opacity duration-300 ${isActive ? 'opacity-100 text-primary-text font-medium' : 'opacity-40 hover:opacity-100 text-primary-text'}`}
                                                    >
                                                        {item.text}
                                                    </a>
                                                    {/* Dropdown Menu (Pure Typography & Strong Hover) */}
                                                    {item.children && item.children.length > 0 && (
                                                        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-300 z-50">
                                                            <div className="flex flex-col min-w-[120px] border-l border-black/20 dark:border-white/20 pl-4 py-1">
                                                                {item.children.map(child => (
                                                                    <a 
                                                                        key={child.href} 
                                                                        href={child.href}
                                                                        className="text-[11px] font-mono tracking-widest px-3 py-2 whitespace-nowrap block transition-all duration-200 opacity-60 hover:opacity-100 text-primary-text hover:bg-black/5 dark:hover:bg-white/10 rounded-sm"
                                                                    >
                                                                        {child.text}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Search Trigger (Desktop only, as mobile is in controls) */}
                                    <button
                                        onClick={() => setIsSearchActive(true)}
                                        className="hidden md:block opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-primary-text shrink-0"
                                        aria-label="Open search"
                                    >
                                        <RiSearchLine className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                key="search-form"
                                initial={{ opacity: 0, width: "0%" }}
                                animate={{ opacity: 1, width: "100%" }}
                                exit={{ opacity: 0, width: "0%" }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center w-full px-4 md:px-0 md:max-w-[240px] h-full md:ml-auto"
                                onSubmit={handleSearchSubmit}
                            >
                                {/* Pure Typographic Search Input */}
                                <div className="flex-1 flex items-center w-full bg-transparent border-b border-black/30 dark:border-white/30 pb-1.5">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="SEARCH..."
                                        className="flex-1 bg-transparent border-none outline-none text-primary-text font-mono text-base md:text-[11px] lg:text-xs uppercase tracking-widest placeholder-secondary-text/40 min-w-0"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                    <div className="flex items-center gap-4 shrink-0 ml-4">
                                        <button
                                            type="submit"
                                            className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-primary-text"
                                            aria-label="Submit search"
                                        >
                                            <RiSearchLine className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsSearchActive(false)}
                                            className="hidden md:block opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-primary-text"
                                            aria-label="Close search"
                                        >
                                            <RiCloseLine className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>
        </>
    );
}
