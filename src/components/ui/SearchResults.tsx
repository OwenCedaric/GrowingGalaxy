import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightCard from "@/components/ui/SpotlightCard";
import ScrollFloat from "@/components/ui/ScrollFloat";
import FadeContent from "@/components/ui/FadeContent";
import { RiFileSearchLine, RiSparkling2Line } from "@remixicon/react";

interface PagefindResult {
    url: string;
    meta: {
        title: string;
    };
    excerpt: string;
}

interface McpResult {
    chunk_id: string;
    score: number;
    metadata: {
        doc_id: string;
        url: string;
        canonical_url: string;
        namespace: string;
        text: string;
    };
}

export default function SearchResults() {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"keyword" | "ai">("keyword");

    // Keyword Search State
    const [keywordResults, setKeywordResults] = useState<PagefindResult[]>([]);
    const [isKeywordLoading, setIsKeywordLoading] = useState(false);

    const [aiResults, setAiResults] = useState<McpResult[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [hasSearchedAi, setHasSearchedAi] = useState(false);

    // Initial Search Effect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get("q") || "";
        setQuery(q);
        if (q.trim()) {
            performKeywordSearch(q);
        }
    }, []);

    // Reset AI search state when query changes
    useEffect(() => {
        setHasSearchedAi(false);
        setAiResults([]);
    }, [query]);

    // Perform Keyword Search (Pagefind)
    const performKeywordSearch = async (q: string) => {
        if (!q.trim()) return;
        setIsKeywordLoading(true);
        try {
            // @ts-ignore
            if (typeof window.pagefind === "undefined") {
                const path = "/pagefind/pagefind.js";
                // @ts-ignore
                window.pagefind = await import(/* @vite-ignore */ path);
            }
            // @ts-ignore
            const search = await window.pagefind.search(q);
            const resultsData = await Promise.all(search.results.map((r: any) => r.data()));
            setKeywordResults(resultsData.slice(0, 5));
        } catch (e) {
            console.error("Pagefind error:", e);
        } finally {
            setIsKeywordLoading(false);
        }
    };

    // Perform AI Search (MCP)
    const performAiSearch = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setIsAiLoading(true);
        setHasSearchedAi(true);
        try {
            const response = await fetch("/mcp/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, top_k: 5 })
            });
            if (response.ok) {
                const data = await response.json() as { results: McpResult[] };
                setAiResults(data.results ? data.results.slice(0, 5) : []);
            }
        } catch (e) {
            console.error("AI Search error:", e);
        } finally {
            setIsAiLoading(false);
        }
    }, []);

    // Handle Tab Switch
    useEffect(() => {
        if (activeTab === "ai" && !hasSearchedAi && !isAiLoading && query.trim()) {
            performAiSearch(query);
        }
    }, [activeTab, query, hasSearchedAi, isAiLoading, performAiSearch]);

    // Helper to determine the category based on URL
    const getCategoryFromUrl = (url: string) => {
        if (url.includes('/gallery/')) return 'Gallery';
        const isBlog = url.includes('/blog/') || (!url.includes('/gallery/') && !url.includes('/about/'));
        return isBlog ? 'Blog' : 'About';
    };

    const currentResults = activeTab === "keyword" ? keywordResults : aiResults;
    const isLoading = activeTab === "keyword" ? isKeywordLoading : isAiLoading;

    return (
        <div className="w-full">
            <header className="mb-12 md:mb-20">
                <div className="flex items-center justify-between gap-4 mb-12">
                    <FadeContent delay={100} duration={600}>
                        <p className="text-secondary-text font-mono text-[10px] md:text-sm tracking-widest uppercase opacity-60 dark:opacity-80 whitespace-nowrap">
                            {isLoading ? "Querying..." : `${currentResults.length} matches`}
                        </p>
                    </FadeContent>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-black/5 dark:bg-white/10 rounded-full backdrop-blur-md shrink-0 border border-black/5 dark:border-white/5">
                        {[
                            { id: "keyword", label: "Keyword", icon: RiFileSearchLine },
                            { id: "ai", label: "AI Intel", icon: RiSparkling2Line }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id ? "text-primary-text" : "text-secondary-text opacity-50 hover:opacity-100 dark:opacity-60 dark:hover:opacity-100"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="search-tab-bg"
                                        className="absolute inset-0 bg-white dark:bg-white/15 rounded-full shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className={`w-3.5 h-3.5 relative z-10 ${activeTab === tab.id ? "text-accent dark:text-white" : ""}`} />
                                <span className="relative z-10 hidden md:block">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="w-full pb-32">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col gap-24 w-full"
                        >
                            {[1, 2].map((i) => (
                                <div key={i} className="w-full min-h-[300px] rounded-3xl p-6 md:p-8 animate-pulse bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" />
                            ))}
                        </motion.div>
                    ) : query.trim() !== "" && currentResults.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-24 w-full"
                        >
                            {activeTab === "keyword"
                                ? (keywordResults as PagefindResult[]).map((r, index) => (
                                    <FadeContent key={r.url} delay={index * 100} duration={800} className="w-full">
                                        <SpotlightCard className="p-6 md:p-12 border border-black/5 dark:border-white/10">
                                            <article className="flex flex-col gap-6 group relative z-10 w-full">
                                                <div className="space-y-4">
                                                    <a href={r.url} className="block group/link after:absolute after:inset-0 after:z-20 after:cursor-pointer">
                                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-text group-hover/link:text-secondary-text transition-colors leading-tight">
                                                            <ScrollFloat
                                                                text={r.meta?.title || "Untitled"}
                                                                className="text-2xl md:text-3xl font-bold tracking-tight"
                                                                stagger={0.03}
                                                            />
                                                        </h2>
                                                    </a>
                                                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 dark:opacity-70 text-secondary-text">
                                                        <span>{getCategoryFromUrl(r.url)}</span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="text-sm md:text-base text-primary-text/70 dark:text-primary-text/80 leading-relaxed prose dark:prose-invert prose-p:my-0 prose-mark:bg-accent/20 prose-mark:text-primary-text line-clamp-3"
                                                    dangerouslySetInnerHTML={{ __html: r.excerpt }}
                                                />
                                            </article>
                                        </SpotlightCard>
                                    </FadeContent>
                                ))
                                : (aiResults as McpResult[]).map((r, index) => (
                                    <FadeContent key={r.chunk_id} delay={index * 100} duration={800} className="w-full">
                                        <SpotlightCard className="p-6 md:p-12 border border-black/5 dark:border-white/10 border-l-2 border-l-accent/20">
                                            <article className="flex flex-col gap-6 group relative z-10 w-full">
                                                <div className="space-y-4">
                                                    <a href={r.metadata?.canonical_url || "#"} className="block group/link after:absolute after:inset-0 after:z-20 after:cursor-pointer">
                                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-text group-hover/link:text-secondary-text transition-colors leading-tight">
                                                            <ScrollFloat
                                                                text="Fragment from Content"
                                                                className="text-xl md:text-2xl font-serif italic mb-2 block opacity-40 dark:opacity-60"
                                                                stagger={0.03}
                                                            />
                                                            <span>{r.metadata?.doc_id?.replace(/-/g, ' ') || "Untitled Fragment"}</span>
                                                        </h2>
                                                    </a>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 dark:opacity-70">
                                                            <RiSparkling2Line className="w-3 h-3 text-accent dark:text-white" />
                                                            <span>{r.metadata.namespace}</span>
                                                        </div>
                                                        <div className="text-[10px] font-mono opacity-30 dark:opacity-40 tracking-widest uppercase">
                                                            Similarity: {(r.score * 100).toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm md:text-base text-primary-text/80 dark:text-primary-text/90 leading-relaxed font-light italic border-l border-black/10 dark:border-white/10 pl-6">
                                                    "{r.metadata?.text?.slice(0, 400) || "No preview available"}..."
                                                </div>
                                            </article>
                                        </SpotlightCard>
                                    </FadeContent>
                                ))
                            }
                        </motion.div>
                    ) : query.trim() !== "" ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 flex flex-col justify-center max-w-2xl"
                        >
                            <p className="text-primary-text font-serif text-3xl md:text-4xl italic mb-6 opacity-80 dark:opacity-90">
                                The archive returns nothing.
                            </p>
                            <p className="text-sm md:text-base font-sans font-light text-secondary-text leading-relaxed opacity-70 dark:opacity-80">
                                No fragments or articles match your inquiry. Try switching to {activeTab === "keyword" ? "AI Intel" : "Keyword"} search for a different perspective.
                            </p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
