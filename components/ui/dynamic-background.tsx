"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function DynamicBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-background dark:bg-zinc-950">
            <div className="absolute inset-0 opacity-30 dark:opacity-20 blur-[100px] pointer-events-none transform-gpu">
                {/* Blob 1 - Purple/Pink - Top Left */}
                <motion.div
                    className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-500/30 mix-blend-multiply dark:mix-blend-screen"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Blob 2 - Cyan/Blue - Top Right */}
                <motion.div
                    className="absolute top-[0%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/30 mix-blend-multiply dark:mix-blend-screen"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />

                {/* Blob 3 - Pink/Rose - Bottom Left */}
                <motion.div
                    className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-pink-500/30 mix-blend-multiply dark:mix-blend-screen"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5,
                    }}
                />

                {/* Blob 4 - Indigo - Bottom Right */}
                <motion.div
                    className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/30 mix-blend-multiply dark:mix-blend-screen"
                    animate={{
                        x: [0, -70, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 28,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 8,
                    }}
                />

                {/* Interactive Center Blob */}
                <motion.div
                    className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-yellow-500/20 mix-blend-multiply dark:mix-blend-screen"
                    animate={{
                        x: [0, 200, -200, 0],
                        y: [0, 150, -150, 0],
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            {/* Noise Texture Overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}
