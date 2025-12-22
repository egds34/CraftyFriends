"use client";

import { ServerUpdate } from "@/lib/updates-data";
import Link from "next/link";
import { PillowCard } from "@/components/ui/pillow-card";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";

export function ArchiveList({ updates }: { updates: any[] }) {
    if (updates.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <p>No updates found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {updates.map((update, idx) => (
                <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                >
                    <Link href={`/updates/${update.id}`}>
                        <div className="group relative flex flex-col md:flex-row gap-4 bg-muted/5 border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-all cursor-pointer overflow-hidden">
                            {/* Small Thumbnail */}
                            <div className="relative w-full md:w-48 h-32 md:h-auto shrink-0 rounded-xl overflow-hidden">
                                <Image
                                    src={update.image}
                                    alt={update.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-xs text-primary mb-2 uppercase tracking-wider font-bold">
                                    <span>{update.category}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <CalendarDays className="w-3 h-3" />
                                        {new Date(update.createdAt || update.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {update.title}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {update.excerpt}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center justify-center pr-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-black transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
