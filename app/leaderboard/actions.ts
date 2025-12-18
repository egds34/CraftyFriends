"use server"

import { prisma } from "@/lib/prisma"

export interface TopPlayer {
    username: string
    value: number
}

export interface LeaderboardCategory {
    statId: string
    statisticName: string
    displayName: string
    topPlayers: TopPlayer[]
}

export async function getLeaderboardData(): Promise<LeaderboardCategory[]> {
    // 1. Fetch relevant statistics
    // In a real scenario, you might want to filter this list or configure it
    // For now, let's fetch statistics that have player data
    const stats = await prisma.statistic.findMany({
        where: {
            category: "minecraft:custom",
            // optional: limit to specific interesting stats to avoid overwhelming the page
        },
        include: {
            playerStats: {
                orderBy: { value: 'desc' },
                take: 5
            }
        },
        take: 20 // Limit to 20 categories for performance
    })

    // 2. Transform data
    const leaderboardData: LeaderboardCategory[] = stats.map(stat => ({
        statId: stat.id,
        statisticName: stat.name.replace('minecraft:', '').replace(/_/g, ' '), // aesthetic cleanup
        displayName: stat.displayName || stat.name.replace('minecraft:', '').replace(/_/g, ' '),
        topPlayers: stat.playerStats.map(ps => ({
            username: ps.username,
            value: Number(ps.value)
        }))
    })).filter(cat => cat.topPlayers.length > 0) // Only show categories with data

    return leaderboardData
}
