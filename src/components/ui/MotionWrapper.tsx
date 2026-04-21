import { motion, type Variants, type Easing } from "framer-motion";

interface MotionWrapperProps {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    className?: string;
}

export default function MotionWrapper({
    children,
    delay = 0,
    direction = "up",
    className = "",
}: MotionWrapperProps) {
    const getVariants = (): Variants => {
        const distance = 20;
        const variants: Variants = {
            hidden: {
                opacity: 0,
                y: direction === "up" ? distance : direction === "down" ? -distance : 0,
                x:
                    direction === "left"
                        ? distance
                        : direction === "right"
                            ? -distance
                            : 0,
            },
            visible: {
                opacity: 1,
                y: 0,
                x: 0,
                transition: {
                    duration: 0.5,
                    delay: delay,
                    ease: "easeOut" as Easing,
                },
            },
        };
        return variants;
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={getVariants()}
            className={className}
        >
            {children}
        </motion.div>
    );
}
