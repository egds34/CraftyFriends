"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Squircle } from "@/components/ui/squircle";
import { cn } from "@/lib/utils";

interface PillowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Classes to apply to the disconnected shadow background (mostly for color) */
    shadowClassName?: string;
    /** Classes to apply to the inner Squircle content container */
    contentClassName?: string;
    /** Tailwind class for top position of shadow (default: top-12) */
    shadowTop?: string;
    /** Tailwind class for bottom position of shadow (default: -bottom-3) */
    shadowBottom?: string;
    /** Tailwind class for left position of shadow (default: left-0) */
    shadowLeft?: string;
    /** Tailwind class for right position of shadow (default: right-0) */
    shadowRight?: string;
    /** If true, triggers the enter animation immediately on mount instead of waiting for viewport */
    animateOnMount?: boolean;
    /** Force the hover state externally */
    forceHover?: boolean;
}

export function PillowCard({
    children,
    className,
    shadowClassName,
    contentClassName,
    shadowTop = "top-12",
    shadowBottom = "-bottom-3",
    shadowLeft = "left-[2px]",
    shadowRight = "right-[2px]",
    noHover = false,
    animateOnMount = false,
    forceHover = false,
    ...props
}: PillowCardProps & { noHover?: boolean }) {
    const [animationState, setAnimationState] = useState<'idle' | 'enter' | 'rest'>('idle');
    const [internalIsHovered, setInternalIsHovered] = useState(false);

    const isHovered = forceHover || internalIsHovered;

    const wobbleKeyframes = {
        scaleX: [1, 1.08, 0.95, 1.02, 0.99, 1],
        scaleY: [1, 0.92, 1.05, 0.98, 1.01, 1],
        x: [0, -2, 2, -1, 1, 0],
    };

    const wobbleTransition = {
        duration: 0.8,
        ease: "circOut" as const,
        delay: 0.1
    };

    // Handle force animation on mount
    React.useEffect(() => {
        if (animateOnMount && animationState === 'idle') {
            setAnimationState('enter');
        }
    }, [animateOnMount, animationState]);

    // Determine the current variant for the shadow
    const shadowVariant = !noHover && isHovered ? 'hover' : animationState === 'idle' ? 'idle' : animationState;

    return (
        <motion.div
            className={cn("relative z-0 bg-transparent", className)}
            onHoverStart={() => !noHover && setInternalIsHovered(true)}
            onHoverEnd={() => !noHover && setInternalIsHovered(false)}
            onViewportEnter={() => {
                if (animationState === 'idle') setAnimationState('enter');
            }}
            viewport={{ once: true }}
            whileHover={!noHover && !forceHover ? "hover" : undefined}
            initial="hidden"
            exit="exit"
            animate={isHovered ? 'hover' : (animationState === 'idle' ? 'hidden' : 'visible')}
            variants={{
                hidden: { scale: 0, opacity: 0 },
                idle: { scale: 1, opacity: 1 },
                visible: { scale: 1, opacity: 1 },
                hover: { scale: 1.03, opacity: 1 },
                exit: {
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.2 }
                }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props as any}
        >
            {/* Disconnected Shadow */}
            <motion.div
                animate={shadowVariant}
                exit="exit"
                variants={{
                    hidden: { opacity: 0, scale: 0 },
                    idle: { opacity: 0, scale: 0 },
                    enter: {
                        opacity: 1,
                        scale: 1,
                        ...wobbleKeyframes,
                        transition: {
                            opacity: { duration: 0.3, delay: 0.1 },
                            scale: { duration: 0.4, delay: 0.1 },
                            scaleX: wobbleTransition,
                            scaleY: wobbleTransition,
                            x: { ...wobbleTransition, ease: "easeInOut" }
                        }
                    },
                    rest: {
                        opacity: 1,
                        scale: 1,
                        scaleX: 1,
                        scaleY: 1,
                        x: 0,
                        transition: { duration: 0.3, ease: "easeOut" } // Smooth return to normal
                    },
                    hover: {
                        opacity: 1,
                        scale: 1,
                        ...wobbleKeyframes,
                        transition: {
                            scaleX: wobbleTransition,
                            scaleY: wobbleTransition,
                            x: { ...wobbleTransition, ease: "easeInOut" }
                        }
                    },
                    exit: {
                        opacity: 0,
                        scale: 0,
                        transition: { duration: 0.2 }
                    }
                }}
                onAnimationComplete={(definition) => {
                    // When the entrance animation completes, switch to 'rest' state
                    if (definition === 'enter') {
                        setAnimationState('rest');
                    }
                }}
                className={cn(
                    "absolute rounded-[40px] -z-10",
                    shadowTop,
                    shadowBottom,
                    shadowLeft,
                    shadowRight,
                    shadowClassName
                )}
            />

            {/* Main squircle card */}
            <Squircle
                cornerRadius={65}
                cornerSmoothing={1}
                className={cn(
                    "w-full h-full backdrop-blur-md border border-white/20 overflow-hidden",
                )}
            >
                {/* Animated Background Tint Layer */}
                <motion.div
                    animate={isHovered || animationState !== 'idle' ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                        "absolute inset-0 pointer-events-none",
                        "bg-white/80 dark:bg-white/90"
                    )}
                />

                {/* Content Layer */}
                <div className={cn("relative z-10 w-full h-full p-8 dark:text-black", contentClassName)}>
                    {children}
                </div>
            </Squircle>
        </motion.div>
    );
}
