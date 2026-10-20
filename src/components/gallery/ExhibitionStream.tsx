import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PhotoEntry } from '@/types/photo';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RiCloseLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiLayoutGridLine,
    RiFocusLine,
    RiFullscreenLine,
} from '@remixicon/react';

interface ExhibitionStreamProps {
    photo: PhotoEntry;
}

export const ExhibitionStream: React.FC<ExhibitionStreamProps> = ({ photo }) => {
    const images = photo.images || [];
    const name = photo.name;

    // View mode: 'stage' (cinema showcase with centered contact strip) or 'wall' (masonry gallery wall)
    const [viewMode, setViewMode] = useState<'stage' | 'wall'>('stage');
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const filmstripRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        document.body.style.overflow = '';
    }, []);

    const prevImage = useCallback(() => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const nextImage = useCallback(() => {
        setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const prevLightbox = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
    }, [lightboxIndex, images.length]);

    const nextLightbox = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
    }, [lightboxIndex, images.length]);

    // Keyboard controls for both stage view and lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') prevLightbox();
                if (e.key === 'ArrowRight') nextLightbox();
            } else if (viewMode === 'stage') {
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'ArrowRight') nextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, closeLightbox, prevLightbox, nextLightbox, viewMode, prevImage, nextImage]);

    // Scroll active thumbnail into view in filmstrip
    useEffect(() => {
        if (filmstripRef.current && viewMode === 'stage') {
            const activeThumb = filmstripRef.current.children[activeIndex] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeIndex, viewMode]);

    if (!images || images.length === 0) return null;

    const currentImage = images[activeIndex];

    return (
        <div className="w-full flex flex-col">
            {/* Top Navigation Bar: Back Link on Left, Mode Switcher on Right */}
            <div className="flex items-center justify-between mb-8 sm:mb-12">
                <a
                    href="/gallery"
                    className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-secondary-text/70 hover:text-primary-text transition-colors duration-200 group"
                >
                    <RiArrowLeftLine className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                    <span>Gallery</span>
                </a>

                {/* Switcher Pill: Pure Minimalist Apple/Editorial Style */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-sm">
                    <button
                        onClick={() => setViewMode('stage')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono tracking-wide transition-all cursor-pointer ${
                            viewMode === 'stage'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm'
                                : 'text-secondary-text hover:text-primary-text'
                        }`}
                        title="Cinema Stage View"
                    >
                        <RiFocusLine className="w-3.5 h-3.5" />
                        <span>Stage</span>
                    </button>
                    <button
                        onClick={() => setViewMode('wall')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono tracking-wide transition-all cursor-pointer ${
                            viewMode === 'wall'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm'
                                : 'text-secondary-text hover:text-primary-text'
                        }`}
                        title="Masonry Wall View"
                    >
                        <RiLayoutGridLine className="w-3.5 h-3.5" />
                        <span>Wall</span>
                    </button>
                </div>
            </div>

            {/* Monograph Editorial Header */}
            <header className="mb-10 sm:mb-14">
                <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40"></span>
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-secondary-text">
                        {photo.location || 'Visual Archive'}
                    </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-primary-text tracking-tight mb-3">
                    {photo.name}
                </h1>
                <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-mono text-secondary-text/65 flex-wrap">
                    {photo.date && <span>{photo.date}</span>}
                    {photo.date && <span>·</span>}
                    <span>{images.length} {images.length === 1 ? 'FRAME' : 'FRAMES'}</span>
                    {photo.author && (
                        <>
                            <span>·</span>
                            <span>BY {photo.author}</span>
                        </>
                    )}
                    {viewMode === 'stage' && (
                        <>
                            <span>·</span>
                            <span className="text-black dark:text-white font-medium">
                                FRAME {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                            </span>
                        </>
                    )}
                </div>
            </header>

            {/* MODE 1: Cinema Stage (Single Frame Spotlight + Centered Contact Strip) */}
            {viewMode === 'stage' && (
                <div className="flex flex-col gap-6 sm:gap-8 w-full">
                    {/* Main Stage Canvas: Pure transparent background, photo stands directly on page canvas with zero dirty letterbox box */}
                    <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] max-h-[820px] flex items-center justify-center bg-transparent rounded-xl overflow-hidden group">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => openLightbox(activeIndex)}
                                className="w-full h-full flex items-center justify-center cursor-zoom-in p-2 sm:p-4 select-none"
                            >
                                <img
                                    src={currentImage.url}
                                    alt={currentImage.alt || `${name} #${activeIndex + 1}`}
                                    loading="eager"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] select-none drop-shadow-sm"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows on Stage: Theme adaptive (white on dark, dark on light) */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                                    aria-label="Previous Frame"
                                >
                                    <RiArrowLeftLine className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                                    aria-label="Next Frame"
                                >
                                    <RiArrowRightLine className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {/* Zoom button on stage */}
                        <button
                            onClick={() => openLightbox(activeIndex)}
                            className="absolute bottom-3 right-3 p-1.5 px-3 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-black/80 dark:text-white/80 border border-black/10 dark:border-white/10 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md z-10"
                        >
                            <RiFullscreenLine className="w-3 h-3" />
                            <span>Expand</span>
                        </button>
                    </div>

                    {/* Centered Filmstrip: Preserves natural aspect ratio without forced cropping */}
                    {images.length > 1 && (
                        <div className="w-full flex justify-center pt-2 sm:pt-4">
                            <div
                                ref={filmstripRef}
                                className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto max-w-full py-2 px-3 scrollbar-none select-none"
                            >
                                {images.map((img, idx) => {
                                    const isActive = idx === activeIndex;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveIndex(idx)}
                                            className={`relative shrink-0 h-14 sm:h-16 md:h-18 rounded-md overflow-hidden transition-all duration-300 cursor-pointer border p-0.5 flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] ${
                                                isActive
                                                    ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 scale-[1.04] opacity-100 shadow-md'
                                                    : 'border-black/10 dark:border-white/10 opacity-40 hover:opacity-80'
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt || `Thumbnail ${idx + 1}`}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                className="h-full w-auto max-w-[120px] object-contain rounded-xs"
                                            />
                                            <span className="absolute bottom-1 right-1 font-mono text-[8px] sm:text-[9px] px-1 rounded bg-black/75 backdrop-blur-sm text-white pointer-events-none">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODE 2: Masonry Wall (True Natural Ratio Waterfall Grid) */}
            {viewMode === 'wall' && (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 w-full pt-2">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => openLightbox(idx)}
                            className="group relative mb-6 break-inside-avoid overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-sm cursor-zoom-in transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-1 select-none flex items-center justify-center"
                        >
                            <img
                                src={img.url}
                                alt={img.alt || `${name} #${idx + 1}`}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            />
                            {/* Discreet frame counter badge on hover */}
                            <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-wider bg-black/60 dark:bg-black/75 backdrop-blur-md text-white/90 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                // {String(idx + 1).padStart(2, '0')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Minimalist Fullscreen Lightbox (Follows Light/Dark Mode, rendered in body portal outside all stacking contexts) */}
            {mounted && createPortal(
                <AnimatePresence>
                    {lightboxIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/98 dark:bg-black/98 backdrop-blur-xl p-4 sm:p-8"
                            onClick={closeLightbox}
                        >
                            {/* Lightbox Controls */}
                            <div
                                className="absolute top-0 left-0 right-0 p-5 sm:p-7 flex items-center justify-between z-20 font-mono text-xs text-black/60 dark:text-white/60 select-none"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40"></span>
                                    <span>
                                        {String(lightboxIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                                    </span>
                                </div>

                                <button
                                    onClick={closeLightbox}
                                    className="p-2 -mr-2 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                                    aria-label="Close Lightbox"
                                >
                                    <RiCloseLine className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Navigation Arrows in Lightbox */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevLightbox();
                                        }}
                                        className="cursor-pointer absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors z-20 backdrop-blur-sm"
                                        aria-label="Previous Image"
                                    >
                                        <RiArrowLeftLine className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextLightbox();
                                        }}
                                        className="cursor-pointer absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors z-20 backdrop-blur-sm"
                                        aria-label="Next Image"
                                    >
                                        <RiArrowRightLine className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Lightbox Image: Adapts perfectly to portrait, landscape, square or panorama */}
                            <div
                                className="relative max-w-full max-h-[85vh] flex flex-col items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={`lightbox-${lightboxIndex}`}
                                        src={images[lightboxIndex].url}
                                        alt={images[lightboxIndex].alt || name}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        referrerPolicy="no-referrer"
                                        className="max-w-[92vw] max-h-[85vh] w-auto h-auto object-contain select-none shadow-2xl shadow-black/10 dark:shadow-none"
                                    />
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ExhibitionStream;
