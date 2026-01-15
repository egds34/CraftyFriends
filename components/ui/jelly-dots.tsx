"use client"

import { motion, useAnimationControls } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

interface JellyDotsProps {
    total: number
    active: number
    onDotClick?: (index: number) => void
    className?: string
}

export function JellyDots({ total, active, onDotClick, className }: JellyDotsProps) {
    const [dotPositions, setDotPositions] = useState<Record<number, { left: number; width: number }>>({})
    const [previousActive, setPreviousActive] = useState<number>(active)
    const [animatingDots, setAnimatingDots] = useState<Set<number>>(new Set())
    const containerRef = useRef<HTMLDivElement>(null)
    const controls = useAnimationControls()

    // Measure dot positions
    useEffect(() => {
        if (!containerRef.current) return

        const positions: Record<number, { left: number; width: number }> = {}
        const dots = containerRef.current.querySelectorAll('[data-dot-index]')

        dots.forEach((dot) => {
            const index = parseInt(dot.getAttribute('data-dot-index') || '0')
            const rect = dot.getBoundingClientRect()
            const containerRect = containerRef.current!.getBoundingClientRect()
            positions[index] = {
                left: rect.left - containerRect.left,
                width: rect.width
            }
        })

        setDotPositions(positions)
    }, [total])

    // Animate when active dot changes
    useEffect(() => {
        if (previousActive === active || !dotPositions[previousActive] || !dotPositions[active]) return

        const oldPos = dotPositions[previousActive]
        const newPos = dotPositions[active]

        // Determine which dots are between old and new position (including destination)
        const minIndex = Math.min(previousActive, active)
        const maxIndex = Math.max(previousActive, active)
        const betweenDots = new Set<number>()
        for (let i = minIndex + 1; i <= maxIndex; i++) {
            betweenDots.add(i)
        }
        setAnimatingDots(betweenDots)

        // Calculate stretched position (encompassing both dots)
        const stretchLeft = Math.min(oldPos.left, newPos.left)
        const stretchRight = Math.max(oldPos.left + oldPos.width, newPos.left + newPos.width)
        const stretchWidth = stretchRight - stretchLeft

        // Stage 1: Stretch to encompass both (Slime effect)
        controls.start({
            left: stretchLeft,
            width: stretchWidth,
            scaleY: 0.6, // Squish down
            transition: {
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1]
            }
        }).then(() => {
            // Stage 2: Fast snap to new position with overshoot
            return controls.start({
                left: newPos.left,
                width: newPos.width,
                scaleY: 1.2, // Pop up
                scaleX: 0.8, // Squeeze in
                transition: {
                    left: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
                    width: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
                    scaleY: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
                    scaleX: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
                }
            })
        }).then(() => {
            // Stage 3: Jelly Wobble
            controls.start({
                scaleY: [1.2, 0.85, 1.1, 0.95, 1],
                scaleX: [0.8, 1.15, 0.9, 1.05, 1],
                transition: {
                    duration: 0.5,
                    ease: "circOut"
                }
            })
            // Clear animating dots after animation completes
            setTimeout(() => setAnimatingDots(new Set()), 500)
        })

        setPreviousActive(active)
    }, [active, dotPositions, previousActive, controls])

    const activePosition = dotPositions[active]

    return (
        <div
            ref={containerRef}
            className={cn("relative flex gap-2 items-center", className)}
        >
            {/* Animated background indicator */}
            {activePosition && (
                <motion.div
                    className="absolute bg-primary rounded-full h-2"
                    initial={{
                        left: activePosition.left,
                        width: activePosition.width || 8,
                    }}
                    animate={controls}
                />
            )}

            {/* Dot placeholders */}
            {Array.from({ length: total }).map((_, i) => (
                <motion.div
                    key={i}
                    data-dot-index={i}
                    onClick={() => onDotClick?.(i)}
                    className={cn(
                        "relative z-10 w-2 h-2 rounded-full transition-all duration-200",
                        i === active ? "" : "bg-primary/20",
                        onDotClick && "cursor-pointer hover:bg-primary/40"
                    )}
                    animate={{
                        scale: animatingDots.has(i) ? [1, 0.5, 1] : 1,
                        opacity: animatingDots.has(i) ? [1, 0.3, 1] : 1
                    }}
                    transition={{
                        duration: 0.4,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}
