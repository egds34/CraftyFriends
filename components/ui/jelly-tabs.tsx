"use client"

import { motion, useAnimationControls } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

interface JellyTab {
    id: string
    label: string
}

interface JellyTabsProps {
    tabs: JellyTab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    className?: string
}

export function JellyTabs({ tabs, activeTab, onTabChange, className }: JellyTabsProps) {
    const [tabPositions, setTabPositions] = useState<Record<string, { left: number; width: number }>>({})
    const [previousTab, setPreviousTab] = useState<string>(activeTab)
    const containerRef = useRef<HTMLDivElement>(null)
    const controls = useAnimationControls()

    // Measure tab positions
    useEffect(() => {
        if (!containerRef.current) return

        const positions: Record<string, { left: number; width: number }> = {}
        const buttons = containerRef.current.querySelectorAll('[data-tab-id]')

        buttons.forEach((button) => {
            const tabId = button.getAttribute('data-tab-id')
            if (tabId) {
                const rect = button.getBoundingClientRect()
                const containerRect = containerRef.current!.getBoundingClientRect()
                positions[tabId] = {
                    left: rect.left - containerRect.left,
                    width: rect.width
                }
            }
        })

        setTabPositions(positions)
    }, [tabs])

    // Animate when active tab changes
    useEffect(() => {
        if (previousTab === activeTab || !tabPositions[previousTab] || !tabPositions[activeTab]) return

        const oldPos = tabPositions[previousTab]
        const newPos = tabPositions[activeTab]

        // Calculate stretched position (encompassing both tabs)
        const stretchLeft = Math.min(oldPos.left, newPos.left)
        const stretchRight = Math.max(oldPos.left + oldPos.width, newPos.left + newPos.width)
        const stretchWidth = stretchRight - stretchLeft

        // Stage 1: Stretch to encompass both (make it thinner/stretched)
        controls.start({
            left: stretchLeft,
            width: stretchWidth,
            scaleY: 0.7, // Make it thinner when stretched
            transition: {
                duration: 0.25,
                ease: [0.34, 1.56, 0.64, 1] // Overshoot easing
            }
        }).then(() => {
            // Stage 2: Fast snap to new position with overshoot
            return controls.start({
                left: newPos.left,
                width: newPos.width,
                scaleY: 1.1, // Overshoot on arrival
                scaleX: 0.95, // Slight horizontal squish
                transition: {
                    left: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
                    width: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
                    scaleY: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
                    scaleX: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }
                }
            })
        }).then(() => {
            // Stage 3: DRAMATIC jelly wobble starting from overshoot
            controls.start({
                scaleY: [1.1, 0.9, 1.08, 0.96, 1.02, 1], // Start from overshoot
                scaleX: [0.95, 1.15, 0.95, 1.05, 0.98, 1], // Start from squished
                transition: {
                    scaleY: { duration: 0.6, ease: "circOut" },
                    scaleX: { duration: 0.6, ease: "circOut" }
                }
            })
        })

        setPreviousTab(activeTab)
    }, [activeTab, tabPositions, previousTab, controls])

    const activePosition = tabPositions[activeTab]

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative inline-flex bg-white/50 dark:bg-black/20 p-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm",
                className
            )}
        >
            {/* Animated background indicator */}
            {activePosition && (
                <motion.div
                    className="absolute bg-primary rounded-2xl shadow-lg"
                    initial={{
                        left: activePosition.left,
                        width: activePosition.width,
                        height: 'calc(100% - 12px)',
                        top: 6,
                    }}
                    animate={controls}
                    style={{
                        height: 'calc(100% - 12px)',
                        top: 6,
                    }}
                />
            )}

            {/* Tab buttons */}
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    data-tab-id={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "relative z-10 px-6 py-2 text-sm font-bold transition-colors duration-200 rounded-2xl mx-1",
                        activeTab === tab.id
                            ? "text-white dark:text-black"
                            : "text-muted-foreground hover:text-primary"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
