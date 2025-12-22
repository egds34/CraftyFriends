"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { Menu, Trophy, Map, X, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface SideMenuProps {
    blueMapUrl?: string
    children?: ReactNode
}

export function SideMenu({ blueMapUrl, children }: SideMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            className="relative z-50 flex items-center h-full"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="flex items-center gap-2 relative z-50 cursor-pointer">
                <Button variant="ghost" size="icon" className={isOpen ? "bg-accent" : ""}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
                {children}
            </div>

            {/* Bridge to connect button to menu */}
            <div className="absolute top-8 left-0 w-64 h-8 bg-transparent z-[100]" />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 left-0 w-64 bg-card border shadow-xl rounded-xl p-4 flex flex-col gap-4 z-[99]"
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-lg text-primary tracking-tight">Menu</h3>
                            <div className="h-px bg-border w-full" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Link href="/store" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors group">
                                <div className="p-2 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 text-purple-500">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">Shop</span>
                                    <span className="text-xs text-muted-foreground">Premium Upgrades</span>
                                </div>
                            </Link>

                            <Link href="/leaderboard" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors group">
                                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 text-primary">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">Leaderboard</span>
                                    <span className="text-xs text-muted-foreground">Top Players & Stats</span>
                                </div>
                            </Link>

                            {blueMapUrl && (
                                <Link href={blueMapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors group">
                                    <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 text-blue-500">
                                        <Map className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Bluemap</span>
                                        <span className="text-xs text-muted-foreground">Live Server Map</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
