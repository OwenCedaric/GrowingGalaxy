import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightUpLine, RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import CityRoadMap from './CityRoadMap';
import ShinyText from '../ui/ShinyText';

export interface TraceDestination {
    id: string;
    name: string; // Title / Site name
    siteName?: string;
    environment?: string;
    description: string;
    photos: string[];
    detailUrl: string;
    coordinates: string; // for the map
    dateStr: string;
}

export interface TraceYear {
    year: number;
    destinations: TraceDestination[];
}

interface TracesExplorerProps {
    data: TraceYear[];
}

export default function TracesExplorer({ data }: TracesExplorerProps) {
    const [activeYear, setActiveYear] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const y = new URLSearchParams(window.location.search).get('year');
            if (y && !isNaN(Number(y)) && data.some(dy => dy.year === Number(y))) return Number(y);
        }
        return data[0]?.year || new Date().getFullYear();
    });

    const [activeDestId, setActiveDestId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const d = new URLSearchParams(window.location.search).get('id');
            if (d) return d;
        }
        return data[0]?.destinations[0]?.id || '';
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPage, setModalPage] = useState(0);
    const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

    // When active year changes, update active destination to the first one in that year
    useEffect(() => {
        const yearData = data.find(y => y.year === activeYear);
        if (yearData && yearData.destinations.length > 0) {
            // Only update if current activeDestId is not in this year
            if (!yearData.destinations.some(d => d.id === activeDestId)) {
                setActiveDestId(yearData.destinations[0].id);
            }
        }
    }, [activeYear, data]);

    const activeYearData = data.find(y => y.year === activeYear);
    const activeDest = activeYearData?.destinations.find(d => d.id === activeDestId) || activeYearData?.destinations[0];

    // Sync state to URL without reloading
    useEffect(() => {
        if (typeof window !== 'undefined' && activeYear && activeDest) {
            const url = new URL(window.location.href);
            url.searchParams.set('year', activeYear.toString());
            url.searchParams.set('id', activeDest.id);
            window.history.replaceState({}, '', url);
        }
    }, [activeYear, activeDest?.id]);

    // Modal Pagination Logic
    const itemsPerPage = 9;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const currentModalYears = data.slice(modalPage * itemsPerPage, (modalPage + 1) * itemsPerPage);

    if (!data || data.length === 0) return <div className="text-center py-20 opacity-50 font-mono text-sm">NO TRACE DATA FOUND</div>;

    return (
        <>
            {/* Ambient Background Map */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10 dark:opacity-[0.18] map-blend transition-opacity duration-1000"
                 style={{
                     maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 85%)',
                     WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 85%)'
                 }}
            >
                <AnimatePresence>
                    {activeDest && (
                        <motion.div
                            key={`bg-map-${activeDest.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="absolute inset-0"
                        >
                            <CityRoadMap
                                siteName={activeDest.siteName || activeDest.name}
                                coordinates={activeDest.coordinates}
                                className="w-full h-full object-cover sm:object-contain"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 mt-2 md:mt-4 pb-4 relative z-10 items-start">

            {/* Y-Axis: Years (Fixed Sidebar) */}
            <aside className="w-full md:w-48 lg:w-52 xl:w-56 flex-shrink-0 relative z-30 h-auto md:sticky md:top-36 md:self-start">
                {/* Desktop: Vertical Timeline with Zero-Jitter Indicator */}
                <div className="hidden md:flex flex-col gap-3 pt-1">
                    {data.map((yearItem) => {
                        const isYearActive = activeYear === yearItem.year;
                        return (
                            <button
                                key={`year-${yearItem.year}`}
                                onClick={() => setActiveYear(yearItem.year)}
                                className={`cursor-pointer text-left font-mono transition-colors duration-200 relative group flex items-center justify-between py-1.5 px-0 w-full ${isYearActive
                                        ? 'text-primary-text font-medium'
                                        : 'text-secondary-text/60 dark:text-zinc-400 hover:text-primary-text dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className={`w-1.5 h-1.5 rounded-full bg-primary-text transition-opacity duration-200 shrink-0 ${
                                        isYearActive ? 'opacity-100' : 'opacity-0'
                                    }`} />
                                    <span className="text-base md:text-lg">{yearItem.year}</span>
                                </div>
                                <span className={`text-[11px] font-mono tabular-nums transition-colors duration-200 ${
                                    isYearActive
                                        ? 'text-secondary-text/80 dark:text-zinc-300 font-medium'
                                        : 'text-secondary-text/50 dark:text-zinc-500 group-hover:text-secondary-text/80 dark:group-hover:text-zinc-300'
                                }`}>
                                    {String(yearItem.destinations.length).padStart(2, '0')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Mobile: Timeline Trigger */}
                <div className="md:hidden relative pt-1 z-30 mb-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="cursor-pointer w-full flex items-center justify-between py-2 font-mono text-[16px] transition-opacity hover:opacity-70 group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-text" />
                            <span className="font-medium text-primary-text">{activeYear}</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60 dark:opacity-80 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-text dark:text-zinc-400">change year</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Right Area: X-Axis + Main Content */}
            <div className="flex-1 min-w-0 flex flex-col w-full relative z-10">

                {/* X-Axis: Destinations (Horizontal scroll tabs, protected against background noise) */}
                <div className="w-full shrink-0 mb-5 overflow-x-auto hide-scrollbar z-20 pb-2 relative">
                    <div className="flex items-baseline gap-6 md:gap-8 min-w-max">
                        {activeYearData?.destinations.map((dest) => {
                            const isActive = activeDestId === dest.id;
                            return (
                                <button
                                    key={`dest-${dest.id}`}
                                    onClick={() => setActiveDestId(dest.id)}
                                    className={`cursor-pointer uppercase tracking-widest font-mono text-xs sm:text-[13px] transition-all duration-200 relative pb-1.5 flex flex-col items-center ${isActive
                                            ? 'text-primary-text font-semibold dark:text-white dark:[text-shadow:_0_1px_8px_rgba(0,0,0,0.9),_0_0_12px_#0a0a0a]'
                                            : 'text-secondary-text/65 dark:text-zinc-400 hover:text-primary-text dark:hover:text-white dark:[text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]'
                                        }`}
                                >
                                    <span>{dest.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeDestUnderline"
                                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary-text dark:bg-white rounded-full shadow-sm"
                                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area: In-place smooth transition */}
                <div className="w-full relative pb-4">
                    <AnimatePresence mode="popLayout">
                        {activeDest && (
                            <motion.div
                                key={activeDest.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="w-full flex flex-col gap-5 sm:gap-6"
                            >
                                {/* Telemetry Metadata Row: Clean Typography */}
                                <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] sm:text-xs">
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        {activeDest.environment && (
                                            <span className="text-primary-text dark:text-zinc-200 font-medium dark:[text-shadow:_0_1px_6px_#0a0a0a]">{activeDest.environment}</span>
                                        )}
                                        {activeDest.environment && activeDest.coordinates && (
                                            <span className="text-secondary-text/40 dark:text-zinc-500">/</span>
                                        )}
                                        {activeDest.coordinates && (
                                            <span className="text-secondary-text dark:text-zinc-300 tracking-tight dark:[text-shadow:_0_1px_6px_#0a0a0a]">{activeDest.coordinates}</span>
                                        )}
                                    </div>

                                    {activeDest.dateStr && (
                                        <span className="text-secondary-text dark:text-zinc-300 font-mono tracking-wide dark:[text-shadow:_0_1px_6px_#0a0a0a]">{activeDest.dateStr}</span>
                                    )}
                                </div>

                                {/* Text Description (Only if present) */}
                                {activeDest.description && (
                                    <p className="text-[15px] md:text-base font-light leading-relaxed md:max-w-4xl text-black/90 dark:text-zinc-200 dark:[text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
                                        {activeDest.description}
                                    </p>
                                )}

                                {/* Photos Grid */}
                                {activeDest.photos && activeDest.photos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                        {activeDest.photos.map((photo, idx) => (
                                            <div
                                                key={`photo-${idx}`}
                                                className="w-full h-[160px] md:h-[200px] lg:h-[155px] rounded-xl overflow-hidden cursor-pointer group relative"
                                                onClick={() => setLightboxPhoto(photo)}
                                                style={idx === 0 ? { viewTransitionName: `trace-img-container-${activeDest.id}` } : undefined}
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`${activeDest.name} - ${idx}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${idx === 0
                                                            ? 'opacity-90 group-hover:opacity-100 dark:opacity-75 dark:group-hover:opacity-100'
                                                            : 'opacity-75 group-hover:opacity-100 dark:opacity-60 dark:group-hover:opacity-100'
                                                        }`}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300 rounded-xl" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Fallback when neither text nor photos exist */}
                                {!activeDest.description && (!activeDest.photos || activeDest.photos.length === 0) && (
                                    <div className="py-8 text-center text-secondary-text/50 font-mono text-xs uppercase tracking-widest">
                                        // COORDINATES_LOGGED // DETAILED ENTRY PENDING
                                    </div>
                                )}

                                {/* Action: View Full Log & Map Attribution */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 pr-1">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-secondary-text/65 dark:text-zinc-400 dark:[text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                                        MAP DATA // © OPENSTREETMAP
                                    </span>
                                    <a 
                                        href={activeDest.detailUrl}
                                        className="group inline-flex items-center gap-1.5 text-xs md:text-[13px] font-mono uppercase tracking-widest text-secondary-text/80 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors duration-300 active:scale-[0.97]"
                                    >
                                        <ShinyText 
                                            text="VIEW FULL LOG" 
                                            speed={3} 
                                            color="rgba(0,0,0,0.6)"
                                            colorDark="rgba(255,255,255,0.7)"
                                            shineColor="rgba(0,0,0,1)"
                                            shineColorDark="rgba(255,255,255,1)"
                                        />
                                        <RiArrowRightUpLine className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Modal 3x3 Selector */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[200] md:hidden bg-white/96 dark:bg-[#09090b]/96 backdrop-blur-xl flex flex-col justify-center items-center px-6"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {/* Label */}
                            <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-6" onClick={e => e.stopPropagation()}>
                                Select Year
                            </p>

                            {/* 3x3 Grid */}
                            <div
                                className="grid grid-cols-3 w-full max-w-[300px] bg-black/[0.025] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-3xl p-2 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {currentModalYears.map((yearItem) => (
                                    <button
                                        key={`modal-year-${yearItem.year}`}
                                        onClick={() => {
                                            setActiveYear(yearItem.year);
                                            setIsModalOpen(false);
                                            setModalPage(0);
                                        }}
                                        className={`aspect-square flex items-center justify-center rounded-2xl font-mono text-xl transition-all duration-200 relative ${activeYear === yearItem.year
                                                ? 'text-black dark:text-white font-bold bg-black/5 dark:bg-white/8'
                                                : 'text-black/50 dark:text-white/50 active:bg-black/5 dark:active:bg-white/5'
                                            }`}
                                    >
                                        {yearItem.year}
                                        {activeYear === yearItem.year && (
                                            <motion.div
                                                layoutId="activeMobileYearIndicator"
                                                className="absolute bottom-[22%] w-5 h-[1.5px] bg-black dark:bg-white rounded-full"
                                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div
                                    className="flex items-center gap-8 mt-10 font-mono text-xs tracking-widest opacity-60"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => setModalPage(p => Math.max(0, p - 1))}
                                        disabled={modalPage === 0}
                                        className="p-2 transition-all disabled:opacity-20 flex items-center gap-1 active:scale-90"
                                    >
                                        <RiArrowLeftSLine className="w-4 h-4" /> PREV
                                    </button>

                                    <span className="opacity-60 tabular-nums">
                                        {String(modalPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                                    </span>

                                    <button
                                        onClick={() => setModalPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={modalPage === totalPages - 1}
                                        className="p-2 transition-all disabled:opacity-20 flex items-center gap-1 active:scale-90"
                                    >
                                        NEXT <RiArrowRightSLine className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>, document.body)}

            {/* Lightbox Overlay */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {lightboxPhoto && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/92 dark:bg-black/92 backdrop-blur-2xl p-4 md:p-12 cursor-zoom-out"
                            onClick={() => setLightboxPhoto(null)}
                        >
                            <button
                                className="absolute top-5 right-5 p-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-[101] border border-black/5 dark:border-white/5"
                                aria-label="Close lightbox"
                            >
                                <RiCloseLine className="w-5 h-5 text-black dark:text-white" />
                            </button>
                            <motion.img
                                initial={{ scale: 0.92, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.92, opacity: 0 }}
                                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                                src={lightboxPhoto}
                                alt="Zoomed trace"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>, document.body)}

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            </div>
        </>
    );
}
