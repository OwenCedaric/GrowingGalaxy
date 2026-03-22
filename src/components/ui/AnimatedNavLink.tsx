import React from "react";
import { motion } from "framer-motion";

interface AnimatedNavLinkProps {
    href: string;
    text: string;
    className?: string;
    isLogo?: boolean;
}

export default function AnimatedNavLink({ href, text, className = "", isLogo = false }: AnimatedNavLinkProps) {
    const baseClasses = isLogo
        ? "text-sm font-medium hover:text-black dark:hover:text-white transition-colors block px-2 py-1 relative overflow-hidden group"
        : "text-sm font-medium text-secondary-text dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors relative group block px-2 py-1 overflow-hidden";

    const DURATION = 0.3;
    const STAGGER = 0.02;

    return (
        <a href={href} className={`${baseClasses} ${className}`}>
            <motion.div
                initial="initial"
                whileHover="hover"
                className="relative flex items-center justify-center whitespace-nowrap"
            >
                {/* Visible Text (slides up and fades out) */}
                <span className="relative flex overflow-hidden">
                    {text.split("").map((l, i) => (
                        <motion.span
                            variants={{
                                initial: { y: 0 },
                                hover: {
                                    y: "-110%",
                                },
                            }}
                            transition={{
                                duration: DURATION,
                                ease: "easeInOut",
                                delay: STAGGER * i,
                            }}
                            key={i}
                            className="inline-block"
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    ))}
                </span>

                {/* Hidden Text (slides up from bottom) */}
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden h-full">
                    {text.split("").map((l, i) => (
                        <motion.span
                            variants={{
                                initial: { y: "110%" },
                                hover: {
                                    y: 0,
                                },
                            }}
                            transition={{
                                duration: DURATION,
                                ease: "easeInOut",
                                delay: STAGGER * i,
                            }}
                            key={i}
                            className="inline-block"
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    ))}
                </span>
            </motion.div>

            {!isLogo && (
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black/50 dark:bg-white/50 transition-all duration-300 group-hover:w-full" />
            )}
        </a>
    );
}
