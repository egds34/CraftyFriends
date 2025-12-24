"use client"

import React, { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveHoverBarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /** The color of the spotlight effect (default: rgba(255,255,255,0.15)) */
    spotlightColor?: string;
}

export function InteractiveHoverBar({
    children,
    className,
    spotlightColor = "rgba(255,255,255,0.25)",
    ...props
}: InteractiveHoverBarProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth out the movement slightly
    const smoothX = useSpring(mouseX, { stiffness: 500, damping: 50 })
    const smoothY = useSpring(mouseY, { stiffness: 500, damping: 50 })

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!containerRef.current) return
        const { left, top } = containerRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - left)
        mouseY.set(e.clientY - top)
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative overflow-hidden group/bar",
                className
            )}
            {...props}
        >
            {/* The Gradient Layer - Follows Mouse */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`radial-gradient(circle 120px at ${smoothX}px ${smoothY}px, ${spotlightColor}, transparent)`,
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
