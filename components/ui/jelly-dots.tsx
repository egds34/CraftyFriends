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

        const newPos = dotPositions[active]

        // Stage 1: Move to new position with squish
        controls.start({
            left: newPos.left,
            scaleY: 0.7,
            transition: {
                left: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
                scaleY: { duration: 0.25, ease: "easeOut" }
            }
        }).then(() => {
            // Stage 2: Overshoot
            return controls.start({
                scaleY: 1.1,
                scaleX: 0.95,
                transition: {
                    scaleY: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
                    scaleX: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }
                }
            })
        }).then(() => {
            // Stage 3: Wobble
            controls.start({
                scaleY: [1.1, 0.9, 1.08, 0.96, 1.02, 1],
                scaleX: [0.95, 1.15, 0.95, 1.05, 0.98, 1],
                transition: {
                    scaleY: { duration: 0.6, ease: "circOut" },
                    scaleX: { duration: 0.6, ease: "circOut" }
                }
            })
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
                    className="absolute bg-primary rounded-full w-2 h-2"
                    initial={{
                        left: activePosition.left,
                    }}
                    animate={controls}
                />
            )}

            {/* Dot placeholders */}
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    data-dot-index={i}
                    onClick={() => onDotClick?.(i)}
                    className={cn(
                        "relative z-10 w-2 h-2 rounded-full transition-all duration-200",
                        i === active ? "" : "bg-primary/20",
                        onDotClick && "cursor-pointer hover:bg-primary/40"
                    )}
                />
            ))}
        </div>
    )
}
