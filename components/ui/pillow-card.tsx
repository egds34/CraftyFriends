import React, { useState } from "react";
import { motion } from "framer-motion";
import { Squircle } from "@/components/ui/squircle";
import { cn } from "@/lib/utils";
import { InteractiveHoverBar } from "@/components/ui/interactive-hover-bar";


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
    /** If true, forces the card into its hover state */
    forceHover?: boolean;
    /** If true, disables the hover effect */
    noHover?: boolean;
    /** If true, removes the disconnected shadow element behind the card */
    noShadow?: boolean;
}

export function PillowCard({
    children,
    className,
    shadowClassName,
    contentClassName,
    shadowTop = "top-12",
    shadowBottom = "-bottom-3",
    shadowLeft = "left-[1px]",
    shadowRight = "right-[1px]",
    noHover = false,
    noShadow = false,
    animateOnMount = false,
    forceHover = false,
    ...props
}: PillowCardProps) {
    const [animationState, setAnimationState] = useState<'idle' | 'enter' | 'rest'>('idle');
    const [internalHover, setInternalHover] = useState(false);

    const isHovered = internalHover || forceHover;

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
    const shadowVariant = !noHover && isHovered ? 'hover' : animationState;

    return (
        <motion.div
            className={cn("relative z-0 bg-transparent", className)}
            onHoverStart={() => !noHover && setInternalHover(true)}
            onHoverEnd={() => !noHover && setInternalHover(false)}
            onViewportEnter={() => {
                if (animationState === 'idle') setAnimationState('enter');
            }}
            viewport={{ once: true }}
            whileHover={!noHover ? "hover" : undefined}
            initial="idle"
            animate={animationState === 'idle' ? 'idle' : 'visible'}
            variants={{
                idle: { scale: 1 },
                visible: { scale: 1 },
                hover: { scale: 1.03 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props as any}
        >
            {/* Disconnected Shadow */}
            {!noShadow && (
                <motion.div
                    animate={shadowVariant}
                    variants={{
                        idle: { opacity: 0, scale: 0.8 },
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
                        "dark:shadow-[0_0_20px_rgba(255,255,255,0.08)]", // Initial subtle baseline glow
                        shadowTop,
                        shadowBottom,
                        shadowLeft,
                        shadowRight,
                        shadowClassName
                    )}
                />
            )}

            {/* Main squircle card */}
            <Squircle
                cornerRadius={65}
                cornerSmoothing={1}
                className={cn(
                    "w-full h-full backdrop-blur-md overflow-hidden",
                )}
            >
                {/* Animated Background Tint Layer */}
                <motion.div
                    animate={isHovered || animationState !== 'idle' ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                        "absolute inset-0 pointer-events-none",
                        "bg-white/80 dark:bg-zinc-900/60"
                    )}
                />

                {/* Content Layer */}
                <div className={cn("relative z-10 w-full h-full p-8 dark:text-slate-100", contentClassName)}>
                    {children}
                </div>
            </Squircle>
        </motion.div>
    );
}

interface PillowButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Tailwind color class for the hover text and border (e.g., 'group-hover:text-amber-500') or bg */
    highlightClassName?: string;
}

export function PillowButton({ children, className, highlightClassName, ...props }: PillowButtonProps) {
    // Default to w-full.
    // If the parent has padding (like ProductCard), the consumer must provide negative margins via className
    // to break out of the container.

    return (
        <InteractiveHoverBar
            className={cn(
                "w-full", // Default width
                "h-20 flex items-center justify-center font-heading font-black text-lg uppercase tracking-widest transition-all duration-300 border-t border-black/5",
                "bg-white/90 dark:bg-black/40 backdrop-blur-md text-black dark:text-white group-hover:text-white mt-auto",
                // Highlight logic: Apply the highlight class when group (card) is hovered.
                highlightClassName || "group-hover:text-primary group-hover:bg-primary/5",
                className
            )}
            {...props}
        >
            {children}
        </InteractiveHoverBar>
    )
}