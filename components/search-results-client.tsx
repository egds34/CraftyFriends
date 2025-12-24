"use client";

import { useState } from "react";
import { SearchResults } from "@/app/actions/search";
import { ArchiveList } from "@/components/updates/archive-list";
import { User, Newspaper, Users, Search as SearchIcon, Calendar, BookOpen, Clock, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PillowCard } from "@/components/ui/pillow-card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { InteractiveHoverBar } from "@/components/ui/interactive-hover-bar"

interface SearchResultsClientProps {
    query: string;
    results: SearchResults;
}

export function SearchResultsClient({ query, results }: SearchResultsClientProps) {
    const [activeTab, setActiveTab] = useState<"all" | "updates" | "players" | "events" | "guides">("all");

    const totalResults = results.updates.length + results.players.length + (results.events?.length || 0) + (results.eventGuides?.length || 0);

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-border pb-4">
                <div className="flex flex-wrap gap-2 p-1 bg-muted/50 backdrop-blur-md rounded-2xl md:rounded-full border border-border">
                    <TabButton
                        active={activeTab === "all"}
                        onClick={() => setActiveTab("all")}
                        icon={<SearchIcon className="w-4 h-4" />}
                        label="All"
                        count={totalResults}
                    />
                    <TabButton
                        active={activeTab === "updates"}
                        onClick={() => setActiveTab("updates")}
                        icon={<Newspaper className="w-4 h-4" />}
                        label="Updates"
                        count={results.updates.length}
                    />
                    <TabButton
                        active={activeTab === "events"}
                        onClick={() => setActiveTab("events")}
                        icon={<Calendar className="w-4 h-4" />}
                        label="Events"
                        count={results.events?.length || 0}
                    />
                    <TabButton
                        active={activeTab === "guides"}
                        onClick={() => setActiveTab("guides")}
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Guides"
                        count={results.eventGuides?.length || 0}
                    />
                    <TabButton
                        active={activeTab === "players"}
                        onClick={() => setActiveTab("players")}
                        icon={<Users className="w-4 h-4" />}
                        label="Players"
                        count={results.players.length}
                    />
                </div>

                <div className="text-sm text-muted-foreground">
                    Showing {totalResults} results for "{query}"
                </div>
            </div>

            {/* Results */}
            <div className="space-y-16">
                {/* Updates Section */}
                {(activeTab === "all" || activeTab === "updates") && results.updates.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Newspaper className="text-primary w-6 h-6" />
                            Latest Updates
                        </h2>
                        <ArchiveList updates={results.updates} />
                    </section>
                )}

                {/* Events Section */}
                {(activeTab === "all" || activeTab === "events") && results.events && results.events.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Calendar className="text-rose-500 w-6 h-6" />
                            Upcoming Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.events.map((event) => (
                                <Link key={event.id} href="/events">
                                    <div className="group bg-card border border-border rounded-3xl p-6 hover:bg-accent transition-all backdrop-blur-sm relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="outline" className={cn(
                                                "capitalize",
                                                event.type === 'GAME' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                    event.type === 'COMPETITION' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        event.type === 'SOCIAL' ? "bg-pink-500/10 text-pink-500 border-pink-500/20" :
                                                            "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                            )}>
                                                {event.type.toLowerCase()}
                                            </Badge>
                                            <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(new Date(event.startTime), 'h:mm a')}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {event.description || "No description provided."}
                                        </p>
                                        <div className="text-sm font-medium text-foreground">
                                            {format(new Date(event.startTime), 'EEEE, MMM do')}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Event Guides Section */}
                {(activeTab === "all" || activeTab === "guides") && results.eventGuides && results.eventGuides.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <BookOpen className="text-emerald-500 w-6 h-6" />
                            Official Game Guides
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {results.eventGuides.map((guide) => (
                                <Link key={guide.id} href="/events">
                                    <PillowCard
                                        className="h-[300px] cursor-pointer group"
                                        shadowClassName="bg-emerald-500/20"
                                        contentClassName="flex flex-col p-0 overflow-hidden"
                                    >
                                        <div className="flex-1 relative overflow-hidden">
                                            <motion.img
                                                src={guide.image}
                                                alt={guide.title}
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left text-white pointer-events-none">
                                                <h3 className="text-2xl font-bold mb-1">{guide.title}</h3>
                                                <p className="text-xs text-white/70 line-clamp-2">{guide.description}</p>
                                            </div>
                                        </div>
                                        <InteractiveHoverBar className="h-12 bg-white/90 dark:bg-slate-100/90 font-bold text-xs uppercase tracking-widest text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            View Playbook <ArrowUpRight className="ml-2 w-3 h-3" />
                                        </InteractiveHoverBar>
                                    </PillowCard>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Players Section */}
                {(activeTab === "all" || activeTab === "players") && results.players.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Users className="text-indigo-500 w-6 h-6" />
                            Players & Community
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.players.map((player) => (
                                <Link
                                    key={player.id}
                                    href={`/profile/${player.minecraftUsername || player.name || player.id}?q=${encodeURIComponent(query)}`}
                                >
                                    <div className="group bg-card border border-border rounded-3xl p-6 hover:bg-accent transition-all backdrop-blur-sm flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted transition-transform group-hover:scale-105">
                                            {player.image ? (
                                                <Image
                                                    src={player.image}
                                                    alt={player.name || player.minecraftUsername || "Player"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary">
                                                    <User className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {player.name || player.minecraftUsername || "Unknown Player"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                {player.minecraftUsername ? `@${player.minecraftUsername}` : 'No Minecraft Link'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {totalResults === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                        <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No results found</h3>
                        <p className="text-muted-foreground">Try searching for something else, like "pixelart", "spleef", or a player name.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                ${active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}
            `}
        >
            {icon}
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${active ? 'bg-black/10 border-black/20' : 'bg-muted border-border'}`}>
                {count}
            </span>
        </button>
    );
}

