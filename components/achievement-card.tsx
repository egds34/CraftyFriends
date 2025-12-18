"use client"

import { motion } from "framer-motion"
import { AchievementBadge } from "./achievement-badge"
import { useState } from "react"

interface AchievementCardProps {
    achievement: {
        id: string
        name: string
        category: string
        icon: string
        description?: string
        completedCount: number
        totalPlayers: number
        unlockedAt?: Date | string | null
    }
    index: number
}

export function AchievementCard({ achievement: adv, index }: AchievementCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: Math.min(index * 0.03, 0.8)
                }
            }}
            exit={{
                opacity: 0,
                scale: 0.9,
                transition: {
                    duration: 0.15
                }
            }}
            whileHover={{
                scale: 1.05,
                zIndex: 50,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-card border rounded-2xl p-4 transition-all duration-300 flex flex-col h-full"
        >
            <div className="flex flex-1 items-center justify-center gap-4">
                <motion.div
                    className="relative shrink-0 flex items-center justify-center"
                    style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                    animate={isHovered ? "hover" : "rest"}
                    variants={{
                        rest: {
                            scale: 1,
                            x: 0,
                            rotateY: 0,
                            zIndex: 1,
                            transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }
                        },
                        hover: {
                            scale: 1.8,
                            x: -12,
                            rotateY: [0, 45, 0, -45, 0],
                            zIndex: 60,
                            transition: {
                                scale: { type: "spring", stiffness: 400, damping: 20 },
                                x: { type: "spring", stiffness: 400, damping: 25 },
                                rotateY: {
                                    duration: 8,
                                    ease: ["easeOut", "easeIn", "easeOut", "easeIn"], // Fast start, Stop at edge, Fast thru center
                                    times: [0, 0.25, 0.5, 0.75, 1],
                                    repeat: Infinity,
                                }
                            }
                        }
                    }}
                >
                    <AchievementBadge
                        name={adv.name}
                        icon={adv.icon || "knowledge_book"}
                        frameType="task"
                        className="scale-125"
                    />
                    {/* Dynamic Shine Overlay */}
                    <motion.div
                        className="absolute inset-0 z-20 pointer-events-none scale-125"
                        initial="rest"
                        variants={{
                            rest: { opacity: 0.0, x: '0%', transition: { duration: 0 } },
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
                            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)',
                            transform: 'translateZ(1px)', // Sit just above the frame
                            mixBlendMode: 'overlay'
                        }}
                    />
                </motion.div>
                <div className="space-y-1 min-w-0 flex-1 pl-2 flex flex-col justify-center">
                    <h3 className="font-bold text-sm leading-tight">{adv.name}</h3>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{adv.description}</p>

                    <div className="flex justify-between items-center mt-1">
                        {adv.unlockedAt ? (
                            <p className="text-[10px] text-primary font-bold">
                                Obtained {new Date(adv.unlockedAt).toLocaleDateString()}
                            </p>
                        ) : (
                            <div />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                            {((adv.completedCount / (adv.totalPlayers || 1)) * 100).toFixed(0)}% of players
                        </span>
                    </div>
                </div>
            </div >
        </motion.div >
    )
}
