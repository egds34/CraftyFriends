"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getPlayerDetails, PlayerProfile } from "@/app/leaderboard/actions"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Calendar, Trophy, Clock, Skull, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AchievementBadge } from "@/components/achievements/achievement-badge"
import { SkinViewer } from "@/components/player/skin-viewer"


interface PlayerProfileModalProps {
    username: string | null
    isOpen: boolean
    onClose: () => void
}

export function PlayerProfileModal({ username, isOpen, onClose }: PlayerProfileModalProps) {
    const [profile, setProfile] = useState<PlayerProfile | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && username) {
            setLoading(true)
            getPlayerDetails(username)
                .then(setProfile)
                .finally(() => setLoading(false))
        } else {
            setProfile(null)
        }
    }, [isOpen, username])

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md md:max-w-xl bg-card border-none shadow-2xl rounded-3xl p-0 gap-0 overflow-visible">
                <div className="p-8 space-y-6">
                    {/* Header Info with Avatar */}
                    <div className="flex gap-6 items-center">
                        {/* Avatar */}
                        <div className="h-24 w-24 flex-shrink-0 relative z-20">
                            <div className="absolute w-[250px] h-[250px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="w-full h-full pointer-events-auto">
                                    {profile ? (
                                        <SkinViewer
                                            username={profile.username}
                                            className="h-full w-full"
                                            animation="idle"
                                            zoom={1.4}
                                            offsetY={-11}
                                            rotation={0}
                                            headOnly={true}
                                            mouseTracking={true}
                                        />
                                    ) : (
                                        <div className="h-24 w-24 bg-muted/20 animate-pulse rounded-3xl m-auto relative top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-2">
                                    {username}
                                </DialogTitle>
                                {profile && (
                                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                        <Activity className="w-3 h-3 text-emerald-500" />
                                        Last seen {formatDistanceToNow(new Date(profile.lastSeen), { addSuffix: true })}
                                    </p>
                                )}
                            </div>
                            {profile && (
                                <Badge variant="secondary" className="px-3 py-1 text-xs font-mono">
                                    {(profile.playTimeSeconds / 3600).toFixed(1)}h Played
                                </Badge>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-48 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {profile.keyStats.map((stat, i) => (
                                    <div key={i} className="bg-muted/30 p-3 rounded-2xl border border-border/50 flex flex-col items-center text-center gap-1">
                                        <span className="text-lg font-black">{stat.value}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Advancements */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Recent Advancements
                                </h4>
                                <div className="space-y-3">
                                    {profile.recentAdvancements.length > 0 ? (
                                        profile.recentAdvancements.map((adv) => (
                                            <motion.div
                                                key={adv.id}
                                                initial="rest"
                                                whileHover="hover"
                                                variants={{
                                                    rest: { zIndex: 0 },
                                                    hover: { zIndex: 50 }
                                                }}
                                                className="relative flex gap-4 items-center group p-2 rounded-xl transition-colors hover:bg-muted/50"
                                                style={{ perspective: "800px" }}
                                            >
                                                <motion.div
                                                    className="relative shrink-0 flex items-center justify-center z-10"
                                                    style={{ perspective: 1000, transformStyle: "preserve-3d" }}
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
                                                                    ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
                                                                    times: [0, 0.25, 0.5, 0.75, 1],
                                                                    repeat: Infinity,
                                                                }
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <AchievementBadge
                                                        name={adv.title}
                                                        icon={adv.icon || "minecraft:grass_block"}
                                                        frameType={adv.description?.includes("Challenge") ? "challenge" : adv.description?.includes("Goal") ? "goal" : "task"}
                                                    />
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-bold truncate text-foreground/90">{adv.title}</h5>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{adv.description}</p>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap opacity-50">
                                                    {formatDistanceToNow(new Date(adv.date))} ago
                                                </span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground text-center py-8 italic">
                                            No recent advancements.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground flex-col gap-2">
                            <Skull className="w-8 h-8 opacity-20" />
                            <span className="text-sm font-medium">Profile not found</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    )
}
