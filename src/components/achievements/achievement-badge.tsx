"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { AchievementIcon } from "./achievement-icon"

interface AchievementBadgeProps {
    name: string
    icon: string
    frameType?: 'task' | 'goal' | 'challenge'
    className?: string
}

export function AchievementBadge({ name, icon, frameType = 'task', className = "" }: AchievementBadgeProps) {
    // Determine the correct frame image
    // For now we assume all badges shown are "obtained" since they are in the user's list
    const frameSrc = `/images/advancements/frames/${frameType}_frame_obtained.png`

    // Track the resolved icon URL so we can mask the shine to it
    const [iconSrc, setIconSrc] = useState<string>('')

    return (
        <div
            className={`relative inline-flex items-center justify-center w-[52px] h-[52px] ${className}`}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* 1. The Frame Background */}
            {/* Pixel art scaling is crucial for the authentic look */}
            <img
                src={frameSrc}
                alt={`${frameType} frame`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rendering-pixelated"
                style={{ imageRendering: 'pixelated', transform: 'translateZ(0)' }}
            />

            {/* 1.5. Dynamic Cast Shadow */}
            {/* Uses the icon shape to cast a shadow on the frame below.
                By placing it at Z=1px (near frame) and the icon at Z=15px, 
                parallax will naturally offset the shadow during rotation! */}
            {iconSrc && (
                <div
                    className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                    style={{ transform: 'translateZ(1px)' }}
                >
                    <div
                        className="w-8 h-8 bg-black/40 blur-[1px]"
                        style={{
                            maskImage: `url('${iconSrc}')`,
                            WebkitMaskImage: `url('${iconSrc}')`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center'
                        }}
                    />
                </div>
            )}

            {/* 2. The Icon (Centered) */}
            {/* The icon is usually 16x16, scaled up. In our 52px frame (26x26 virtual pixels), 
                the icon should be about 32px visually to sit inside the padding. */}
            <div
                className="relative z-10 w-8 h-8 flex items-center justify-center"
                style={{ transform: 'translateZ(15px)' }}
            >
                <AchievementIcon
                    name={name}
                    icon={icon}
                    size="md"
                    // Removed drop-shadow to handle shadow via 3D layer above
                    onIconResolved={setIconSrc}
                />

                {iconSrc && (
                    <div
                        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
                        style={{
                            maskImage: `url('${iconSrc}')`,
                            WebkitMaskImage: `url('${iconSrc}')`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                            transform: 'translateZ(0.1px)' // Keep z-fighting fix on the container
                        }}
                    >
                        <motion.div
                            className="w-full h-full"
                            variants={{
                                rest: { opacity: 0, x: '-100%' },
                                hover: {
                                    opacity: [0, 0, 1, 0, 0, 1, 0, 0],
                                    // 1. Invisible move to Right
                                    // 2. Backward Shine (Right -> Left)
                                    // 3. Stay at Left
                                    // 4. Forward Shine (Left -> Right)
                                    // 5. Invisible move back to start (Loop)
                                    x: ['-120%', '120%', '0%', '-120%', '-120%', '0%', '120%', '-120%'],
                                    transition: {
                                        duration: 8,
                                        ease: "linear",
                                        times: [
                                            0,       // 0s: Reset

                                            // Shine 1: Backward / R->L (Starts at 1.0s)
                                            0.125,     // 1.0s: Start (Opacity 0, Right)
                                            0.171875,  // 1.375s: Peak (Opacity 1, Center)
                                            0.21875,   // 1.75s: End   (Opacity 0, Left)

                                            // Shine 2: Forward / L->R (Starts at 2.5s)
                                            0.3125,    // 2.5s: Start (Opacity 0, Left)
                                            0.359375,  // 2.875s: Peak  (Opacity 1, Center)
                                            0.40625,   // 3.25s: End   (Opacity 0, Right)

                                            1        // 8s: Loop
                                        ],
                                        repeat: Infinity,
                                        repeatType: "loop"
                                    }
                                }
                            }}
                            style={{
                                background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
