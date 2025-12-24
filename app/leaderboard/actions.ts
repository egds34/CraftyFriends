"use server"

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { auth } from "@/auth"
import { unstable_noStore as noStore } from "next/cache"

interface StatDefinition {
    section: string
    label: string
    unit: string
    format?: (val: number) => number
}
// ... (StatDefinition and STAT_DEFINITIONS remain unchanged)

// ... (getLeaderboardData remains unchanged)

export interface PlayerProfile {
    username: string
    skinUrl: string
    lastSeen: Date
    playTimeSeconds: number
    recentAdvancements: {
        id: string
        title: string
        description: string | null
        icon: string | null
        date: Date
    }[]
    keyStats: {
        label: string
        value: string
    }[]
}

// ... types match ...

const getCachedPlayerProfile = unstable_cache(
    async (username: string): Promise<PlayerProfile | null> => {
        // Validate Username (Minecraft usernames are 3-16 chars, alphanumeric + underscores)
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            return null
        }

        // 1. Fetch recent advancements
        const recentAdvancements = await prisma.userAdvancement.findMany({
            where: { username, done: true },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            include: { advancement: true }
        })

        // 2. Fetch ALL stats for this user to ensure we catch them regardless of exact ID prefixing
        const stats = await prisma.playerStatistic.findMany({
            where: { username },
            include: { statistic: true }
        })

        if (recentAdvancements.length === 0 && stats.length === 0) {
            return null
        }

        // 3. Determine Last Seen (max updatedAt of stats)
        const lastSeen = stats.length > 0
            ? stats.reduce((latest, s) => s.updatedAt > latest ? s.updatedAt : latest, new Date(0))
            : new Date()

        // 4. Format Data (using looser matching logic)
        // Helper to find stat by ID or fuzzy name match
        const findStat = (id: string, name: string) => {
            return stats.find(s => s.statId === id || s.statistic.name === name || s.statId.endsWith(`:${name}`))
        }

        const playTimeStat = findStat("minecraft:play_time", "play_time")
        const playTimeSeconds = playTimeStat ? Number(playTimeStat.value) / 20 : 0

        const formattedStats = [
            {
                label: "Check-ins",
                value: findStat("minecraft:jump", "jump")?.value.toLocaleString() ?? "0"
            },
            {
                label: "Mobs Defeated",
                value: findStat("minecraft:mob_kills", "mob_kills")?.value.toLocaleString() ?? "0"
            },
            {
                label: "Deaths",
                value: findStat("minecraft:deaths", "deaths")?.value.toLocaleString() ?? "0"
            }
        ]

        return {
            username,
            skinUrl: `https://minskin.spooky.click/helm/${username}/100.png`,
            lastSeen,
            playTimeSeconds,
            recentAdvancements: recentAdvancements.map(ua => ({
                id: ua.advancement.id,
                title: ua.advancement.name,
                description: ua.advancement.description,
                icon: ua.advancement.icon,
                date: ua.updatedAt
            })),
            keyStats: formattedStats
        }
    },
    ['player-profile-data'],
    { revalidate: 60, tags: ['player-profile'] }
)

// ... imports

// ...

export async function getPlayerDetails(username: string): Promise<PlayerProfile | null> {
    const session = await auth()
    if (!session) return null

    return await getCachedPlayerProfile(username)
}

