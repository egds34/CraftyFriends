"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getLeaderboardData, LeaderboardCategory } from "@/app/leaderboard/actions"
import { SkinViewer } from "@/components/skin-viewer"
import { ChevronDown, Search } from "lucide-react"

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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category, index) => (
                    <LeaderboardCard key={category.statId} category={category} index={index} />
                ))}
            </div>
        </div>
    )
}

function LeaderboardCard({ category, index }: { category: LeaderboardCategory, index: number }) {
    const topPlayer = category.topPlayers[0]
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [zIndex, setZIndex] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const drawerRef = useRef<HTMLDivElement>(null)

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
        if (isDrawerOpen) setZIndex(50)
    }, [isDrawerOpen])

    // Filter players for the drawer (excluding top 3)
    const remainingPlayers = category.topPlayers.slice(3)
    const filteredPlayers = remainingPlayers.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex h-48 relative group"
            style={{ zIndex }}
        >
            {/* Left: 3D Head Viewer (Rank 1) */}
            <div className="w-1/3 relative flex items-center justify-center z-10">
                <div className="absolute w-[140%] h-[140%] flex items-center justify-center">
                    <SkinViewer
                        username={topPlayer.username}
                        animation="idle"
                        zoom={1.1} // Reduced zoom
                        rotation={30}
                        mouseTracking={true}
                        className="pointer-events-none"
                    />
                </div>
            </div>

            {/* Right: Top 3 List */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-card border rounded-xl pb-6">
                <div className="p-4 flex-1 flex flex-col min-h-0 flex-shrink-0">
                    <h3 className="font-bold text-lg capitalize mb-3 text-primary truncate" title={category.displayName}>
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

                {/* Drawer Assembly */}
                <div
                    ref={drawerRef}
                    className="absolute top-[calc(100%-1.5rem)] left-0 right-0 z-20 flex flex-col pointer-events-none"
                >
                    {/* Drawer Content */}
                    <AnimatePresence onExitComplete={() => setZIndex(1)}>
                        {isDrawerOpen && (
                            <motion.div
                                key="drawer-content"
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="bg-card border-x border-b shadow-xl overflow-hidden pointer-events-auto -mt-[1px]"
                            >
                                <div className="flex flex-col flex-shrink-0">
                                    <div className="p-3 bg-muted/30 border-t">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search players..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                            <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="max-h-48 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                        {filteredPlayers.length > 0 ? (
                                            filteredPlayers.map((player, idx) => {
                                                const rank = 4 + idx;
                                                return (
                                                    <div key={player.username} className="flex justify-between items-center text-xs px-2 py-1 rounded hover:bg-muted/50">
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
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Bar Trigger */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDrawerOpen(!isDrawerOpen);
                        }}
                        className={`w-full h-6 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center border-t transition-colors pointer-events-auto ${isDrawerOpen ? 'rounded-b-xl border delay-0' : 'rounded-b-xl'}`}
                    >
                        <motion.div
                            animate={{ rotate: isDrawerOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
