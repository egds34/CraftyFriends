"use strict";

import { UpdatesGrid } from "@/components/updates/updates-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

import { Post } from "@prisma/client";

interface LatestNewsSectionProps {
    updates: Post[];
}

export function LatestNewsSection({ updates }: LatestNewsSectionProps) {
    // Get top 3 updates from props
    const latestUpdates = updates.slice(0, 3);


    return (
        <section className="py-24 relative overflow-hidden">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                            <Newspaper className="w-4 h-4" />
                            <span>Latest News</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                            From the Server
                        </h2>
                    </div>

                    <Link href="/updates">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground group">
                            View All Updates
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <UpdatesGrid initialUpdates={latestUpdates} />
            </div>
        </section>
    );
}
