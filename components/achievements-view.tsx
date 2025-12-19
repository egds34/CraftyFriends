"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Search, Filter } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { AchievementBadge } from "./achievement-badge"
import { AchievementCard } from "./achievement-card"

interface Achievement {
    id: string
    name: string
    category: string
    icon: string
    description?: string
    completedCount: number
    totalPlayers: number
    unlockedAt?: Date | string | null
}

interface AchievementsViewProps {
    advancements: Achievement[]
}

const CATEGORIES = ["all", "story", "nether", "end", "husbandry", "adventure"]

export function AchievementsView({ advancements }: AchievementsViewProps) {
    const [filter, setFilter] = useState("all")
    const [search, setSearch] = useState("")

    const filtered = advancements.filter(adv => {
        const matchesFilter = filter === "all" || adv.category === filter
        const matchesSearch = adv.name.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <>
            <div className="pt-24 pb-12 px-4 text-center relative">
                <div
                    className="absolute inset-0 bg-primary/5 transition-colors duration-500"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center relative z-10"
                >
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Trophy className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-heading font-extrabold tracking-tight lg:text-5xl mb-4">
                        Server Advancements
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        Global advancement statistics. See how many players have conquered these challenges!
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 py-8 overflow-visible">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search achievements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px] overflow-visible">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((adv, index) => (
                            <AchievementCard
                                key={`${adv.id}-${filter}`}
                                achievement={adv}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No achievements found matching your criteria.</p>
                    </div>
                )}
            </div>
        </>
    )
}
