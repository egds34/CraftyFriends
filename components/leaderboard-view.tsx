"use client"

import { motion } from "framer-motion"
import { Trophy, Medal, User as UserIcon } from "lucide-react"

// Mock Data
const LEADERBOARD_DATA = [
    { rank: 1, username: "TechnoKing", score: 12500, playtime: "450h", role: "Elite" },
    { rank: 2, username: "CraftyMiner", score: 11200, playtime: "380h", role: "Premium" },
    { rank: 3, username: "RedstonePro", score: 9800, playtime: "310h", role: "Premium" },
    { rank: 4, username: "BedWarsChamp", score: 8500, playtime: "250h", role: "Basic" },
    { rank: 5, username: "BuilderBob", score: 7200, playtime: "190h", role: "Basic" },
    { rank: 6, username: "Survivalist", score: 6500, playtime: "150h", role: "Basic" },
    { rank: 7, username: "PvPVeteran", score: 5900, playtime: "120h", role: "Elite" },
    { rank: 8, username: "SpeedRunner", score: 5200, playtime: "90h", role: "Premium" },
    { rank: 9, username: "Explorer99", score: 4800, playtime: "80h", role: "Basic" },
    { rank: 10, username: "NoobMaster", score: 4500, playtime: "70h", role: "Basic" },
]

export function LeaderboardView() {
    return (
        <>
            <div className="pt-24 pb-12 px-4 text-center relative">
                <div
                    className="absolute inset-0 bg-primary/5 transition-colors duration-500"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center relative z-10"
                >
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Trophy className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        Server Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        The top performing players on Crafty Friends. Compete, climb the ranks, and earn your place in history!
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="container mx-auto px-4 py-8 max-w-4xl bg-card border rounded-xl shadow-lg overflow-hidden"
            >
                {/* Header */}
                <div className="grid grid-cols-5 bg-muted/50 p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-2">Player</div>
                    <div className="col-span-1 text-right">Score</div>
                    <div className="col-span-1 text-right">Playtime</div>
                </div>

                {/* Rows */}
                <div className="divide-y">
                    {LEADERBOARD_DATA.map((player, index) => (
                        <motion.div
                            key={player.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                            className="grid grid-cols-5 p-4 items-center hover:bg-muted/30 transition-colors"
                        >
                            <div className="col-span-1 flex justify-center">
                                {player.rank === 1 && <Medal className="w-6 h-6 text-yellow-500" />}
                                {player.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                                {player.rank === 3 && <Medal className="w-6 h-6 text-amber-700" />}
                                {player.rank > 3 && <span className="text-muted-foreground font-mono w-6 text-center">{player.rank}</span>}
                            </div>
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <span className="font-bold">{player.username}</span>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                                            ${player.role === 'Elite' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                                player.role === 'Premium' ? 'bg-primary/10 text-primary' :
                                                    'bg-muted text-muted-foreground'}`
                                        }>
                                            {player.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1 text-right font-mono font-bold text-lg">
                                {player.score.toLocaleString()}
                            </div>
                            <div className="col-span-1 text-right text-muted-foreground font-mono">
                                {player.playtime}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </>
    )
}
