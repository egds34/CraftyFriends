"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink, Vote } from "lucide-react"
import { motion } from "framer-motion"
import { PillowCard } from "@/components/ui/pillow-card"

export interface VoteSite {
    name: string
    url: string
}

interface VotingSectionProps {
    sites: VoteSite[]
}

export function VotingSection({ sites }: VotingSectionProps) {
    if (!sites || sites.length === 0) return null

    return (
        <section className="py-20 relative z-10">
            <div className="container px-4 mx-auto text-center">
                <div className="flex flex-col items-center justify-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 text-primary tracking-tight">Vote for Us!</h2>
                    <p className="text-muted-foreground max-w-2xl text-lg">
                        Earn unique items when you vote for us!
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {sites.map((site, index) => (
                        <motion.div
                            key={index}
                            initial={{ scale: 0.8, y: 50 }}
                            whileInView={{ scale: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 }}
                        >
                            <Link
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block h-full"
                            >
                                <PillowCard
                                    shadowClassName={`transition-colors duration-300 ${[
                                        "bg-red-500/40 dark:shadow-[0_0_25px_rgba(239,68,68,0.4)]",
                                        "bg-orange-500/40 dark:shadow-[0_0_25px_rgba(249,115,22,0.4)]",
                                        "bg-amber-500/40 dark:shadow-[0_0_25px_rgba(245,158,11,0.4)]",
                                        "bg-emerald-500/40 dark:shadow-[0_0_25px_rgba(16,185,129,0.4)]",
                                        "bg-cyan-500/40 dark:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
                                        "bg-blue-500/40 dark:shadow-[0_0_25px_rgba(59,130,246,0.4)]",
                                        "bg-violet-500/40 dark:shadow-[0_0_25px_rgba(139,92,246,0.4)]",
                                        "bg-purple-500/40 dark:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
                                        "bg-pink-500/40 dark:shadow-[0_0_25px_rgba(236,72,153,0.4)]"
                                    ][index % 9]}`}
                                    className="h-full"
                                    contentClassName="flex items-center gap-4 p-6"
                                    shadowTop="top-5"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <span className="text-xl font-bold text-muted-foreground group-hover:text-primary">
                                            {site.name.substring(0, 1).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                            {site.name}
                                        </h3>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary/70">
                                            Vote Now <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </div>
                                </PillowCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
