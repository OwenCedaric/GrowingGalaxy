import React from 'react';
import GlareHover from '@/components/ui/GlareHover';

interface MDXImageProps {
    src?: string;
    alt?: string;
    [key: string]: any;
}

const MDXImage: React.FC<MDXImageProps> = (props) => {
    return (
        <div className="my-12 mx-auto w-fit rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 group">
            <GlareHover
                borderRadius="inherit"
                glareOpacity={0.15}
                transitionDuration={800}
            >
                <img
                    {...props}
                    className="!m-0 max-w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                />
            </GlareHover>
        </div>
    );
};

export default MDXImage;
