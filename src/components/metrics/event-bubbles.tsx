"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Event, EventType } from "@prisma/client"
import { format } from "date-fns"
import { Gamepad2, Trophy, Users, Calendar, ArrowRight } from "lucide-react"

interface EventBubblesProps {
    events: Event[]
    onEventClick: (event: Event) => void
}

export function EventBubbles({ events, onEventClick }: EventBubblesProps) {
    const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    // Filter to show future events or currently running ones
    const futureEvents = sortedEvents.filter(e =>
        new Date(e.startTime).getTime() + e.durationMinutes * 60000 > Date.now()
    ).slice(0, 10)

    const colors: Record<string, string> = {
        GAME: "from-blue-400 to-indigo-600",
        COMPETITION: "from-amber-400 to-orange-600",
        SOCIAL: "from-pink-400 to-rose-600",
        OTHER: "from-slate-400 to-slate-600"
    }

    const icons: Record<string, React.ReactNode> = {
        GAME: <Gamepad2 className="w-6 h-6 text-white" />,
        COMPETITION: <Trophy className="w-6 h-6 text-white" />,
        SOCIAL: <Users className="w-6 h-6 text-white" />,
        OTHER: <Calendar className="w-6 h-6 text-white" />
    }

    return (
        <div className="w-full relative py-8">
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {futureEvents.map((event, i) => {
                    const status = getEventStatus(event)
                    // Safe access with fallback
                    const type = event.type as string;
                    const bgGradient = colors[type] || colors.OTHER;
                    const icon = icons[type] || icons.OTHER;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            onClick={() => onEventClick(event)}
                            className="relative group cursor-pointer snap-center shrink-0"
                        >
                            {/* Main Bubble */}
                            <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${bgGradient} p-1 shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 relative z-10`}>
                                <div className="w-full h-full rounded-full bg-black/10 backdrop-blur-[2px] border-2 border-white/20 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">

                                    {/* Icon Background */}
                                    <div className="absolute opacity-20 scale-150 transform group-hover:rotate-12 transition-transform duration-500">
                                        {icon}
                                    </div>

                                    {/* Content */}
                                    <span className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
                                        {format(new Date(event.startTime), "MMM d")}
                                    </span>
                                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1 drop-shadow-sm">
                                        {event.title}
                                    </h3>
                                    <span className="text-white/80 text-[10px] bg-black/20 px-2 py-0.5 rounded-full">
                                        {format(new Date(event.startTime), "h:mm a")}
                                    </span>
                                </div>
                            </div>

                            {/* Floating Badge for Status */}
                            {status === "LIVE" && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce shadow-sm z-20 border border-white/20">
                                    LIVE
                                </div>
                            )}

                            {/* Connection Line (visual only, for first few) */}
                            {i < futureEvents.length - 1 && (
                                <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-border/30 z-0 hidden md:block" />
                            )}
                        </motion.div>
                    )
                })}

                {futureEvents.length === 0 && (
                    <div className="w-full text-center text-muted-foreground italic py-10">
                        No upcoming events scheduled. Check back soon!
                    </div>
                )}
            </div>
        </div>
    )
}

function getEventStatus(event: Event) {
    const now = new Date()
    const start = new Date(event.startTime)
    const end = new Date(start.getTime() + event.durationMinutes * 60000)

    if (now >= start && now <= end) return "LIVE"
    if (now < start) return "UPCOMING"
    return "PAST"
}
