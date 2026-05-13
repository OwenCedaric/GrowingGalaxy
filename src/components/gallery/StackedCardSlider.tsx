import React, { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

interface StackedCardSliderProps {
    images?: { url: string; alt?: string; description?: string }[];
}

export default function StackedCardSlider({ images = [] }: StackedCardSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dimensions, setDimensions] = useState<Record<number, { w: number, h: number }>>({});
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const [expandedTextIndex, setExpandedTextIndex] = useState<number | null>(null);

    React.useEffect(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 如果没有传入图片，则使用灰色占位块作为卡片内容
    const data = images.length > 0 
        ? images 
        : Array.from({ length: 5 }, (_, i) => ({ url: "", alt: `Card ${i + 1}`, description: "" }));

    const handleImageLoad = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setDimensions(prev => ({ ...prev, [index]: { w: naturalWidth, h: naturalHeight } }));
    };

    const handleImageRef = (index: number) => (node: HTMLImageElement | null) => {
        if (node && node.complete && node.naturalWidth > 0) {
            setDimensions(prev => {
                if (prev[index]) return prev;
                return { ...prev, [index]: { w: node.naturalWidth, h: node.naturalHeight } };
            });
        }
    };

    const handleDragEnd = (e: any, info: PanInfo) => {
        const threshold = 50; // 滑动距离阈值
        const velocityThreshold = 500; // 滑动速度阈值

        if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
            // 向左滑动：切换到下一张
            setCurrentIndex((prev) => Math.min(prev + 1, data.length - 1));
            setExpandedTextIndex(null);
        } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
            // 向右滑动：切换到上一张
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
            setExpandedTextIndex(null);
        }
    };

    return (
        <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-transparent">
            {/* 为顶部 Navigation 留出的安全高度 */}
            <div className="h-24 sm:h-32 shrink-0 pointer-events-none"></div>

            {/* 上半部分：卡片展示区，占据剩余的所有可用空间 */}
            <div className="relative w-full flex-1 flex items-center justify-center">
                <AnimatePresence>
                    {data.map((item, index) => {
                        const isCurrent = index === currentIndex;
                        const diff = index - currentIndex;

                        // 性能优化：当图片极多时，仅渲染当前视图附近的卡片，极大减少 DOM 节点和 Framer Motion 动画压力
                        if (Math.abs(diff) > 4) return null;

                        let x = 0;
                        let y = 0;
                        let scale = 1;
                        let rotate = 0;
                        let zIndex = data.length - Math.abs(diff); 
                        let opacity = 1;

                        if (diff < 0) {
                            x = diff * 50 - 20; 
                            y = Math.abs(diff) * 20; // 稍微减小y轴偏移，防止碰到底部
                            rotate = diff * 3; 
                            scale = 1 - Math.abs(diff) * 0.06;
                            opacity = Math.abs(diff) > 3 ? 0 : 1 - Math.abs(diff) * 0.2;
                        } else if (diff === 0) {
                            x = 0;
                            y = 0;
                            rotate = 0;
                            scale = 1;
                            opacity = 1;
                        } else {
                            x = diff * 40 + 20; 
                            y = diff * 15; 
                            rotate = diff * 2; 
                            scale = 1 - diff * 0.05;
                            opacity = diff > 3 ? 0 : 1 - diff * 0.15;
                        }

                        const dim = dimensions[index];

                        let cardClass = `absolute rounded-2xl flex items-center justify-center overflow-hidden will-change-transform bg-zinc-200 ${!isCurrent ? 'cursor-pointer' : ''}`;
                        let cardStyle: React.CSSProperties = {
                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            backgroundColor: item.url ? "#fff" : "#e4e4e7",
                            transformOrigin: "center",
                        };

                        if (!item.url) {
                            cardClass += " w-[60vw] sm:w-[30vw] aspect-[3/4]";
                        } else if (dim && viewport.width > 0) {
                            const ratio = dim.w / dim.h;
                            
                            const isSm = viewport.width >= 640;
                            const isLg = viewport.width >= 1024;
                            
                            // Define max boundaries
                            const maxW = isLg ? 800 : (isSm ? viewport.width * 0.8 : viewport.width * 0.85);
                            const maxH = isLg ? 600 : (isSm ? viewport.height * 0.7 : viewport.height * 0.6);

                            if (ratio >= 1) {
                                // Landscape or Square: start by fixing width
                                let targetW = maxW;
                                let targetH = targetW / ratio;
                                
                                if (targetH > maxH) {
                                    targetH = maxH;
                                    targetW = targetH * ratio;
                                }
                                
                                cardStyle.width = targetW;
                                cardStyle.height = targetH;
                            } else {
                                // Portrait: start by fixing height
                                let targetH = maxH;
                                let targetW = targetH * ratio;
                                
                                if (targetW > maxW) {
                                    targetW = maxW;
                                    targetH = targetW / ratio;
                                }
                                
                                cardStyle.width = targetW;
                                cardStyle.height = targetH;
                            }
                        } else {
                            // Default size before load
                            cardClass += " h-[60vh] sm:h-[70vh] max-h-[560px] aspect-[3/4]";
                        }

                        return (
                            <motion.div
                                key={index}
                                className={cardClass}
                                style={cardStyle}
                                initial={false}
                                animate={{ x, y, rotate, scale, zIndex, opacity }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                drag={isCurrent ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={isCurrent ? handleDragEnd : undefined}
                                onClick={() => {
                                    if (!isCurrent) {
                                        setCurrentIndex(index);
                                        setExpandedTextIndex(null);
                                    }
                                }}
                            >
                                {item.url ? (
                                    <>
                                        <img 
                                            ref={handleImageRef(index)}
                                            src={item.url} 
                                            alt={item.alt || ""} 
                                            onLoad={(e) => handleImageLoad(index, e)}
                                            className="w-full h-full object-cover pointer-events-none block" 
                                        />
                                        {/* 文字叠加层 */}
                                        {item.description && (() => {
                                            const hasMoreContent = item.description.trim().includes('\n') || item.description.length > 35;
                                            return (
                                                <div 
                                                    className={`absolute bottom-0 left-0 right-0 transition-all duration-300 flex flex-col justify-end ${
                                                        expandedTextIndex === index
                                                            ? "p-6 sm:p-8 pt-8 bg-black/50 backdrop-blur-2xl backdrop-saturate-200 max-h-[90%] overflow-y-auto cursor-pointer rounded-t-2xl border-t border-white/10" 
                                                            : `p-4 sm:p-6 pt-32 bg-transparent border-t border-transparent ${hasMoreContent ? 'cursor-pointer' : ''}`
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isCurrent && hasMoreContent) {
                                                            setExpandedTextIndex(expandedTextIndex === index ? null : index);
                                                        } else if (isCurrent && expandedTextIndex === index) {
                                                            setExpandedTextIndex(null);
                                                        }
                                                    }}
                                                    style={{ pointerEvents: isCurrent ? "auto" : "none" }}
                                                >
                                                    {/* Soft faded glass background for collapsed state */}
                                                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                                                        expandedTextIndex === index ? "opacity-0" : "opacity-100"
                                                    }`}>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent backdrop-blur-md backdrop-saturate-150 [mask-image:linear-gradient(to_top,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent_100%)]" />
                                                    </div>

                                                    {expandedTextIndex === index ? (
                                                        <p className="relative z-10 text-white text-sm sm:text-base font-light leading-snug sm:leading-relaxed text-shadow-sm whitespace-pre-wrap mt-auto animate-in fade-in duration-300">
                                                            {item.description}
                                                        </p>
                                                    ) : (
                                                        <div className="relative z-10 flex items-center justify-between w-full animate-in fade-in duration-300 text-white">
                                                            <div className={`text-white text-xs sm:text-sm font-light drop-shadow-md ${hasMoreContent ? 'truncate mr-4' : 'whitespace-pre-wrap'}`}>
                                                                {hasMoreContent ? item.description.split('\n')[0] : item.description}
                                                            </div>
                                                            {hasMoreContent && (
                                                                <div className="text-white opacity-80 text-[10px] sm:text-xs font-mono uppercase tracking-widest shrink-0 drop-shadow-md">
                                                                    More +
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="text-zinc-500 font-medium text-xl pointer-events-none">{item.alt}</div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Interaction Guide */}
            <motion.div 
                className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
            >
                <span className="animate-pulse">←</span>
                <span>Drag to Explore</span>
                <span className="animate-pulse">→</span>
            </motion.div>
        </div>
    );
}
