"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ServerUpdate } from "@/lib/updates-data";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, ArrowUpRight, Loader2 } from "lucide-react";
import { PillowCard } from "@/components/ui/pillow-card";
import { useState } from "react";
import { getUpdates } from "@/app/actions/updates";
import { Button } from "@/components/ui/button";

interface UpdatesGridProps {
    initialUpdates: ServerUpdate[]; // Renamed for clarity
    canCreate?: boolean;
    initialHasMore?: boolean;
}

export function UpdatesGrid({ initialUpdates, canCreate, initialHasMore = false }: UpdatesGridProps) {
    const [updates, setUpdates] = useState<ServerUpdate[]>(initialUpdates);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [offset, setOffset] = useState(initialUpdates.length);

    async function loadMore() {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        // Fetch next 12
        const result = await getUpdates(offset, 12);

        if (result.success && result.data) {
            setUpdates(prev => [...prev, ...result.data as any]);
            setHasMore(result.hasMore || false);
            setOffset(prev => prev + result.data.length);
        }

        setIsLoadingMore(false);
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">

                {updates.map((update, idx) => {
                    // Determine span based on index for asymmetry WITH offset from create button if present?
                    // Actually, if created button is present, it takes slot 0 in the DOM flow but visualized...
                    // Ideally updates list is separate. 
                    // Let's just prepend Create Button if present. 
                    // If canCreate is true, the Create Button takes slot 0.
                    // The big "Featured" card should be the first UPDATE.
                    // So if canCreate is true, Create Button is [0,0] (1x1).
                    // First Update is [0,1] or [1,0]?
                    // To keep the layout nice, if canCreate, we might want the first UPDATE to still be huge.
                    // So let's handle spans logic relative to 'idx' of the update itself, regardless of button.

                    let spanClasses = "";
                    // Logic: Index 0 is ALWAYS the featured/big card.
                    if (idx === 0) spanClasses = "lg:col-span-2 lg:row-span-2";
                    else if (idx === 3) spanClasses = "lg:row-span-2";
                    else if (idx === 4) spanClasses = "md:col-span-2";

                    return (
                        <motion.div
                            key={update.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (idx % 12) * 0.05, duration: 0.5 }}
                            className={cn("group rounded-3xl", spanClasses)}
                        >
                            <PillowCard
                                className="w-full h-full"
                                contentClassName="p-0 overflow-hidden bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20"
                                shadowClassName="bg-indigo-500/20"
                            >
                                <Link href={`/updates/${update.id}`} className="block w-full h-full relative cursor-pointer">
                                    {/* Image Background */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={update.image}
                                            alt={update.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur border-transparent font-bold tracking-wider shadow-sm">
                                                {update.category}
                                            </Badge>

                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                                <ArrowUpRight className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        <h3 className={cn(
                                            "font-bold text-white mb-2 leading-tight group-hover:text-indigo-200 transition-colors drop-shadow-sm",
                                            idx === 0 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
                                        )}>
                                            {update.title}
                                        </h3>

                                        {(idx === 0 || idx === 3 || idx === 4) && (
                                            <p className="text-gray-100/90 line-clamp-2 text-sm md:text-base font-medium drop-shadow-sm mb-4">
                                                {update.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-300">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(update.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {update.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </PillowCard>
                        </motion.div>
                    );
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8 pb-4">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="text-muted-foreground hover:text-foreground transition-all gap-2"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More Updates"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
