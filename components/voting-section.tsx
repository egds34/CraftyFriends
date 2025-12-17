"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink, Vote } from "lucide-react"
import { motion } from "framer-motion"

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
        <section className="py-20 relative z-10 bg-muted/50">
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                <div className="h-full bg-card/80 backdrop-blur-sm border border-transparent hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        {/* Placeholder for Logo - Just using first letter or generic icon */}
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
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
