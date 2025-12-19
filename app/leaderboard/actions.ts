"use server"

import { prisma } from "@/lib/prisma"

interface StatDefinition {
    section: string
    label: string
    unit: string
    format?: (val: number) => number
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
    // 1. Fetch relevant statistics
    // We fetch broader categories to sure we get the data, then filter in memory
    const stats = await prisma.statistic.findMany({
        where: {
            OR: [
                { category: "minecraft:custom" },
                {
                    id: {
                        in: [
                            "minecraft:mined:total",
                            "minecraft:broken:total",
                            "minecraft:crafted:total",
                            "minecraft:picked_up:total",
                            "minecraft:dropped:total",
                            "minecraft:used:total"
                        ]
                    }
                }
            ]
        },
        include: {
            playerStats: {
                orderBy: { value: 'desc' },
                take: 50
            }
        },
        take: 5000 // Ensure we fetch enough to find our whitelist matches
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
