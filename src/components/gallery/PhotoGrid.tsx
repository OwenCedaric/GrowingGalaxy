import React, { useState, useEffect, useRef } from 'react';
import { PhotoCard } from '@/components/gallery/PhotoCard';
import type { PhotoEntry } from '@/types/photo';
import { RiLoader4Line } from '@remixicon/react';

interface PhotoGridProps {
    photos: PhotoEntry[];
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const visiblePhotos = photos.slice(0, visibleCount);
    const hasMore = visibleCount < photos.length;

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isLoading) {
                setIsLoading(true);
            }
        }, { rootMargin: '300px' });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, visibleCount, isLoading]);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setVisibleCount((prev) => Math.min(prev + 6, photos.length));
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading, photos.length]);

    if (photos.length === 0) {
        return (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-300 font-light tracking-wide">
                No collections found.
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* 3~4 Column Compact Navigation Grid (Uniform 16:10 Aspect, ~240px Height, Never Stretches Single Albums) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {visiblePhotos.map((photo) => (
                    <PhotoCard key={photo.slug} photo={photo} />
                ))}
            </div>

            {/* Infinite Scroll target */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-12 flex justify-center items-center h-24">
                    {isLoading ? (
                        <RiLoader4Line className="w-5 h-5 animate-spin text-secondary-text" />
                    ) : (
                        <div className="w-1 h-1" />
                    )}
                </div>
            )}
        </div>
    );
};

export default PhotoGrid;
