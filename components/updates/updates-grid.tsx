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
import { InteractiveHoverBar } from "@/components/ui/interactive-hover-bar";
import { JellyDots } from "@/components/ui/jelly-dots";

// ... imports

interface UpdatesGridProps {
    initialUpdates: ServerUpdate[]; // Renamed for clarity
    canCreate?: boolean;
    initialHasMore?: boolean;
    showSearch?: boolean;
}

export function UpdatesGrid({ initialUpdates, canCreate, showSearch = true }: UpdatesGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileVisibleCount, setMobileVisibleCount] = useState(5);

    // Filter updates based on search
    const filteredUpdates = initialUpdates.filter(update =>
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Desktop: Split into Featured and Paginated (Only if NOT SEARCHING)
    const featuredUpdates = !searchQuery ? filteredUpdates.slice(0, 3) : [];
    const remainingUpdates = !searchQuery ? filteredUpdates.slice(3) : [];

    // Desktop Pagination State (Only used for non-search mode)
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 4;
    const totalPages = Math.ceil(remainingUpdates.length / PAGE_SIZE);

    const currentPaginatedUpdates = remainingUpdates.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE
    );

    // ... (rest of helper functions same as before)

    // Helper functions (loadMoreMobile, getPaginatedSpan) remain same
    const loadMoreMobile = () => {
        if (mobileVisibleCount < filteredUpdates.length) {
            setMobileVisibleCount(prev => Math.min(prev + 5, filteredUpdates.length));
        }
    };

    const getPaginatedSpan = (indexInPage: number, page: number, count: number) => {
        if (count < 4) return "md:col-span-1 lg:col-span-2";
        const pattern = page % 3;
        if (pattern === 0) {
            if (indexInPage === 0) return "md:col-span-1 lg:col-span-1";
            if (indexInPage === 1) return "md:col-span-1 lg:col-span-3";
            if (indexInPage === 2) return "md:col-span-1 lg:col-span-3";
            return "md:col-span-1 lg:col-span-1";
        }
        if (pattern === 1) {
            if (indexInPage === 0) return "md:col-span-1 lg:col-span-2 lg:row-span-2";
            if (indexInPage === 1) return "md:col-span-1 lg:col-span-2";
            return "md:col-span-1 lg:col-span-1";
        }
        if (pattern === 2) {
            if (indexInPage === 1) return "md:col-span-1 lg:col-span-2 lg:row-span-2";
            if (indexInPage === 0) return "md:col-span-1 lg:col-span-2";
            return "md:col-span-1 lg:col-span-1";
        }
        return "md:col-span-1 lg:col-span-2";
    };

    return (
        <div className="space-y-12">

            {/* Search Bar */}
            {showSearch && (
                <div className="max-w-md mx-auto relative mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search articles & guides..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(0); // Reset pagination on search
                                setMobileVisibleCount(5); // Reset mobile scroll
                            }}
                            className="w-full bg-muted/40 dark:bg-muted/60 border-2 border-border dark:border-border/80 rounded-full px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Loader2 className={cn("w-4 h-4 animate-spin", !searchQuery && "hidden")} />
                            {!searchQuery && <div className="w-4 h-4 bg-primary/20 rounded-full" />}
                        </div>
                    </div>
                </div>
            )}

            {filteredUpdates.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No matches found.</p>
                </div>
            )}

            {/* DESKTOP VIEW */}
            <div className="hidden md:block space-y-24">

                {/* SEARCH RESULTS MODE: Simple 4 Column Grid */}
                {searchQuery && filteredUpdates.length > 0 && (
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[300px]"
                        >
                            {filteredUpdates.map((update, idx) => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    idx={idx}
                                    spanClasses="col-span-1 row-span-1"
                                />
                            ))}
                        </motion.div>
                    </div>
                )}

                {/* NORMAL MODE: Featured + Bento */}
                {!searchQuery && (
                    <>
                        {/* 1. Featured Section (Top 3) */}
                        {featuredUpdates.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[340px]">
                                {featuredUpdates.map((update, idx) => {
                                    let span = "";
                                    if (idx === 0) span = "lg:col-span-2 lg:row-span-2";
                                    else span = "lg:col-span-1 lg:row-span-1";

                                    return (
                                        <UpdateCard
                                            key={update.id}
                                            update={update}
                                            idx={idx}
                                            spanClasses={span}
                                            isFeatured={true}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* 2. Divider */}
                        {remainingUpdates.length > 0 && (
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase bg-background px-4 text-muted-foreground font-bold tracking-widest">
                                    <span>Recent Updates</span>
                                </div>
                            </div>
                        )}

                        {/* 3. Paginated Bento Grid */}
                        {remainingUpdates.length > 0 && (
                            <div className="space-y-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPage}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[300px]"
                                    >
                                        {Array.from({ length: 4 }).map((_, idx) => {
                                            const update = currentPaginatedUpdates[idx];
                                            const spanClass = getPaginatedSpan(idx, currentPage, currentPaginatedUpdates.length);

                                            if (update) {
                                                return (
                                                    <UpdateCard
                                                        key={update.id}
                                                        update={update}
                                                        idx={idx}
                                                        spanClasses={spanClass}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div key={`placeholder-${idx}`} className={cn("invisible", spanClass)} aria-hidden="true" />
                                                );
                                            }
                                        })}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-6 pt-8">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-32 rounded-full border-border/50"
                                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </Button>

                                        <JellyDots
                                            total={totalPages}
                                            active={currentPage}
                                            onDotClick={(i) => setCurrentPage(i)}
                                        />

                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-32 rounded-full border-border/50"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={currentPage === totalPages - 1}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MOBILE VIEW (Infinite Scroll) */}
            <div className="block md:hidden space-y-8">
                {filteredUpdates.slice(0, mobileVisibleCount).map((update, idx) => (
                    <div key={update.id} className="h-[340px]">
                        <UpdateCard
                            update={update}
                            idx={idx}
                            spanClasses="w-full h-full"
                            isFeatured={idx === 0} // First item on mobile is also featured
                        />
                    </div>
                ))}

                {/* Infinite Scroll Trigger */}
                {mobileVisibleCount < filteredUpdates.length && (
                    <motion.div
                        onViewportEnter={loadMoreMobile}
                        className="py-8 flex justify-center"
                    >
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </motion.div>
                )}

                {filteredUpdates.length > 0 && mobileVisibleCount >= filteredUpdates.length && (
                    <p className="text-center text-xs text-muted-foreground uppercase tracking-widest pt-8 pb-4">
                        You're all caught up!
                    </p>
                )}
            </div>

        </div>
    );
}

function getCategoryStyles(category: string) {
    const cat = category.toLowerCase();
    switch (cat) {
        case 'event':
            return {
                shadow: "bg-rose-500/20 dark:bg-rose-500/60 dark:shadow-[0_0_25px_rgba(244,63,94,0.4)]",
                accent: "text-rose-600 dark:text-rose-300",
                badge: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 dark:bg-rose-500/20",
                hoverBg: "group-hover:bg-rose-500 dark:group-hover:bg-rose-400"
            };
        case 'patch-notes':
            return {
                shadow: "bg-blue-500/20 dark:bg-blue-500/60 dark:shadow-[0_0_25px_rgba(59,130,246,0.4)]",
                accent: "text-blue-600 dark:text-blue-300",
                badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-300 dark:border-blue-500/40 dark:bg-blue-500/20",
                hoverBg: "group-hover:bg-blue-500 dark:group-hover:bg-blue-400"
            };
        case 'community':
            return {
                shadow: "bg-emerald-500/20 dark:bg-emerald-500/60 dark:shadow-[0_0_25px_rgba(16,185,129,0.4)]",
                accent: "text-emerald-600 dark:text-emerald-300",
                badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 dark:bg-emerald-500/20",
                hoverBg: "group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400"
            };
        case 'announcement':
            return {
                shadow: "bg-violet-500/20 dark:bg-violet-500/60 dark:shadow-[0_0_25px_rgba(139,92,246,0.4)]",
                accent: "text-violet-600 dark:text-violet-300",
                badge: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 dark:bg-violet-500/20",
                hoverBg: "group-hover:bg-violet-500 dark:group-hover:bg-violet-400"
            };
        default:
            return {
                shadow: "bg-indigo-500/20 dark:bg-indigo-500/60 dark:shadow-[0_0_25px_rgba(99,102,241,0.4)]",
                accent: "text-indigo-600 dark:text-indigo-300",
                badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40 dark:bg-indigo-500/20",
                hoverBg: "group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400"
            };
    }
}

// Helper to render a single card
function UpdateCard({ update, idx, spanClasses, isFeatured = false }: { update: ServerUpdate, idx: number, spanClasses: string, isFeatured?: boolean }) {
    const styles = getCategoryStyles(update.category);
    const [isHovering, setIsHovering] = useState(false);

    return (
        <motion.div
            key={update.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
            }}
            className={cn("group relative", spanClasses)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <PillowCard
                className="w-full h-full cursor-pointer"
                contentClassName="p-0 overflow-hidden bg-card border-border/50 flex flex-col"
                shadowClassName={styles.shadow}
            >
                <Link href={`/updates/${update.id}`} className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Image Background Wrapper */}
                    <div className="absolute inset-0 z-0">
                        <motion.div
                            className="w-full h-full relative"
                            animate={{ scale: isHovering ? 1.1 : 1 }}
                            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }} // Smooth easeOutExpo
                        >
                            <Image
                                src={update.image}
                                alt={update.title}
                                fill
                                className="object-cover opacity-80 dark:opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </motion.div>
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
                                    {new Date(update.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <h3 className={cn(
                            "font-black text-white mb-3 leading-tight transition-colors drop-shadow-2xl",
                            isFeatured && idx === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                        )}>
                            {update.title}
                        </h3>

                        {isFeatured && (
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

                    {/* Bottom interactive bar */}
                    <InteractiveHoverBar className={cn(
                        "h-14 w-full font-heading font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 bg-white/90 dark:bg-black/40 backdrop-blur-md border-t border-white/10 group-hover:text-white",
                        styles.hoverBg
                    )}>
                        Read Article
                        <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                    </InteractiveHoverBar>
                </Link>
            </PillowCard>
        </motion.div>
    );
}
