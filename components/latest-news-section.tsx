"use strict";
import { updatesData } from "@/lib/updates-data";
import { UpdatesGrid } from "@/components/updates/updates-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

export function LatestNewsSection() {
    // Get top 3 updates
    const latestUpdates = updatesData.slice(0, 3);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col items-center text-center mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                            <Newspaper className="w-4 h-4" />
                            <span>Latest News</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                            From the Server
                        </h2>
                    </div>

                    <Link href="/updates">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground group rounded-full border border-border/50 px-6">
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
