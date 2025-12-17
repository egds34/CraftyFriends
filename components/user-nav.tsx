"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/providers/SignOutProvider"
import { User } from "next-auth"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, BarChart3, LogOut } from "lucide-react"

interface UserNavProps {
    user: User & { role?: string }
}

export function UserNav({ user }: UserNavProps) {
    const { signOut } = useSignOut()
    const [isOpen, setIsOpen] = useState(false)
    const displayName = (user as any).minecraftUsername || user.name || "Menu"

    return (
        <div
            className="relative z-50 flex items-center h-full"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="flex items-center gap-2 relative z-50 cursor-pointer">
                <Button
                    variant="ghost"
                    className={isOpen ? "bg-accent" : ""}
                >
                    Welcome, {displayName}!
                </Button>
            </div>

            {/* Bridge to connect button to menu */}
            <div className="absolute top-8 right-0 w-64 h-8 bg-transparent z-[100]" />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-0 w-64 bg-card border shadow-xl rounded-xl p-4 flex flex-col gap-4 z-[99]"
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-lg text-primary tracking-tight">Account</h3>
                            <div className="h-px bg-border w-full" />
                        </div>

                        <div className="flex flex-col gap-2">
                            {user.role === 'ADMIN' && (
                                <Link href="/admin" className="flex items-center gap-3 p-3 rounded-md hover:bg-primary/10 transition-colors group">
                                    <div className="p-2 bg-red-500/10 rounded-full group-hover:bg-red-500/20 text-red-500">
                                        <Trophy className="h-5 w-5" /> {/* Using Trophy as placeholder or maybe Lock/Shield if available */}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Admin Panel</span>
                                        <span className="text-xs text-muted-foreground">Manage Server</span>
                                    </div>
                                </Link>
                            )}

                            <Link href="/account" className="flex items-center gap-3 p-3 rounded-md hover:bg-primary/10 transition-colors group">
                                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 text-primary">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">Account</span>
                                    <span className="text-xs text-muted-foreground">Account & Stats</span>
                                </div>
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-3 p-3 rounded-md hover:bg-destructive/10 transition-colors group text-left w-full"
                            >
                                <div className="p-2 bg-muted rounded-full group-hover:bg-destructive/20 text-muted-foreground group-hover:text-destructive transition-colors">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium group-hover:text-destructive transition-colors">Sign Out</span>
                                    <span className="text-xs text-muted-foreground">See ya later!</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
