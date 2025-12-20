"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PillowCard } from "@/components/ui/pillow-card"
import { cn } from "@/lib/utils"

interface PillowDrawerProps {
    children: React.ReactNode
    drawerContent: React.ReactNode
    className?: string
    contentClassName?: string
    colors?: {
        bg?: string
        hover?: string
        text?: string
        ring?: string
    }
    footerDots?: boolean
    onOpenChange?: (isOpen: boolean) => void
}

export function PillowDrawer({
    children,
    drawerContent,
    className,
    contentClassName,
    colors = {
        bg: "bg-primary/20",
        hover: "hover:bg-primary/30",
        text: "text-primary",
        ring: "focus:ring-primary/50"
    },
    footerDots = true,
    onOpenChange
}: PillowDrawerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [zIndex, setZIndex] = useState(1)
    const [isWobbling, setIsWobbling] = useState(false)
    const [spacerHeight, setSpacerHeight] = useState("8.25rem") // Default based on typical usage
    const drawerRef = useRef<HTMLDivElement>(null)
    const mainCardRef = useRef<HTMLDivElement>(null)

    // Notify parent of interaction state changes
    useEffect(() => {
        onOpenChange?.(isDrawerOpen)
    }, [isDrawerOpen, onOpenChange])

    // Update spacer height dynamically based on main card height
    useEffect(() => {
        if (!mainCardRef.current) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Determine spacer height: Card Height - Drawer Top Offset (3rem/48px)
                // We clamp it to a minimum to avoid negative values
                const height = Math.max(0, entry.contentRect.height - 48)
                setSpacerHeight(`${height}px`)
            }
        })

        observer.observe(mainCardRef.current)
        return () => observer.disconnect()
    }, [])

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setIsDrawerOpen(false)
            }
        }
        if (isDrawerOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isDrawerOpen])

    // Manage Z-index to bring opened drawers to front
    useEffect(() => {
        if (isDrawerOpen) {
            setZIndex(50)
        } else {
            setZIndex(prev => prev === 50 ? 20 : prev)
        }
    }, [isDrawerOpen])

    // Trigger wobble animation on close
    const prevIsOpen = useRef(isDrawerOpen)
    useEffect(() => {
        if (prevIsOpen.current && !isDrawerOpen) {
            setIsWobbling(true)
            const timer = setTimeout(() => setIsWobbling(false), 800)
            return () => clearTimeout(timer)
        }
        prevIsOpen.current = isDrawerOpen
    }, [isDrawerOpen])

    // Trigger wobble on mount
    useEffect(() => {
        const timer1 = setTimeout(() => setIsWobbling(true), 200)
        const timer2 = setTimeout(() => setIsWobbling(false), 1000)
        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [])

    const wobbleKeyframes = {
        scaleX: [1, 1.08, 0.95, 1.02, 0.99, 1],
        scaleY: [1, 0.92, 1.05, 0.98, 1.01, 1],
        x: [0, -2, 2, -1, 1, 0],
    };

    return (
        <div
            ref={drawerRef}
            className={cn("relative z-10 group/card flex flex-col min-w-0 pb-6", className)}
            style={{ zIndex }}
            onMouseEnter={() => {
                setIsHovered(true)
                if (!isDrawerOpen && !isWobbling) {
                    setIsWobbling(true)
                    setTimeout(() => setIsWobbling(false), 800)
                }
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                layout
                onAnimationComplete={() => !isDrawerOpen && setZIndex(1)}
                initial={{ scale: 0, opacity: 0 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                animate={{
                    opacity: 1,
                    height: isDrawerOpen ? "auto" : "calc(100% - 3.75rem)",
                    scale: (isHovered && !isDrawerOpen) ? 1.03 : 1,
                    ...(isWobbling && !isDrawerOpen ? wobbleKeyframes : {})
                }}
                variants={{
                    hidden: { scaleX: 0.5, scaleY: 0.5, x: 0 },
                    visible: {
                        scaleX: [0.5, 1.08, 0.95, 1.02, 0.99, 1],
                        scaleY: [0.5, 0.92, 1.05, 0.98, 1.01, 1],
                        x: [0, -2, 2, -1, 1, 0],
                        transition: {
                            scaleX: { duration: 1, ease: "easeOut", times: [0, 0.3, 0.5, 0.7, 0.85, 1] },
                            scaleY: { duration: 1, ease: "easeOut", times: [0, 0.3, 0.5, 0.7, 0.85, 1] },
                            x: { duration: 0.8, ease: "easeInOut", delay: 0.1 }
                        }
                    }
                }}
                transition={{
                    default: { type: "spring", stiffness: 400, damping: 30 },
                    scaleX: { duration: 0.8, ease: "easeInOut" },
                    scaleY: { duration: 0.8, ease: "easeInOut" },
                    x: { duration: 0.8, ease: "easeInOut" }
                }}
                className={cn(
                    "absolute top-12 left-1 right-1 backdrop-blur-md rounded-[40px] z-[-1] flex flex-col overflow-hidden cursor-pointer transition-colors",
                    colors.bg,
                    colors.hover
                )}
            >
                {/* Spacer to push drawer content below the main card */}
                <div
                    className="flex-shrink-0 w-full"
                    style={{ height: spacerHeight }}
                />

                <AnimatePresence>
                    {isDrawerOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-3 pb-8 pt-3 flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {drawerContent}
                        </motion.div>
                    )}
                </AnimatePresence>

                {footerDots && (
                    <div className={cn("absolute bottom-1 w-full flex justify-center gap-1", colors.text)}>
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                    </div>
                )}
            </motion.div>

            <div ref={mainCardRef} className="h-full w-full relative z-10">
                <PillowCard
                    className="h-full w-full cursor-pointer"
                    contentClassName={cn("p-0", contentClassName)}
                    shadowClassName="hidden"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    animateOnMount={true}
                    forceHover={isHovered}
                >
                    {children}
                </PillowCard>
            </div>
        </div>
    )
}
