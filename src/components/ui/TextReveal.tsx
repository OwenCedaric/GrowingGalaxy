import React from "react";
import { motion, type Variants } from "framer-motion";

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    type?: "word" | "char";
    style?: React.CSSProperties;
}

export default function TextReveal({
    text,
    className = "",
    delay = 0,
    type = "word",
    style = {},
}: TextRevealProps) {
    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: delay * 0.1 },
        }),
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    const tokens = React.useMemo(() => {
        const elements: string[] = [];
        let currentWord = "";
        const isCJK = (char: string) => /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7a3]/.test(char);

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === " ") {
                if (currentWord) { elements.push(currentWord); currentWord = ""; }
                elements.push(" ");
            } else if (isCJK(char)) {
                if (currentWord) { elements.push(currentWord); currentWord = ""; }
                elements.push(char);
            } else {
                currentWord += char;
            }
        }
        if (currentWord) elements.push(currentWord);
        return elements;
    }, [text]);

    if (type === "char") {
        let globalCharIndex = 0;
        return (
            <motion.h1
                style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", ...style }}
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={className}
            >
                {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                        {Array.from(token).map((letter) => {
                            const currentIndex = globalCharIndex++;
                            return (
                                <motion.span variants={child} key={currentIndex} style={{ display: "inline-block" }}>
                                    {letter === " " ? "\u00A0" : letter}
                                </motion.span>
                            );
                        })}
                    </span>
                ))}
            </motion.h1>
        );
    }

    // Word split
    const words = text.split(" ");
    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", ...style }}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`flex-wrap ${className}`}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    style={{ marginRight: "0.25em" }}
                    key={index}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