const STAT_DEFINITIONS: Record<string, StatDefinition> = {
    // Distance (Movement & Exploration)
    "minecraft:walk_one_cm": { section: "Distance", label: "Furthest Blocks Walked", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:crouch_one_cm": { section: "Distance", label: "Furthest Blocks Crouched", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:sprint_one_cm": { section: "Distance", label: "Furthest Blocks Sprinted", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:walk_on_water_one_cm": { section: "Distance", label: "Furthest Blocks Walked on Water", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:walk_under_water_one_cm": { section: "Distance", label: "Furthest Blocks Walked Underwater", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:climb_one_cm": { section: "Distance", label: "Furthest Blocks Climbed", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:swim_one_cm": { section: "Distance", label: "Furthest Blocks Swam", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:fly_one_cm": { section: "Distance", label: "Furthest Blocks Flown", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:aviate_one_cm": { section: "Distance", label: "Furthest Blocks Aviated", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:boat_one_cm": { section: "Distance", label: "Furthest Blocks Boated", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:horse_one_cm": { section: "Distance", label: "Furthest Blocks on Horseback", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:minecart_one_cm": { section: "Distance", label: "Furthest Blocks by Minecart", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:strider_one_cm": { section: "Distance", label: "Furthest Blocks on Strider", unit: "Blocks", format: (v) => Math.round(v / 100) },
    "minecraft:fall_one_cm": { section: "Distance", label: "Furthest Blocks Fallen", unit: "Blocks", format: (v) => Math.round(v / 100) },

    // Combat (Fighting & Survival)
    "minecraft:mob_kills": { section: "Combat", label: "Most Mobs Defeated", unit: "Mobs" },
    "minecraft:deaths": { section: "Combat", label: "Most Times Died", unit: "Deaths" },
    "minecraft:damage_dealt": { section: "Combat", label: "Most Damage Dealt", unit: "Damage" },
    "minecraft:damage_taken": { section: "Combat", label: "Most Damage Taken", unit: "Damage" },
    "minecraft:damage_blocked_by_shield": { section: "Combat", label: "Most Damage Blocked", unit: "Damage" },

    // General (Lifestyle & Interactions)
    "minecraft:play_time": { section: "General", label: "Most Play Time", unit: "Hours", format: (v) => Math.round(v / 20 / 60 / 60) }, // Ticks -> Seconds -> Minutes -> Hours
    "minecraft:total_world_time": { section: "General", label: "Most Total World Time", unit: "Hours", format: (v) => Math.round(v / 20 / 60 / 60) },
    "minecraft:time_since_death": { section: "General", label: "Longest Time Since Last Death", unit: "Hours", format: (v) => Math.round(v / 20 / 60 / 60) },
    "minecraft:jump": { section: "General", label: "Most Jumps", unit: "Jumps" },
    "minecraft:sleep_in_bed": { section: "General", label: "Most Times Slept", unit: "Times" },
    "minecraft:traded_with_villager": { section: "General", label: "Most Trades Completed", unit: "Trades" },
    "minecraft:fish_caught": { section: "General", label: "Most Fish Caught", unit: "Fish" },
    "minecraft:animals_bred": { section: "General", label: "Most Animals Bred", unit: "Animals" },
    "minecraft:bell_ring": { section: "General", label: "Most Bells Rung", unit: "Bells" },

    // Items (Aggregated Usage)
    // Keys match the full ID in database for these aggregated stats
    "minecraft:mined:total": { section: "Items", label: "Most Blocks Mined", unit: "Blocks" },
    "minecraft:broken:total": { section: "Items", label: "Most Tools Broken", unit: "Tools" },
    "minecraft:crafted:total": { section: "Items", label: "Most Items Crafted", unit: "Items" },
    "minecraft:picked_up:total": { section: "Items", label: "Most Items Picked Up", unit: "Items" },
    "minecraft:dropped:total": { section: "Items", label: "Most Items Dropped", unit: "Items" },
    "minecraft:used:total": { section: "Items", label: "Most Items Used", unit: "Items" },
}

export interface TopPlayer {
    username: string
    value: number
}

export interface LeaderboardCategory {
    statId: string
    statisticName: string
    displayName: string
    section: string
    unit: string
    topPlayers: TopPlayer[]
}

export async function getLeaderboardData(): Promise<LeaderboardCategory[]> {
    noStore();
    // 1. Fetch relevant statistics
    const whitelist = Object.keys(STAT_DEFINITIONS)
    const stats = await prisma.statistic.findMany({
        where: {
            OR: [
                { id: { in: whitelist } },
                { name: { in: whitelist }, category: "minecraft:custom" }
            ]
        },
        include: {
            playerStats: {
                orderBy: { value: 'desc' },
                take: 50
            }
        }
    })

    // 2. Transform and Filter data based on STAT_DEFINITIONS
    const leaderboardData: LeaderboardCategory[] = []

    for (const stat of stats) {
        // Try looking up by ID first (precise match for aggregated stats), then by name (for custom stats)
        const def = STAT_DEFINITIONS[stat.id] || STAT_DEFINITIONS[stat.name]

        // Only include stats we have explicitly defined/whitelisted
        if (!def) continue;

        if (stat.playerStats.length === 0) continue;

        const transformedPlayers = stat.playerStats.map(ps => ({
            username: ps.username,
            value: def.format ? def.format(Number(ps.value)) : Number(ps.value)
        }))

        leaderboardData.push({
            statId: stat.id,
            statisticName: stat.name,
            displayName: def.label,
            section: def.section,
            unit: def.unit,
            topPlayers: transformedPlayers
        })
    }

    // Sort: Section Order -> Name alphabetical
    const sectionOrder: Record<string, number> = { "Distance": 1, "Combat": 2, "General": 3, "Items": 4 }
    leaderboardData.sort((a, b) => {
        const secDiff = (sectionOrder[a.section] || 99) - (sectionOrder[b.section] || 99)
        if (secDiff !== 0) return secDiff
        return a.displayName.localeCompare(b.displayName)
    })

    return leaderboardData
}

export async function getMockLeaderboardData(): Promise<LeaderboardCategory[]> {
    const categories = Object.entries(STAT_DEFINITIONS).map(([id, def]) => {
        const topPlayers: TopPlayer[] = Array.from({ length: 100 }, (_, i) => ({
            username: `Player_${i + 1}`,
            value: Math.floor(Math.random() * 10000)
        }))

        // Sort mock players by value descending
        topPlayers.sort((a, b) => b.value - a.value)

        return {
            statId: id,
            statisticName: id,
            displayName: def.label,
            section: def.section,
            unit: def.unit,
            topPlayers
        }
    })

    const sectionOrder: Record<string, number> = { "Distance": 1, "Combat": 2, "General": 3, "Items": 4 }
    return categories.sort((a, b) => {
        const secDiff = (sectionOrder[a.section] || 99) - (sectionOrder[b.section] || 99)
        if (secDiff !== 0) return secDiff
        return a.displayName.localeCompare(b.displayName)
    })
}


