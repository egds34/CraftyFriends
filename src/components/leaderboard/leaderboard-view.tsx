"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getLeaderboardData, LeaderboardCategory } from "@/app/leaderboard/actions"
import { SkinViewer } from "@/components/player/skin-viewer"
import { ChevronDown, Search } from "lucide-react"
import { PillowCard } from "@/components/ui/pillow-card"
import { PillowDrawer } from "@/components/ui/pillow-drawer"
import { PlayerProfileModal } from "@/components/player/player-profile-modal"
import { SignInModal } from "@/components/auth/sign-in-modal"

export function LeaderboardView({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
    const [categories, setCategories] = useState<LeaderboardCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("Distance")

    const handlePlayerClick = (username: string) => {
        if (!isAuthenticated) {
            setIsSignInOpen(true)
            return
        }
        setSelectedPlayer(username)
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getLeaderboardData()
                setCategories(data)
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="text-center py-20 text-muted-foreground">Loading leaderboards...</div>
    }

    if (categories.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No leaderboard data found yet. Start playing!</div>
    }

    // Group categories by section
    const sections = {
        Distance: categories.filter(c => c.section === "Distance"),
        Combat: categories.filter(c => c.section === "Combat"),
        General: categories.filter(c => c.section === "General"),
        Items: categories.filter(c => c.section === "Items"),
    }


    const sectionOrder = ["Distance", "Combat", "General"]

    return (
        <div className="space-y-8 pb-12 container mx-auto px-4 md:px-8 pt-24">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold font-heading tracking-tight lg:text-5xl">Server Leaders</h1>
                <p className="text-lg text-muted-foreground">Top players across various categories</p>
            </div>

            <div className="space-y-8">
                {/* Aggregate Section (Items) */}
                {sections.Items.length > 0 && (
                    <AggregateSection
                        title="Server Totals"
                        stats={sections.Items}
                        onPlayerClick={handlePlayerClick}
                    />
                )}

                {/* Category Tabs */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center p-1 bg-muted/50 rounded-full border border-white/5 backdrop-blur-sm">
                        {sectionOrder.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? "text-white shadow-sm"
                                    : "text-muted-foreground hover:text-white/80"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-indigo-500 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Category Section */}
                <div className="pt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CyclingSection
                                title={activeTab}
                                stats={sections[activeTab as keyof typeof sections] || []}
                                onPlayerClick={handlePlayerClick}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <PlayerProfileModal
                username={selectedPlayer}
                isOpen={!!selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
            />

            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />
        </div>
    )
}

function AggregateSection({ title, stats, onPlayerClick }: { title: string, stats: LeaderboardCategory[], onPlayerClick: (username: string) => void }) {
    // Responsive State
    const [isMobile, setIsMobile] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        // Initial check
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Mobile Auto-Cycling Logic
    useEffect(() => {
        if (!isMobile) return

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % stats.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isMobile, stats.length])

    // Bento Grid Configuration for first 6 items: Total 12 cells (4x3 grid)
    // Item 0: Big Square (2x2) -> 4 cells
    // Item 1: Wide (2x1)       -> 2 cells
    // Item 2: Tall (1x2)       -> 2 cells
    // Item 3: Small (1x1)      -> 1 cell
    // Item 4: Wide (2x1)       -> 2 cells
    // Item 5: Small (1x1)      -> 1 cell

    // Determine grid classes based on index
    const getGridClass = (index: number) => {
        const classes = [
            "md:col-span-2 md:row-span-2", // 0: Big
            "md:col-span-2 md:row-span-1", // 1: Wide
            "md:col-span-1 md:row-span-2", // 2: Tall (Asymmetry!)
            "md:col-span-1 md:row-span-1", // 3: Small
            "md:col-span-2 md:row-span-1", // 4: Wide
            "md:col-span-1 md:row-span-1", // 5: Small
        ]
        return classes[index] || "col-span-1 row-span-1"
    }

    // Slice for desktop bento grid, but use full list for mobile carousel
    const displayStats = isMobile ? stats : stats.slice(0, 6)

    return (
        <div className="relative pt-8 pb-12">
            <h2 className="text-2xl font-bold mb-8 text-left flex items-center gap-4">
                {title}
            </h2>

            {/* Mobile View: Single Cycling Card */}
            {isMobile ? (
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AggregateCard
                                category={stats[activeIndex]}
                                onPlayerClick={onPlayerClick}
                                className="h-96 w-full"
                                size="lg"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination Dots */}
                    <div className="flex gap-2 justify-center mt-6">
                        {stats.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-colors duration-300 ${i === activeIndex ? 'bg-indigo-500' : 'bg-indigo-500/20'}`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* Desktop View: Bento Grid */
                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4">
                    {displayStats.map((category, index) => (
                        <motion.div
                            key={category.statId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative group ${getGridClass(index)}`}
                        >
                            <AggregateCard
                                category={category}
                                onPlayerClick={onPlayerClick}
                                className="h-full w-full"
                                // Pass specific font sizing for larger cards
                                size={index === 0 ? "lg" : "md"}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

function AggregateCard({
    category,
    onInteractionChange,
    onPlayerClick,
    className = "",
    size = "md"
}: {
    category: LeaderboardCategory,
    onInteractionChange?: (isOpen: boolean) => void,
    onPlayerClick: (username: string) => void,
    className?: string,
    size?: "md" | "lg"
}) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Random float parameters for organic feel
    const [floatConfig] = useState(() => ({
        duration: 3 + Math.random() * 2, // 3-5s duration
        delay: Math.random() * 2, // 0-2s delay
    }))

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        onInteractionChange?.(open)
    }

    // Map stats to image paths (Using Event placeholders for now)
    const statImages: Record<string, string> = {
        "minecraft:mined:total": "/images/events/spleef.png",
        "minecraft:broken:total": "/images/events/parkour.png",
        "minecraft:crafted:total": "/images/events/build-battle.png",
        "minecraft:picked_up:total": "/images/events/spleef.png",
        "minecraft:dropped:total": "/images/events/parkour.png",
        "minecraft:used:total": "/images/events/build-battle.png",
    }

    const bgImage = statImages[category.statId]

    // Fixed color for all aggregate cards
    const color = {
        bg: "bg-indigo-500/20",
        hover: "hover:bg-indigo-500/30",
        text: "text-indigo-300",
        ring: "focus:ring-indigo-500/50"
    }

    // Calculate Server Total
    const serverTotal = category.topPlayers.reduce((acc, p) => acc + p.value, 0)

    const filteredPlayers = category.topPlayers.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20)

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={
                isOpen || isHovering
                    ? { y: 0, scale: 1, opacity: 1 }
                    : {
                        y: [0, -8, 0],
                        scale: 1,
                        opacity: 1,
                        transition: {
                            y: {
                                duration: floatConfig.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: floatConfig.delay
                            }
                        }
                    }
            }
            style={{ zIndex: isOpen || isHovering ? 40 : 1 }}
            className={`flex flex-col w-full relative group/aggregate flex-shrink-0 rounded-3xl ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Ambient Glow behind the card */}
            < div className="absolute inset-8 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover/aggregate:opacity-100 transition-opacity duration-700" />

            <PillowDrawer
                className="flex-1 h-full"
                colors={color}
                onOpenChange={handleOpenChange}
                shadowBottom="-bottom-6"
                drawerContent={
                    <>
                        <motion.div layout className="relative" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 text-xs bg-background/40 border-none rounded-2xl focus:outline-none focus:ring-2 placeholder:text-muted-foreground/70 ${color.ring}`}
                                autoFocus
                            />
                            <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
                        </motion.div>

                        <motion.div layout className="max-h-64 overflow-y-auto space-y-1 scrollbar-none" onClick={(e) => e.stopPropagation()}>
                            {filteredPlayers.length > 0 ? (
                                filteredPlayers.map((player, idx) => {
                                    const rank = 1 + idx; // Absolute rank since this is the full list
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={player.username}
                                            className="flex justify-between items-center text-xs px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                            onClick={() => onPlayerClick(player.username)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="w-5 text-muted-foreground opacity-70">
                                                    #{rank}
                                                </span>
                                                <span className="truncate font-medium hover:underline">{player.username}</span>
                                            </div>
                                            <span className="font-mono text-muted-foreground">{player.value.toLocaleString()} {category.unit}</span>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-4 text-xs text-muted-foreground">
                                    No players found
                                </div>
                            )}
                        </motion.div>
                    </>
                }
            >
                <div className="flex-1 relative overflow-hidden h-full rounded-3xl z-0 bg-slate-900 border border-white/5">
                    {/* Background Image or Fallback Gradient */}
                    {bgImage ? (
                        <div className="absolute inset-0 w-full h-full bg-slate-900">
                            <img
                                src={bgImage}
                                alt={category.displayName}
                                className={`w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out will-change-transform ${isHovering ? "scale-110" : "scale-100"}`}
                            />
                            {/* Disclaimer - Only visible if we have an image */}
                            <div className="absolute top-2 right-3 z-30 pointer-events-none">
                                <span className="text-[9px] text-white/50 font-mono tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                                    Generated with Gemini AI
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500/80 via-purple-600/80 to-indigo-900/80 transition-transform duration-700 ease-out will-change-transform ${isHovering ? "scale-110" : "scale-100"}`} />
                    )}

                    {/* Hover Sheen Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-10 -translate-x-[150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end items-center text-center z-20">
                        <h3 className={`font-black text-white drop-shadow-sm tracking-tight leading-tight ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>
                            {serverTotal.toLocaleString()} {category.displayName.replace("Most ", "").replace("Total ", "").replace("Furthest ", "")}
                        </h3>
                    </div>
                </div>
            </PillowDrawer>
        </motion.div >
    )
}

function CyclingSection({ title, stats, onPlayerClick }: { title: string, stats: LeaderboardCategory[], onPlayerClick: (username: string) => void }) {
    // Return to Original Cycling Logic
    const [cardsPerPage, setCardsPerPage] = useState(3)
    const [pageIndex, setPageIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const [lastInteraction, setLastInteraction] = useState(0)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setCardsPerPage(1)
            else if (window.innerWidth < 1280) setCardsPerPage(2)
            else setCardsPerPage(3)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const totalPages = Math.ceil(stats.length / cardsPerPage)

    const handleInteractionChange = useCallback((isOpen: boolean) => {
        setPaused(isOpen)
    }, [])

    useEffect(() => {
        // Reset page index if active tab changes or stats length changes significantly
        setPageIndex(0)
    }, [stats.length])

    useEffect(() => {
        if (totalPages <= 1 || paused) return

        const interval = setInterval(() => {
            setPageIndex(prev => (prev + 1) % totalPages)
        }, 8000)

        return () => clearInterval(interval)
        return () => clearInterval(interval)
    }, [totalPages, paused, lastInteraction])

    const currentStats = stats.slice(
        pageIndex * cardsPerPage,
        (pageIndex + 1) * cardsPerPage
    )

    return (
        <div className="relative group/section bg-muted/5 rounded-3xl p-6 md:p-8 border border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-left flex items-center gap-4 px-1 sr-only">
                {title}
            </h2>

            <motion.div
                layout
                className={`grid gap-6 ${cardsPerPage === 1 ? 'grid-cols-1' :
                    cardsPerPage === 2 ? 'grid-cols-2' :
                        'grid-cols-3'
                    }`}>
                <AnimatePresence mode="wait" initial={false}>
                    {currentStats.map((category, index) => {
                        // Unique key ensuring unmount/remount for animation
                        const uniqueKey = `${category.statId}-${pageIndex}`

                        return (
                            <motion.div
                                layout
                                key={uniqueKey}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="relative"
                            >
                                <LeaderboardCard
                                    category={category}
                                    index={stats.indexOf(category)}
                                    positionIndex={index}
                                    isLastItem={index === currentStats.length - 1}
                                    root={{ current: null } as any}
                                    onInteractionChange={handleInteractionChange}
                                    onPlayerClick={onPlayerClick}
                                />
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
                <div className="flex gap-2 justify-center mt-8">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setPageIndex(i)
                                setLastInteraction(Date.now())
                            }}
                            className={`h-2 w-2 rounded-full transition-colors duration-300 cursor-pointer ${i === pageIndex ? 'bg-indigo-500' : 'bg-indigo-500/20 hover:bg-indigo-500/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function LeaderboardCard({
    category,
    index,
    positionIndex,
    isLastItem,
    root,
    onInteractionChange,
    onPlayerClick
}: {
    category: LeaderboardCategory,
    index: number,
    positionIndex?: number,
    isLastItem?: boolean,
    root: React.RefObject<any>,
    onInteractionChange?: (isOpen: boolean) => void,
    onPlayerClick: (username: string) => void
}) {
    const topPlayer = category.topPlayers[0]
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)



    const [isHovered, setIsHovered] = useState(false)
    const [zIndex, setZIndex] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const drawerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null) // Ref for scrolling

    // Handle drawer toggle with scrolling and state update
    const handleOpenChange = (open: boolean) => {
        setIsDrawerOpen(open)
        onInteractionChange?.(open)

        if (open) {
            // Smooth scroll to card after small delay for layout expansion
            setTimeout(() => {
                cardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                })
            }, 300)
        }
    }

    // Determine facing direction for head
    // We want: 
    // - First item (pos 0): Look Right (towards next item) -> Head turns Left? Let's try -0.5
    // - Last item: Look Left (towards prev item) -> Head turns Right? Let's try 0.5
    const [headRotation] = useState(() => {
        const LOOK_RIGHT = -0.6
        const LOOK_LEFT = 0.6

        if (positionIndex === 0 && !isLastItem) return LOOK_RIGHT
        if (positionIndex !== 0 && isLastItem) return LOOK_LEFT
        return Math.random() > 0.5 ? LOOK_RIGHT : LOOK_LEFT
    })

    const colors = [
        { bg: "bg-rose-500/20", hover: "hover:bg-rose-500/30", text: "text-rose-600", ring: "focus:ring-rose-500/50" },
        { bg: "bg-orange-500/20", hover: "hover:bg-orange-500/30", text: "text-orange-600", ring: "focus:ring-orange-500/50" },
        { bg: "bg-amber-500/20", hover: "hover:bg-amber-500/30", text: "text-amber-600", ring: "focus:ring-amber-500/50" },
        { bg: "bg-emerald-500/20", hover: "hover:bg-emerald-500/30", text: "text-emerald-600", ring: "focus:ring-emerald-500/50" },
        { bg: "bg-cyan-500/20", hover: "hover:bg-cyan-500/30", text: "text-cyan-600", ring: "focus:ring-cyan-500/50" },
        { bg: "bg-blue-500/20", hover: "hover:bg-blue-500/30", text: "text-blue-600", ring: "focus:ring-blue-500/50" },
        { bg: "bg-violet-500/20", hover: "hover:bg-violet-500/30", text: "text-violet-600", ring: "focus:ring-violet-500/50" },
        { bg: "bg-fuchsia-500/20", hover: "hover:bg-fuchsia-500/30", text: "text-fuchsia-600", ring: "focus:ring-fuchsia-500/50" },
    ]
    const color = colors[index % colors.length]

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

    useEffect(() => {
        if (isDrawerOpen) {
            setZIndex(40)
        } else {
            setZIndex(prev => prev === 40 ? 20 : prev)
        }
    }, [isDrawerOpen])

    const remainingPlayers = category.topPlayers.slice(3)
    const filteredPlayers = remainingPlayers.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20)

    const [showModel, setShowModel] = useState(false)
    const [isSkinLoaded, setIsSkinLoaded] = useState(false)

    // Delay model rendering to allow entrance animation to play smoothly first
    useEffect(() => {
        const timer = setTimeout(() => setShowModel(true), 1200)
        return () => clearTimeout(timer)
    }, [])



    return (
        <motion.div
            layout
            ref={cardRef} // Attach ref for scrolling
            className={`flex h-48 w-full relative group flex-shrink-0 transition-all duration-500 ease-in-out scroll-m-24 ${isDrawerOpen ? "mb-16" : "mb-0"}`}
            style={{ zIndex: zIndex, willChange: "transform, opacity" }}
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-40 flex items-center justify-center z-0 cursor-pointer"
                onClick={() => handleOpenChange(!isDrawerOpen)} // Click avatar to toggle
            >
                <div className="absolute w-[150%] h-[150%] flex items-center justify-center -translate-x-2 -translate-y-8">
                    {showModel && (
                        <motion.div
                            initial="hidden"
                            animate={isSkinLoaded ? "visible" : "hidden"}
                            variants={{
                                hidden: { opacity: 0, scale: 0.6 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                        scale: { type: "spring", stiffness: 400, damping: 14 },
                                        opacity: { duration: 0.2 }
                                    }
                                }
                            }}
                            className="w-full h-full"
                        >
                            <SkinViewer
                                username={topPlayer.username}
                                animation="idle"
                                zoom={0.9}
                                rotation={30} // Fixed body rotation
                                headRotationY={headRotation} // Dynamic head rotation
                                rotationX={10} // Slight tilt down to look nicer
                                mouseTracking={false}
                                onReady={() => setIsSkinLoaded(true)}
                                className="pointer-events-none"
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            <PillowDrawer
                className="flex-1 ml-20"
                colors={color}
                onOpenChange={handleOpenChange}
                drawerContent={
                    <>
                        <motion.div layout className="relative" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 text-xs bg-background/40 border-none rounded-2xl focus:outline-none focus:ring-2 placeholder:text-muted-foreground/70 ${color.ring}`}
                                autoFocus
                            />
                            <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
                        </motion.div>

                        <motion.div layout className="max-h-64 overflow-y-auto space-y-1 scrollbar-none" onClick={(e) => e.stopPropagation()}>
                            {filteredPlayers.length > 0 ? (
                                filteredPlayers.map((player, idx) => {
                                    const rank = 4 + idx;
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={player.username}
                                            className="flex justify-between items-center text-xs px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                            onClick={() => onPlayerClick(player.username)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="w-5 text-muted-foreground opacity-70">
                                                    #{rank}
                                                </span>
                                                <span className="truncate font-medium hover:underline">{player.username}</span>
                                            </div>
                                            <span className="font-mono text-muted-foreground">{player.value.toLocaleString()} {category.unit}</span>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-4 text-xs text-muted-foreground">
                                    No players found
                                </div>
                            )}
                        </motion.div>
                    </>
                }
            >
                <div className="px-6 py-4 flex-1 flex flex-col min-h-0 flex-shrink-0 h-full">
                    <h3 className={`font-bold text-lg capitalize mb-3 truncate text-center ${color.text}`} title={category.displayName}>
                        {category.displayName}
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        {category.topPlayers.slice(0, 3).map((player, idx) => (
                            <div
                                key={player.username}
                                className={`flex justify-between items-center text-sm ${idx === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'} cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 transition-colors`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onPlayerClick(player.username)
                                }}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className={`w-4 text-xs ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-700' : 'opacity-50'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="truncate hover:underline">{player.username}</span>
                                </div>
                                <span className="font-mono text-xs opacity-80">{player.value.toLocaleString()} {category.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </PillowDrawer>
        </motion.div>
    )
}
