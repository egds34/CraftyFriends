"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getLeaderboardData, LeaderboardCategory } from "@/app/leaderboard/actions"
import { SkinViewer } from "@/components/skin-viewer"
import { ChevronDown, Search } from "lucide-react"
import { PillowCard } from "@/components/ui/pillow-card"
import { PillowDrawer } from "@/components/ui/pillow-drawer"
import { PlayerProfileModal } from "@/components/player-profile-modal"
import { SignInModal } from "@/components/sign-in-modal"

export function LeaderboardView({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
    const [categories, setCategories] = useState<LeaderboardCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
    const [isSignInOpen, setIsSignInOpen] = useState(false)

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
        <div className="space-y-24 pb-20 overflow-x-hidden container mx-auto px-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Server Leaders</h1>
                <p className="text-lg text-muted-foreground">Top players across various categories</p>
            </div>

            <div className="space-y-32">
                {/* Aggregate Section (Items) */}
                {sections.Items.length > 0 && (
                    <AggregateSection
                        title="Server Totals"
                        stats={sections.Items}
                        onPlayerClick={handlePlayerClick}
                    />
                )}

                {sectionOrder.map((sectionName, idx) => {
                    const sectionStats = sections[sectionName as keyof typeof sections]
                    if (sectionStats.length === 0) return null

                    return (
                        <CyclingSection
                            key={sectionName}
                            title={sectionName}
                            stats={sectionStats}
                            onPlayerClick={handlePlayerClick}
                        />
                    )
                })}
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
    return (
        <div className="relative">
            <h2 className="text-2xl font-bold mb-8 text-left flex items-center gap-4">
                {title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((category, index) => (
                    <motion.div
                        key={category.statId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <AggregateCard category={category} onPlayerClick={onPlayerClick} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function AggregateCard({
    category,
    onInteractionChange,
    onPlayerClick
}: {
    category: LeaderboardCategory,
    onInteractionChange?: (isOpen: boolean) => void,
    onPlayerClick: (username: string) => void
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
            className="flex aspect-square w-full relative group flex-shrink-0"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Ambient Glow behind the card */}
            <div className="absolute inset-8 bg-indigo-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <PillowDrawer
                className="flex-1"
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
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Disclaimer - Only visible if we have an image */}
                            <div className="absolute top-2 right-3 z-30 pointer-events-none">
                                <span className="text-[9px] text-white/50 font-mono tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                                    Generated with Gemini AI
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500/80 via-purple-600/80 to-indigo-900/80 group-hover:scale-110 transition-transform duration-700" />
                    )}

                    {/* Hover Sheen Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-10 -translate-x-[150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end text-left z-20">
                        <p className="text-indigo-100/90 text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90 shadow-sm">
                            Total {category.displayName.replace("Most ", "").replace("Total ", "").replace("Furthest ", "")}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black bg-gradient-to-b from-white via-indigo-50 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                                {serverTotal.toLocaleString()}
                            </h3>
                            <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest opacity-80">
                                {category.unit}
                            </p>
                        </div>
                    </div>
                </div>
            </PillowDrawer>
        </motion.div>
    )
}

function CyclingSection({ title, stats, onPlayerClick }: { title: string, stats: LeaderboardCategory[], onPlayerClick: (username: string) => void }) {
    const [cardsPerPage, setCardsPerPage] = useState(3)
    const [pageIndex, setPageIndex] = useState(0)
    const [paused, setPaused] = useState(false)

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
        setPaused((prev) => {
            if (isOpen) return true
            return isOpen
        })
    }, [])

    useEffect(() => {
        if (totalPages <= 1 || paused) return

        const interval = setInterval(() => {
            setPageIndex(prev => (prev + 1) % totalPages)
        }, 8000)

        return () => clearInterval(interval)
    }, [totalPages, paused])

    const currentStats = stats.slice(
        pageIndex * cardsPerPage,
        (pageIndex + 1) * cardsPerPage
    )

    return (
        <div className="relative">
            <h2 className="text-2xl font-bold mb-8 text-left flex items-center gap-4">
                {title}
                {totalPages > 1 && (
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-colors duration-300 ${i === pageIndex ? 'bg-primary' : 'bg-primary/20'}`}
                            />
                        ))}
                    </div>
                )}
            </h2>

            <div className={`grid gap-8 min-h-[14rem] ${cardsPerPage === 1 ? 'grid-cols-1' :
                cardsPerPage === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                }`}>
                <AnimatePresence mode="wait" initial={true}>
                    {currentStats.map((category, index) => {
                        const uniqueKey = `${category.statId}-${pageIndex}`

                        return (
                            <motion.div
                                key={uniqueKey}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "backOut"
                                }}
                                className="relative"
                            >
                                <LeaderboardCard
                                    category={category}
                                    index={stats.indexOf(category)}
                                    positionIndex={index}
                                    isLastItem={index === currentStats.length - 1}
                                    // Pass a dummy ref since we aren't using the intersection observer anymore for entrance
                                    root={{ current: null } as any}
                                    onInteractionChange={handleInteractionChange}
                                    onPlayerClick={onPlayerClick}
                                />
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
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

    // Notify parent of interaction state changes
    useEffect(() => {
        onInteractionChange?.(isDrawerOpen)
    }, [isDrawerOpen, onInteractionChange])

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
            setZIndex(50)
        } else {
            setZIndex(prev => prev === 50 ? 20 : prev)
        }
    }, [isDrawerOpen])

    const remainingPlayers = category.topPlayers.slice(3)
    const filteredPlayers = remainingPlayers.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20)

    const wobbleKeyframes = {
        scaleX: [1, 1.08, 0.95, 1.02, 0.99, 1],
        scaleY: [1, 0.92, 1.05, 0.98, 1.01, 1],
        x: [0, -2, 2, -1, 1, 0],
    };

    const [showModel, setShowModel] = useState(false)
    const [isSkinLoaded, setIsSkinLoaded] = useState(false)
    const [modelWobble, setModelWobble] = useState(false)
    const [isWobbling, setIsWobbling] = useState(false)

    // Delay model rendering to allow entrance animation to play smoothly first
    useEffect(() => {
        const timer = setTimeout(() => setShowModel(true), 1200)
        return () => clearTimeout(timer)
    }, [])

    // Trigger wobble when drawer closes
    const prevIsOpen = useRef(isDrawerOpen)
    useEffect(() => {
        if (prevIsOpen.current && !isDrawerOpen) {
            setIsWobbling(true)
            const timer = setTimeout(() => setIsWobbling(false), 800)
            return () => clearTimeout(timer)
        }
        prevIsOpen.current = isDrawerOpen
    }, [isDrawerOpen])


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { scaleX: 0.5, scaleY: 0.5, opacity: 0 },
                visible: {
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 1,
                    transition: {
                        scaleX: { duration: 0.3, ease: "easeOut" },
                        scaleY: { duration: 0.3, ease: "easeOut" },
                        opacity: { duration: 0.2, ease: "easeOut" }
                    }
                }
            }}
            className="flex h-48 w-full relative group flex-shrink-0"
            style={{ zIndex: 1, willChange: "transform, opacity" }}
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-40 flex items-center justify-center z-0 cursor-pointer"
            >
                <div className="absolute w-[150%] h-[150%] flex items-center justify-center -translate-x-2 -translate-y-8">
                    {showModel && (
                        <motion.div
                            initial="hidden"
                            animate={isSkinLoaded ? (modelWobble ? "wobble" : "visible") : "hidden"}
                            variants={{
                                hidden: { opacity: 0, scale: 0.6 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: { duration: 0.2, ease: "easeOut" }
                                },
                                wobble: {
                                    opacity: 1,
                                    scale: 1,
                                    ...{
                                        scaleX: [1, 1.08, 0.95, 1.02, 0.99, 1],
                                        scaleY: [1, 0.92, 1.05, 0.98, 1.01, 1],
                                        x: [0, -2, 2, -1, 1, 0],
                                    },
                                    transition: { duration: 0.6, ease: "easeInOut" }
                                }
                            }}
                            onAnimationComplete={(definition) => {
                                if (definition === "visible") {
                                    setModelWobble(true)
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
                onOpenChange={onInteractionChange}
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
