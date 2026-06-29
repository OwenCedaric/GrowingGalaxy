import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightUpLine, RiCloseLine, RiCalendarLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import AbstractVectorMap from './AbstractVectorMap';
import RemoteDynamicMap from './RemoteDynamicMap';
import ShinyText from '../ui/ShinyText';

export interface TraceDestination {
    id: string;
    name: string; // Title / Site name
    description: string;
    photos: string[];
    detailUrl: string;
    coordinates: string; // for the map
    mapUrl?: string; // specific map svg path
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
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10 dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"
                 style={{
                     maskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 80%)',
                     WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 80%)'
                 }}
            >
                <AnimatePresence mode="wait">
                    {activeDest && (
                        <motion.div
                            key={`bg-map-${activeDest.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }}
                            exit={{ opacity: 0, transition: { duration: 0.4 } }}
                            className="absolute inset-0"
                        >
                            {activeDest.mapUrl ? (
                                <RemoteDynamicMap mapUrl={activeDest.mapUrl} className="w-full h-full object-cover sm:object-contain map-blend" />
                            ) : (
                                <AbstractVectorMap coordinates={activeDest.coordinates} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full h-full flex flex-col md:flex-row gap-6 md:gap-10 mt-2 md:mt-6 pb-4 overflow-hidden relative z-10">

            {/* Y-Axis: Years (Fixed Sidebar) */}
            <aside className="w-full md:w-32 lg:w-40 flex-shrink-0 relative z-30 h-auto md:h-full md:overflow-y-auto hide-scrollbar">
                {/* Desktop: Vertical Timeline */}
                <div className="hidden md:flex flex-col gap-5 pt-2">
                    {data.map((yearItem) => (
                        <button
                            key={`year-${yearItem.year}`}
                            onClick={() => setActiveYear(yearItem.year)}
                            className={`cursor-pointer text-left font-mono transition-all duration-300 relative group flex items-center gap-3 py-1 ${activeYear === yearItem.year
                                    ? 'text-lg md:text-[19px] text-black dark:text-white font-medium'
                                    : 'text-base md:text-[17px] text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60'
                                }`}
                        >
                            {yearItem.year}
                        </button>
                    ))}
                </div>

                {/* Mobile: Timeline Trigger */}
                <div className="md:hidden relative pt-2 z-30">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="cursor-pointer w-full flex items-center justify-between pb-3 border-b border-black/20 dark:border-white/20 font-mono text-[17px] transition-opacity hover:opacity-70 group"
                    >
                        <span className="font-medium">{activeYear}</span>
                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-80 transition-opacity">
                            <span className="text-[9px] font-mono uppercase tracking-widest">change</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Right Area: X-Axis + Main Content (Takes remaining space) */}
            <div className="flex-1 min-w-0 flex flex-col h-full relative z-10">

                {/* X-Axis: Destinations (Fixed at top of right pane) */}
                <div className="w-full shrink-0 mb-5 overflow-x-auto hide-scrollbar z-20 pt-1 pb-3 relative">
                    <div className="flex items-baseline gap-5 md:gap-8 min-w-max">
                        {activeYearData?.destinations.map((dest) => {
                            const isActive = activeDestId === dest.id;
                            return (
                                <button
                                    key={`dest-${dest.id}`}
                                    onClick={() => setActiveDestId(dest.id)}
                                    className={`cursor-pointer uppercase tracking-widest transition-all duration-300 relative pb-3 group flex flex-col items-center ${isActive
                                            ? 'text-lg md:text-[19px] font-medium text-black dark:text-white'
                                            : 'text-base md:text-[17px] font-mono text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80'
                                        }`}
                                    style={isActive ? { viewTransitionName: `trace-title-${dest.id}` } : undefined}
                                >
                                    {dest.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto hide-scrollbar relative pb-4">
                    <AnimatePresence mode="wait">
                        {activeDest && (
                            <motion.div
                                key={activeDest.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                className="w-full flex flex-col gap-8"
                            >
                                {/* Top Section: Text, Button, and Photos */}
                                <div className="flex flex-col gap-7 relative">
                                    <p className="text-[15px] md:text-base font-light leading-relaxed opacity-90 md:max-w-4xl text-black/80 dark:text-white/80">
                                        {activeDest.description}
                                    </p>

                                    {/* Photos Grid (Strictly max 3 thumbnails) */}
                                    {activeDest.photos && activeDest.photos.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                            {activeDest.photos.map((photo, idx) => (
                                                <div
                                                    key={`photo-${idx}`}
                                                    className="w-full h-[160px] md:h-[200px] lg:h-[150px] rounded-xl overflow-hidden cursor-pointer group relative ring-1 ring-black/5 dark:ring-white/5"
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
                                                    {/* Hover overlay hint */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300 rounded-xl" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end mt-1 pr-4 sm:pr-6">
                                        <a 
                                            href={activeDest.detailUrl}
                                            className="group inline-flex items-center gap-[4px] md:gap-[6px] text-xs md:text-[13px] font-medium tracking-[0.08em] uppercase text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-300 active:scale-[0.97]"
                                        >
                                            <span className="relative inline-block pb-[3px]">
                                                <ShinyText 
                                                    text="VIEW FULL LOG" 
                                                    speed={3} 
                                                    color="rgba(0,0,0,0.5)"
                                                    colorDark="rgba(255,255,255,0.5)"
                                                    shineColor="rgba(0,0,0,1)"
                                                    shineColorDark="rgba(255,255,255,1)"
                                                />
                                                <span className="absolute bottom-[1px] left-0 w-full h-[1px] bg-black/50 dark:bg-white/50 scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100" />
                                            </span>
                                            <RiArrowRightUpLine className="w-[15px] h-[15px] mb-[2px] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        </a>
                                    </div>
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
