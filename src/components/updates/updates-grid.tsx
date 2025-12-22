"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@prisma/client";
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
    initialUpdates: Post[];
    canCreate?: boolean;
    initialHasMore?: boolean;
}

export function UpdatesGrid({ initialUpdates, canCreate, initialHasMore = false }: UpdatesGridProps) {
    // Type assertion to any for now to avoid strict mismatches if data comes from different sources, 
    // but ideally we normalize.
    const [updates, setUpdates] = useState<Post[]>(initialUpdates);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [offset, setOffset] = useState(initialUpdates.length);

    async function loadMore() {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        const result = await getUpdates(offset, 12);

        if (result.success && result.data) {
            setUpdates(prev => [...prev, ...result.data as Post[]]);
            setHasMore(result.hasMore || false);
            setOffset(prev => prev + result.data.length);
        }

        setIsLoadingMore(false);
    }

    const getCategoryStyles = (category: string) => {
        const cat = category.toLowerCase();
        switch (cat) {
            case 'event':
                return {
                    shadow: "bg-rose-500/25 dark:bg-rose-500/40",
                    accent: "text-rose-600 dark:text-rose-400",
                    badge: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/30",
                    hoverBg: "group-hover:bg-rose-500"
                };
            case 'patch-notes':
                return {
                    shadow: "bg-blue-500/25 dark:bg-blue-500/40",
                    accent: "text-blue-600 dark:text-blue-400",
                    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
                    hoverBg: "group-hover:bg-blue-500"
                };
            case 'community':
                return {
                    shadow: "bg-emerald-500/25 dark:bg-emerald-500/40",
                    accent: "text-emerald-600 dark:text-emerald-400",
                    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
                    hoverBg: "group-hover:bg-emerald-500"
                };
            case 'announcement':
                return {
                    shadow: "bg-violet-500/25 dark:bg-violet-500/40",
                    accent: "text-violet-600 dark:text-violet-400",
                    badge: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 dark:border-violet-500/30",
                    hoverBg: "group-hover:bg-violet-500"
                };
            default:
                return {
                    shadow: "bg-indigo-500/25 dark:bg-indigo-500/40",
                    accent: "text-indigo-600 dark:text-indigo-400",
                    badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
                    hoverBg: "group-hover:bg-indigo-500"
                };
        }
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[340px]">

                {updates.map((update, idx) => {
                    const styles = getCategoryStyles(update.category);
                    let spanClasses = "";
                    if (idx === 0) spanClasses = "lg:col-span-2 lg:row-span-2";
                    else if (idx === 3) spanClasses = "lg:row-span-2";
                    else if (idx === 4) spanClasses = "md:col-span-2";

                    return (
                        <motion.div
                            key={update.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                                delay: (idx % 12) * 0.05
                            }}
                            className={cn("group relative", spanClasses)}
                        >
                            <PillowCard
                                className="w-full h-full cursor-pointer"
                                contentClassName="p-0 overflow-hidden bg-card border-border/50 flex flex-col"
                                shadowClassName={styles.shadow}
                            >
                                <Link href={`/updates/${update.id}`} className="flex-1 flex flex-col relative overflow-hidden">
                                    {/* Image Background Wrapper */}
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={update.image || '/images/placeholder.jpg'} // Fallback allowed
                                            alt={update.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-70"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="relative z-10 flex-1 p-6 md:p-8 flex flex-col justify-end">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="outline" className={cn("px-3 py-1 font-bold tracking-widest uppercase text-[10px] backdrop-blur-md bg-white/10 dark:bg-black/10", styles.badge)}>
                                                {update.category.replace('-', ' ')}
                                            </Badge>

                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/70">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-3 h-3" />
                                                    {new Date(update.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className={cn(
                                            "font-black text-white mb-3 leading-tight transition-colors drop-shadow-2xl",
                                            idx === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                                        )}>
                                            {update.title}
                                        </h3>

                                        {(idx === 0 || idx === 3 || idx === 4) && (
                                            <p className="text-white/80 line-clamp-2 text-sm md:text-base font-medium mb-6 max-w-xl">
                                                {update.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tight text-white/50">
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {update.author}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {update.readTime}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom interactive bar - Theme Aware */}
                                    <div className={cn(
                                        "h-14 w-full flex items-center justify-center font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 bg-muted/50 dark:bg-muted/30 backdrop-blur-md border-t border-border/50 group-hover:text-white",
                                        styles.hoverBg
                                    )}>
                                        Read Article
                                        <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
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
