import { useState, useRef, useEffect } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { useTheme } from "@/utils/useTheme";

interface NavItem {
    text: string;
    href: string;
    children?: { text: string; href: string }[];
}

interface NavigationProps {
    title: string;
    logoSrc?: string;
    navItems: NavItem[];
    pathname?: string;
}

export default function Navigation({ title, logoSrc, navItems, pathname = "" }: NavigationProps) {
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
                    <div className="col-start-1 row-start-1 flex items-center shrink-0 order-1">
                        {logoSrc ? (
                            <a href="/" className="block relative group outline-none" aria-label="Home">
                                <div
                                    className="h-[18px] sm:h-[22px] aspect-[1.446] bg-current text-primary-text dark:text-white opacity-85 dark:opacity-100 hover:scale-[1.04] transition-all duration-300 ease-out" 
                                    style={{ 
                                        WebkitMaskImage: `url(${logoSrc})`,
                                        WebkitMaskSize: "contain",
                                        WebkitMaskRepeat: "no-repeat",
                                        WebkitMaskPosition: "left center",
                                        maskImage: `url(${logoSrc})`,
                                        maskSize: "contain",
                                        maskRepeat: "no-repeat",
                                        maskPosition: "left center"
                                    }} 
                                />
                            </a>
                        ) : (
                            <a href="/" className="text-sm font-medium text-primary-text dark:text-white hover:opacity-80 transition-opacity block px-2 py-1">
                                {title}
                            </a>
                        )}
                    </div>

                    {/* 2. Controls: Search Trigger & Theme Toggle (Mobile Top Right, Desktop Rightmost) */}
                    <div className="col-start-2 row-start-1 flex items-center justify-end gap-4 sm:gap-6 order-3 shrink-0">
                        <button
                            onClick={() => setIsSearchActive(!isSearchActive)}
                            className="opacity-60 hover:opacity-100 dark:opacity-90 dark:hover:opacity-100 transition-opacity cursor-pointer text-primary-text dark:text-white md:hidden"
                            aria-label={isSearchActive ? "Close search" : "Open search"}
                        >
                            {isSearchActive ? <RiCloseLine className="w-4 h-4" /> : <RiSearchLine className="w-4 h-4" />}
                        </button>
                        
                        {/* Divider */}
                        <div className="hidden md:block w-px h-4 bg-black/15 dark:bg-white/30" />

                        {/* Theme Toggle */}
                        <div className="opacity-60 hover:opacity-100 dark:opacity-90 dark:hover:opacity-100 transition-opacity flex items-center text-primary-text dark:text-white">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* 3. Dynamic Section: Nav / Search Form (Mobile Row 2 Full Width, Desktop Middle) */}
                    <div className="col-span-2 row-start-2 flex items-center w-full md:w-auto md:flex-1 md:justify-end order-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest min-h-[36px]">
                        {!isSearchActive ? (
                            <div
                                className="flex items-center justify-between md:justify-end w-full md:w-auto gap-5 sm:gap-8 transition-opacity duration-200"
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
                                                        className={`transition-all duration-200 ${
                                                            isActive 
                                                                ? 'opacity-100 text-primary-text dark:text-white font-medium' 
                                                                : 'opacity-60 hover:opacity-100 dark:opacity-85 dark:hover:opacity-100 text-primary-text dark:text-zinc-300 dark:hover:text-white'
                                                        }`}
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
                                        className="hidden md:block opacity-60 hover:opacity-100 dark:opacity-90 dark:hover:opacity-100 transition-opacity cursor-pointer text-primary-text dark:text-white shrink-0"
                                        aria-label="Open search"
                                    >
                                        <RiSearchLine className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <form
                                    key="search-form"
                                    className="flex items-center w-full px-4 md:px-0 md:max-w-[240px] h-full md:ml-auto transition-opacity duration-200"
                                    onSubmit={handleSearchSubmit}
                                >
                                    {/* Pure Typographic Search Input */}
                                    <div className="flex-1 flex items-center w-full bg-transparent border-b border-black/20 dark:border-white/25 focus-within:border-black/60 dark:focus-within:border-white/70 transition-colors duration-300 pb-1.5">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="SEARCH..."
                                            className="flex-1 bg-transparent border-none outline-none text-primary-text dark:text-white caret-black dark:caret-white font-mono text-base md:text-[11px] lg:text-xs uppercase tracking-widest placeholder-secondary-text/75 dark:placeholder-white/60 focus:placeholder-transparent min-w-0"
                                            autoComplete="off"
                                            spellCheck="false"
                                        />
                                        <div className="flex items-center gap-4 shrink-0 ml-4">
                                            <button
                                                type="submit"
                                                className="opacity-50 hover:opacity-100 dark:opacity-75 dark:hover:opacity-100 transition-opacity cursor-pointer text-primary-text dark:text-white"
                                                aria-label="Submit search"
                                            >
                                                <RiSearchLine className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsSearchActive(false)}
                                                className="hidden md:block opacity-50 hover:opacity-100 dark:opacity-75 dark:hover:opacity-100 transition-opacity cursor-pointer text-primary-text dark:text-white"
                                                aria-label="Close search"
                                            >
                                                <RiCloseLine className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                    </div>
                </div>
            </header>
        </>
    );
}
