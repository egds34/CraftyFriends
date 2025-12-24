"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { Menu, Trophy, Map, X, BarChart3, Newspaper, CalendarDays } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SideMenuProps {
    blueMapUrl?: string
    children?: ReactNode
}

export function SideMenu({ blueMapUrl, children }: SideMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const menuItems = [
        { href: "/store", label: "Shop", desc: "Premium Upgrades", icon: Trophy, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
        { href: "/updates", label: "Updates", desc: "Latest News", icon: Newspaper, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
        { href: "/events", label: "Events", desc: "Community Gatherings", icon: CalendarDays, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
        { href: "/leaderboard", label: "Leaderboard", icon: BarChart3, desc: "Top Players & Stats", color: "bg-primary/10 text-primary hover:bg-primary/20" },
    ]

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
                            {menuItems.map((item) => {
                                const isActive = pathname.startsWith(item.href)
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-md transition-colors group",
                                            isActive ? "bg-accent" : "hover:bg-accent"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-full", item.color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="relative inline-flex flex-col">
                                                <span className={cn(
                                                    "font-bold transition-all duration-300",
                                                    isActive ? "font-black" : "group-hover:font-black"
                                                )}>
                                                    {item.label}
                                                </span>
                                                <span className="font-black invisible h-0 overflow-hidden" aria-hidden="true">
                                                    {item.label}
                                                </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">{item.desc}</span>
                                        </div>
                                    </Link>
                                )
                            })}

                            {blueMapUrl && (
                                <Link
                                    href={blueMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-md transition-colors group",
                                        pathname.startsWith("/map") ? "bg-accent" : "hover:bg-accent"
                                    )}
                                >
                                    <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 text-blue-500">
                                        <Map className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="relative inline-flex flex-col">
                                            <span className={cn(
                                                "font-bold transition-all duration-300",
                                                pathname.startsWith("/map") ? "font-black" : "group-hover:font-black"
                                            )}>
                                                Bluemap
                                            </span>
                                            <span className="font-black invisible h-0 overflow-hidden" aria-hidden="true">
                                                Bluemap
                                            </span>
                                        </span>
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
