import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SpotlightCard from "@/components/ui/SpotlightCard";

interface PagefindResult {
    url: string;
    meta: {
        title: string;
    };
    excerpt: string;
}

export default function SearchResults() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PagefindResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get("q") || "";
        setQuery(q);

        async function initAndSearch() {
            if (!q.trim()) {
                setIsLoading(false);
                return;
            }

            try {
                // @ts-ignore
                if (typeof window.pagefind === "undefined") {
                    const path = "/pagefind/pagefind.js";
                    // @ts-ignore
                    window.pagefind = await import(/* @vite-ignore */ path);
                }
                
                // @ts-ignore
                const search = await window.pagefind.search(q);
                // Await all details (client side, negligible overhead for < 100 results)
                const resultsData = await Promise.all(search.results.map((r: any) => r.data()));
                setResults(resultsData);
            } catch (e) {
                console.error("Pagefind not loaded. Did you run a build?", e);
            } finally {
                setIsLoading(false);
            }
        }

        initAndSearch();
    }, []);

    // Helper to determine the category based on URL
    const getCategoryFromUrl = (url: string) => {
        if (url.includes('/gallery/')) return 'Gallery';
        if (url.includes('/blog/') || (!url.includes('/gallery/') && !url.includes('/about/'))) return 'Blog';
        if (url.includes('/about/')) return 'About';
        return 'Archive';
    };

    return (
        <div className="w-full">
            <header className="mb-20 md:mb-32">
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-[8vh] lg:text-[10vh] font-bold tracking-tighter leading-tight mb-8"
                >
                    Search Results
                </motion.h1>
                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    {query.trim() === "" ? (
                        <p className="text-secondary-text font-mono text-sm tracking-widest uppercase opacity-60">
                            Please enter a query to search the archive.
                        </p>
                    ) : (
                        <p className="text-secondary-text font-mono text-sm tracking-widest uppercase opacity-60">
                            {isLoading ? "Querying archive..." : `Found ${results.length} matches for "${query}"`}
                        </p>
                    )}
                </motion.div>
            </header>

            <div className="w-full pb-32">
                {isLoading && query.trim() !== "" ? (
                    <div className="flex flex-col gap-24 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full min-h-[300px] rounded-3xl p-6 md:p-8 animate-pulse bg-black/5 dark:bg-white/5" />
                        ))}
                    </div>
                ) : query.trim() !== "" && results.length > 0 ? (
                    <div className="flex flex-col gap-24 w-full">
                        {results.map((r, index) => (
                            <motion.div
                                key={r.url}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="w-full"
                            >
                                <SpotlightCard className="p-6 md:p-12">
                                    <article className="flex flex-col gap-8 group relative z-10 w-full">
                                        <div className="space-y-8 w-full max-w-4xl">
                                            <a href={r.url} className="block group/link">
                                                <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-primary-text group-hover/link:text-secondary-text transition-colors leading-tight">
                                                    {r.meta?.title || "Untitled"}
                                                </h2>
                                            </a>

                                            <div className="space-y-8">
                                                <div 
                                                    className="text-lg md:text-xl font-light text-secondary-text leading-relaxed prose prose-lg dark:prose-invert prose-p:my-0 prose-mark:bg-black/5 dark:prose-mark:bg-white/10 prose-mark:text-primary-text prose-mark:font-medium prose-mark:px-1.5 prose-mark:py-0.5 prose-mark:rounded-md line-clamp-4"
                                                    dangerouslySetInnerHTML={{ __html: r.excerpt }}
                                                />

                                                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest opacity-60 dark:opacity-80">
                                                    <span>
                                                        {getCategoryFromUrl(r.url)}
                                                    </span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-50 transition-all group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </SpotlightCard>
                            </motion.div>
                        ))}
                    </div>
                ) : query.trim() !== "" ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 flex flex-col justify-center opacity-60 max-w-2xl"
                    >
                        <p className="text-secondary-text font-serif text-3xl md:text-4xl italic mb-6">
                            The archive returns nothing.
                        </p>
                        <p className="text-sm md:text-base font-sans font-light text-secondary-text leading-relaxed">
                            No fragments or articles match your inquiry. Try adjusting your vocabulary or navigating manually.
                        </p>
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
}
