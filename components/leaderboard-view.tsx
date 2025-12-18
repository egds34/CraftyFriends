"use client"

import { motion } from "framer-motion"
import { Trophy, Medal, User as UserIcon, Star } from "lucide-react"

interface Player {
    rank: number
    username: string
    achievements: number
    totalAchievements: number
    role: string
}

interface LeaderboardViewProps {
    players: Player[]
}

export function LeaderboardView({ players }: LeaderboardViewProps) {
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
                    <h1 className="text-4xl font-heading font-extrabold tracking-tight lg:text-5xl mb-4">
                        Server Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        The top achievers on Crafty Friends. Who will be the ultimate champion?
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
                <div className="grid grid-cols-6 bg-muted/50 p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-3">Player</div>
                    <div className="col-span-2 text-right">Achievements</div>
                </div>

                {/* Rows */}
                <div className="divide-y">
                    {players.map((player, index) => (
                        <motion.div
                            key={player.username}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                            className="grid grid-cols-6 p-4 items-center hover:bg-muted/30 transition-colors"
                        >
                            <div className="col-span-1 flex justify-center">
                                {player.rank === 1 && <Medal className="w-6 h-6 text-yellow-500" />}
                                {player.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                                {player.rank === 3 && <Medal className="w-6 h-6 text-amber-700" />}
                                {player.rank > 3 && <span className="text-muted-foreground font-mono w-6 text-center">{player.rank}</span>}
                            </div>
                            <div className="col-span-3 flex items-center gap-3">
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
                            <div className="col-span-2 text-right flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-mono font-bold text-lg">
                                        {player.achievements} / {player.totalAchievements}
                                    </span>
                                </div>
                                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(player.achievements / (player.totalAchievements || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {players.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground italic">
                            No players found on the leaderboard yet.
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    )
}
