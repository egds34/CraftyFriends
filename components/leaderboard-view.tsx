"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getLeaderboardData, LeaderboardCategory } from "@/app/leaderboard/actions"
import { SkinViewer } from "@/components/skin-viewer"
import { ChevronDown, Search } from "lucide-react"
import { PillowCard } from "@/components/ui/pillow-card"

export function LeaderboardView() {
    const [categories, setCategories] = useState<LeaderboardCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)

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

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Server Leaders</h1>
                <p className="text-lg text-muted-foreground">Top players across various categories</p>
            </div>

            <motion.div
                className="grid gap-8 xl:gap-10 px-4 md:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.15 }
                    }
                }}
            >
                {categories.map((category, index) => (
                    <LeaderboardCard key={category.statId} category={category} index={index} />
                ))}
            </motion.div>
        </div>
    )
}

function LeaderboardCard({ category, index }: { category: LeaderboardCategory, index: number }) {
    const topPlayer = category.topPlayers[0]
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [zIndex, setZIndex] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const drawerRef = useRef<HTMLDivElement>(null)
    // Trigger wobble on load/enter
    const [forceWobble, setForceWobble] = useState(false)

    // Vibrant pastel colors for the cards
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

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Updated logic: if clicking outside the drawer ref AND the button (handled via stopPropagation on button usually, but here ref is on drawer content)
            // But wait, the drawer assembly includes the button now? No, the ref is on the motion.div (drawer content).
            // We need a ref for the WHOLE assembly to handle click outside properly.
            // Let's attach drawerRef to the wrapper instead?
            // Actually, currently `drawerRef` is on `motion.div` content.
            // If I click the button, I toggle.
            // If I click outside, I close.
            // If the assembly is absolute, clicking outside is easy.

            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                // Optimization: The button has stopPropagation, so we don't need to worry about it triggering this if it's outside the ref.
                // But wait, if I click the button (which is OUTSIDE the drawer content ref), this fires.
                // This sets isDrawerOpen(false).
                // Then the button onClick fires and sets isDrawerOpen(!false) -> true.
                // Result: Drawer stays open or re-opens.
                // Fix: We need the ref to wrap the BUTTON too?
                // Or we let the button handle it.
                // Let's just rely on the button's stopPropagation which I added in the new code.
                // If button stops propagation, this document listener won't receive the click! Perfect.
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
            // Drop to intermediate z-index while closing so opened drawers (50) cover us
            setZIndex(prev => prev === 50 ? 20 : prev)
        }
    }, [isDrawerOpen])

    // Filter players for the drawer (excluding top 3)
    const remainingPlayers = category.topPlayers.slice(3)
    const filteredPlayers = remainingPlayers.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10)

    const wobbleKeyframes = {
        scaleX: [1, 1.08, 0.95, 1.02, 0.99, 1],
        scaleY: [1, 0.92, 1.05, 0.98, 1.01, 1],
        x: [0, -2, 2, -1, 1, 0],
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            onAnimationComplete={() => {
                setForceWobble(true)
                setTimeout(() => setForceWobble(false), 1000)
            }}
            className="flex h-48 relative group"
            style={{ zIndex }}
        >
            {/* Left: 3D Head Viewer (Rank 1) */}
            {/* Left: 3D Head Viewer (Rank 1) - Tucked behind */}
            <div
                className="absolute left-0 top-0 bottom-0 w-40 flex items-center justify-center z-0 cursor-pointer"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
                <div className="absolute w-[150%] h-[150%] flex items-center justify-center -translate-x-2 -translate-y-14">
                    <SkinViewer
                        username={topPlayer.username}
                        animation="idle"
                        zoom={1}
                        rotation={30}
                        mouseTracking={true}
                        className="pointer-events-none"
                    />
                </div>
            </div>

            {/* Right: Top 3 List */}
            <div
                ref={drawerRef}
                className="flex-1 ml-20 flex flex-col min-w-0 relative pb-6 z-10 group/card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Shadow Drawer (Acts as background shadow + drawer) */}
                <motion.div
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    layout
                    onAnimationComplete={() => !isDrawerOpen && setZIndex(1)}
                    initial={false}
                    animate={{
                        height: isDrawerOpen ? "auto" : "calc(100% - 3.75rem)",
                        scale: (isHovered && !isDrawerOpen) || forceWobble ? 1.03 : 1,
                        ...((isHovered && !isDrawerOpen) || forceWobble ? wobbleKeyframes : { scaleX: 1, scaleY: 1, x: 0 })
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        scaleX: { duration: 0.8, ease: "circOut" },
                        scaleY: { duration: 0.9, ease: "circOut" },
                        x: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className={`absolute top-12 left-1 right-1 backdrop-blur-md rounded-[40px] z-[-1] flex flex-col overflow-hidden cursor-pointer transition-colors ${color.bg} ${color.hover}`}
                >
                    {/* Spacer to push content below the main card area */}
                    {/* Parent is h-48 + pb-6 (1.5rem) = 12rem + 1.5rem. 
                        Top-12 is 3rem. 
                        We want spacer to fill the area 'behind' the card so drawer starts below. 
                        Spacer H = (100% parent - pb-6) - top-12? 
                        Let's just use a flexible spacer that fills remaining height in closed state.
                    */}
                    <div className="flex-1 min-h-[calc(11rem)] w-full" />

                    {/* Drawer Content */}
                    <AnimatePresence>
                        {isDrawerOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="px-3 pb-8 pt-0 flex flex-col gap-2"
                            >
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-8 pr-3 py-1.5 text-xs bg-background/40 border-none rounded-2xl focus:outline-none focus:ring-2 placeholder:text-muted-foreground/70 ${color.ring}`}
                                        autoFocus
                                    />
                                    <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-none" onClick={(e) => e.stopPropagation()}>
                                    {filteredPlayers.length > 0 ? (
                                        filteredPlayers.map((player, idx) => {
                                            const rank = 4 + idx;
                                            return (
                                                <div key={player.username} className="flex justify-between items-center text-xs px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className="w-5 text-muted-foreground opacity-70">
                                                            #{rank}
                                                        </span>
                                                        <span className="truncate font-medium">{player.username}</span>
                                                    </div>
                                                    <span className="font-mono text-muted-foreground">{player.value.toLocaleString()}</span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-4 text-xs text-muted-foreground">
                                            No players found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Handle Indicator (Subtle) */}
                    {/* Handle Indicator (Subtle) */}
                    <div className={`absolute bottom-1 w-full flex justify-center gap-1 ${color.text}`}>
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                        <div className="w-[3px] h-[3px] rounded-full bg-current opacity-80" />
                    </div>
                </motion.div>

                <PillowCard
                    className="h-full w-full relative z-10 cursor-pointer"
                    contentClassName="p-0"
                    shadowClassName="hidden"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    {...{ animate: isHovered ? "hover" : "visible" } as any}
                >
                    <div className="px-6 py-4 flex-1 flex flex-col min-h-0 flex-shrink-0 h-full">
                        <h3 className={`font-bold text-lg capitalize mb-3 truncate text-center ${color.text}`} title={category.displayName}>
                            {category.displayName}
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {category.topPlayers.slice(0, 3).map((player, idx) => (
                                <div key={player.username} className={`flex justify-between items-center text-sm ${idx === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={`w-4 text-xs ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-700' : 'opacity-50'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="truncate">{player.username}</span>
                                    </div>
                                    <span className="font-mono text-xs opacity-80">{player.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </PillowCard>

                {/* Drawer Assembly */}
                {/* Drawer Assembly Removed - Replaced by ShadowDrawer */}
            </div>
        </motion.div >
    )
}
