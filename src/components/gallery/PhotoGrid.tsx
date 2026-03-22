import React, { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { PhotoCard } from '@/components/gallery/PhotoCard';
import type { PhotoEntry } from '@/types/photo';
import { Loader2 } from 'lucide-react';
import FadeContent from '@/components/reactbits/FadeContent';

interface PhotoGridProps {
    photos: PhotoEntry[];
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const ITEMS_PER_PAGE = isMobile ? 2 : 8;
    const INITIAL_COUNT = isMobile ? 4 : 16;

    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const visiblePhotos = photos.slice(0, visibleCount);
    const hasMore = visibleCount < photos.length;

    // Breakpoints for masonry columns to simulate fixed-width items
    const breakpointColumnsObj = {
        default: 4,
        1536: 4, // 2xl: ~300px per col
        1280: 3, // lg: ~400px per col
        768: 2,  // md: ~350px per col
        640: 1   // sm: full width
    };

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isLoading) {
                setIsLoading(true);
            }
        }, { rootMargin: isMobile ? '400px' : '200px' });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, visibleCount, isLoading]);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, photos.length));
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, photos.length]);

    if (photos.length === 0) {
        return (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-300 font-light tracking-wide">
                No photos or formatting matched.
            </div>
        );
    }

    return (
        <div className="relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                .my-masonry-grid {
                    display: flex;
                    margin-left: -24px; /* gutter size offset */
                    width: auto;
                }
                .my-masonry-grid_column {
                    padding-left: 24px; /* gutter size */
                    background-clip: padding-box;
                }
                /* Style your items */
                .my-masonry-grid_column > * {
                    margin-bottom: 24px;
                    display: block;
                }
            `}} />

            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {visiblePhotos.map((photo, i) => {
                    const batchIndex = i % ITEMS_PER_PAGE;
                    const col = batchIndex % 4;
                    const row = Math.floor(batchIndex / 4);
                    const staggerDelay = (row * 0.12) + (col * 0.08);
                    return (
                        <FadeContent
                            key={photo.slug}
                            blur={true}
                            duration={800}
                            delay={staggerDelay}
                            ease="power3.out"
                            initialOpacity={0}
                            translateY={30}
                        >
                            <PhotoCard photo={photo} />
                        </FadeContent>
                    );
                })}
            </Masonry>

            {/* Infinite Scroll target */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-12 flex justify-center items-center h-32">
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                    ) : (
                        <div className="w-1 h-1" />
                    )}
                </div>
            )}
        </div>
    );
};
