import React from 'react';
import type { PhotoEntry } from '@/types/photo';
import { RiArrowRightUpLine } from '@remixicon/react';

export const PhotoCard: React.FC<{ photo: PhotoEntry }> = ({ photo }) => {
    const coverUrl = photo.images[0]?.url;

    return (
        <a
            href={`/gallery/${photo.slug}`}
            className="group block relative overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-black/40"
        >
            {/* 16:10 Compact Cover Container */}
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/5 dark:bg-white/5">
                {/* Frame count badge */}
                <div className="absolute top-2.5 right-2.5 z-10 font-mono text-[10px] tracking-wider bg-black/60 dark:bg-black/75 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md border border-white/10 pointer-events-none">
                    // {String(photo.images.length).padStart(2, '0')} {photo.images.length === 1 ? 'FRAME' : 'FRAMES'}
                </div>

                <img
                    src={coverUrl}
                    alt={photo.images[0]?.alt || photo.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
            </div>

            {/* Compact Editorial Metadata (Pure Navigation Focus) */}
            <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif sm:font-sans text-sm sm:text-[15px] font-medium text-primary-text leading-snug truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                        {photo.name}
                    </h3>
                    <RiArrowRightUpLine className="w-3.5 h-3.5 text-secondary-text/40 group-hover:text-primary-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-secondary-text/70 truncate">
                    <span>{photo.date}</span>
                    {photo.location && (
                        <>
                            <span className="opacity-30">•</span>
                            <span className="truncate">{photo.location}</span>
                        </>
                    )}
                </div>
            </div>
        </a>
    );
};

export default PhotoCard;
