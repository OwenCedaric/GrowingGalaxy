import React, { useRef, useEffect, useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import type { PhotoEntry } from '@/types/photo';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

export const PhotoCard: React.FC<{ photo: PhotoEntry }> = ({ photo }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [tagOverflows, setTagOverflows] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const tagContainerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const cardRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!tagContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const el = entries[0].target as HTMLElement;
            setTagOverflows(el.scrollWidth > el.clientWidth);
        });
        observer.observe(tagContainerRef.current);
        return () => observer.disconnect();
    }, [photo.tag]);

    const description = photo.images[0]?.description;
    const coverUrl = photo.images[0]?.url;

    useEffect(() => {
        if (imgRef.current?.complete && isVisible) {
            setIsLoaded(true);
        }
    }, [isVisible]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: isMobile ? '300px' : '600px' }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [isMobile]);

    return (
        <a
            ref={cardRef}
            href={`/gallery/${photo.slug}`}
            className="block relative group overflow-hidden rounded-lg mb-6 break-inside-avoid bg-zinc-100 dark:bg-zinc-800 transition-transform duration-300 hover:scale-[1.01]"
            style={{ minHeight: isMobile ? '200px' : 'auto' }}
        >
            <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.15)" className="w-full h-full rounded-lg">
                <div className={`relative w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 transition-all duration-700 ${!isLoaded ? 'aspect-[4/3]' : ''}`}>
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400 opacity-50" />
                        </div>
                    )}
                    {isVisible && (
                        <img
                            ref={imgRef}
                            src={coverUrl}
                            alt={photo.images[0]?.alt || photo.name}
                            loading="lazy"
                            decoding="async"
                            onLoad={() => setIsLoaded(true)}
                            className={`w-full h-auto object-cover transition-all duration-1000 ease-out 
                            ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'}
                        `}
                        />
                    )}
                </div>

                {/* Hover Overlay - Only functional on non-mobile or when loaded */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 
                ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                ${!isLoaded && !isMobile ? 'hidden' : ''}
            `}>
                    <h3 className="text-white font-medium text-lg leading-snug mb-1 line-clamp-2">
                        {photo.name}
                    </h3>

                    <div className="flex items-center text-white/90 text-sm mb-1">
                        <User className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                        <span className="font-light">{photo.author}</span>
                    </div>

                    {description && (
                        <p className="text-white/80 text-xs mb-3 line-clamp-1 font-light italic">{description}</p>
                    )}

                    {photo.tag && photo.tag.length > 0 && (
                        <div className="relative flex items-center mt-1">
                            <div
                                ref={tagContainerRef}
                                className="flex gap-2 w-full overflow-hidden whitespace-nowrap"
                            >
                                {photo.tag.slice(0, isMobile ? 3 : undefined).map((t, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] whitespace-nowrap"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                            {tagOverflows && !isMobile && (
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
                            )}
                        </div>
                    )}
                </div>
            </SpotlightCard>
        </a>
    );
};
