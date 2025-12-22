"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { SideMenu } from "@/components/layout/side-menu"
import { NavbarAuthButtons } from "@/components/layout/navbar-auth"
import { UserNav } from "@/components/layout/user-nav"
import { User } from "next-auth"
import { useCart } from "@/components/providers/cart-provider"
import { ShoppingCart, Trophy, BarChart3, Map as MapIcon, CalendarDays, Newspaper, Search as SearchIcon } from "lucide-react"

function CartBadge() {
    const { items } = useCart()
    if (items.length === 0) return null
    return (
        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full pointer-events-none">
            {items.length}
        </span>
    )
}

interface NavbarClientProps {
    sessionUser?: User
    blueMapUrl?: string
}

export function NavbarClient({ sessionUser, blueMapUrl }: NavbarClientProps) {
    const router = useRouter()
    const { scrollY } = useScroll()
    const pathname = usePathname()
    const isHome = pathname === "/"
    const [scrolled, setScrolled] = useState(false)
    const [heroHeight, setHeroHeight] = useState(0)

    useEffect(() => {
        // Initial setup for hero height (50vh equivalent in pixels)
        setHeroHeight(window.innerHeight / 2)

        const handleResize = () => {
            setHeroHeight(window.innerHeight / 2)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Trigger slightly before the full shrink completes (e.g., 90% of the way) 
        // or exactly when it finishes moving (closest to "minimum shrink achieved")
        // The hero shrinks until 50vh, which corresponds to scrollY = window.innerHeight / 2
        // So we trigger when latest > heroHeight
        if (latest > heroHeight && !scrolled) {
            setScrolled(true)
        } else if (latest <= heroHeight && scrolled) {
            setScrolled(false)
        }
    })

    const LogoContent = (
        <motion.div
            initial={{ opacity: !isHome ? 1 : 0 }}
            animate={{
                opacity: scrolled || !isHome ? 1 : 0,
                pointerEvents: scrolled || !isHome ? 'auto' : 'none'
            }}
            transition={{ duration: isHome ? 0.3 : 0, ease: "easeInOut" }}
        >
            <Link href="/" className="text-xl font-heading font-bold tracking-tight flex items-center gap-2">
                <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
                <span>Crafty <span className="text-primary">Friends</span></span>
            </Link>
        </motion.div>
    )

    return (
        <div className="fixed top-0 w-full z-50 pointer-events-none">
            {/* 
               Background Panel - Slides down and fades in when scrolled.
            */}
            <motion.div
                className="absolute top-0 left-0 w-full h-16 bg-background/95 backdrop-blur-md pointer-events-auto"
                initial={{ opacity: !isHome ? 1 : 0 }}
                animate={{ opacity: scrolled || !isHome ? 1 : 0 }}
                transition={{ duration: isHome ? 0.3 : 0, ease: "easeInOut" }}
            />

            {/* Navbar Content - Always visible, higher z-index */}
            <div className="w-full flex h-16 items-center justify-between px-6 relative pointer-events-auto">
                <div className="flex items-center gap-8">
                    {/* Mobile View: Hamburger Menu + Logo */}
                    <div className="md:hidden">
                        <SideMenu blueMapUrl={blueMapUrl}>
                            {LogoContent}
                        </SideMenu>
                    </div>

                    {/* Desktop View: Just Logo (Links are centered) */}
                    <div className="hidden md:flex items-center gap-8">
                        {LogoContent}
                    </div>
                </div>

                {/* Desktop Centered Links - Always Visible */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <nav className="flex items-center gap-12">
                        <Link
                            href="/store"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <Trophy className="w-4 h-4" />
                            Shop
                        </Link>
                        <Link
                            href="/updates"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <Newspaper className="w-4 h-4" />
                            Updates
                        </Link>
                        <Link
                            href="/events"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Events
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Leaderboard
                        </Link>
                        {blueMapUrl && (
                            <Link
                                href="/map"
                                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <MapIcon className="w-4 h-4" />
                                BlueMap
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:block relative group">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const query = formData.get('q');
                                if (query && typeof query === 'string' && query.trim().length > 0) {
                                    router.push(`/search?q=${encodeURIComponent(query)}`);
                                }
                            }}
                            className="relative"
                        >
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                name="q"
                                placeholder="Search everything..."
                                className="w-48 bg-white/5 border border-white/10 focus:border-primary/50 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                            />
                        </form>
                    </div>
                    {sessionUser ? (
                        <UserNav user={sessionUser} />
                    ) : (
                        <NavbarAuthButtons />
                    )}
                </div>
            </div>
        </div>
    )
}
