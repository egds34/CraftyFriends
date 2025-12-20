"use client";

import { useState } from "react";
import { SearchResults } from "@/app/actions/search";
import { ArchiveList } from "@/components/updates/archive-list";
import { User, Newspaper, Users, Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResultsClientProps {
    query: string;
    results: SearchResults;
}

export function SearchResultsClient({ query, results }: SearchResultsClientProps) {
    const [activeTab, setActiveTab] = useState<"all" | "updates" | "players">("all");

    const filteredUpdates = activeTab === "players" ? [] : results.updates;
    const filteredPlayers = activeTab === "updates" ? [] : results.players;

    const totalResults = results.updates.length + results.players.length;

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/5">
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
            <div className="space-y-12">
                {/* Updates Section */}
                {(activeTab === "all" || activeTab === "updates") && results.updates.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Newspaper className="text-primary w-6 h-6" />
                            Latest Updates
                        </h2>
                        <ArchiveList updates={results.updates} />
                    </section>
                )}

                {/* Players Section */}
                {(activeTab === "all" || activeTab === "players") && results.players.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Users className="text-primary w-6 h-6" />
                            Players & Community
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.players.map((player) => (
                                <Link
                                    key={player.id}
                                    href={`/profile/${player.minecraftUsername || player.name || player.id}`}
                                >
                                    <div className="group bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted">
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
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No results found</h3>
                        <p className="text-muted-foreground">Try searching for something else, like "pixelart" or a player name.</p>
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
                    ? "bg-primary text-black shadow-lg"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"}
            `}
        >
            {icon}
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${active ? 'bg-black/10 border-black/20' : 'bg-white/10 border-white/10'}`}>
                {count}
            </span>
        </button>
    );
}
