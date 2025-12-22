'use server';

import { prisma } from "@/lib/prisma";

export type SearchResults = {
    updates: {
        id: string;
        title: string;
        excerpt: string;
        content: string;
        image: string;
        category: string;
        author: string;
        createdAt: Date;
    }[];
    players: {
        id: string;
        name: string | null;
        image: string | null;
        minecraftUsername: string | null;
    }[];
    events: {
        id: string;
        title: string;
        description: string | null;
        startTime: Date;
        type: string;
    }[];
    eventGuides: {
        id: string;
        title: string;
        description: string;
        image: string;
        howTo: string[];
        rules: string[];
    }[];
};

export async function searchGlobal(query: string): Promise<SearchResults> {
    try {
        if (!query || query.trim().length === 0) {
            return { updates: [], players: [], events: [], eventGuides: [] };
        }

        const cleanQuery = query.trim();
        const words = cleanQuery.split(/\s+/).filter(w => w.length > 0);
        const noSpacesQuery = cleanQuery.replace(/\s+/g, '');

        console.log(`[Search] Start: "${cleanQuery}"`);

        // Check if prisma is undefined
        if (!prisma) {
            console.error("[Search] Prisma client is undefined!");
            return { updates: [], players: [], events: [], eventGuides: [] };
        }

        // Search Posts (Updates)
        const updates = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: cleanQuery, mode: 'insensitive' } },
                    { content: { contains: cleanQuery, mode: 'insensitive' } },
                    { excerpt: { contains: cleanQuery, mode: 'insensitive' } },
                ],
                published: true,
            } as any,
            select: {
                id: true,
                title: true,
                excerpt: true,
                content: true,
                image: true,
                category: true,
                author: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        // Search Events
        const events = await prisma.event.findMany({
            where: {
                OR: [
                    { title: { contains: cleanQuery, mode: 'insensitive' } },
                    { description: { contains: cleanQuery, mode: 'insensitive' } },
                ]
            } as any,
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                type: true,
            },
            orderBy: {
                startTime: 'asc',
            },
            take: 10,
        });

        // Search Event Guides (EventTypeInfo)
        const eventGuides = await prisma.eventTypeInfo.findMany({
            where: {
                OR: [
                    { title: { contains: cleanQuery, mode: 'insensitive' } },
                    { description: { contains: cleanQuery, mode: 'insensitive' } },
                ]
            } as any,
            take: 10,
        });

        // Search Registered Users
        const registeredUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: cleanQuery, mode: 'insensitive' } },
                    { minecraftUsername: { contains: cleanQuery, mode: 'insensitive' } },
                    { name: { contains: noSpacesQuery, mode: 'insensitive' } },
                    { minecraftUsername: { contains: noSpacesQuery, mode: 'insensitive' } },
                    ...words.map(word => ({
                        OR: [
                            { name: { contains: word, mode: 'insensitive' } },
                            { minecraftUsername: { contains: word, mode: 'insensitive' } },
                        ]
                    }))
                ]
            } as any,
            select: {
                id: true,
                name: true,
                image: true,
                minecraftUsername: true,
            },
            take: 20,
        });

        // Search Player Statistics (Ghost Players who haven't registered)
        const statsPlayers = await prisma.playerStatistic.findMany({
            where: {
                OR: [
                    { username: { contains: cleanQuery, mode: 'insensitive' } },
                    { username: { contains: noSpacesQuery, mode: 'insensitive' } },
                    ...words.map(word => ({
                        username: { contains: word, mode: 'insensitive' }
                    }))
                ]
            } as any,
            select: {
                username: true,
            },
            distinct: ['username'],
            take: 20,
        });

        // Merge and Unify Players
        const playerMap = new Map<string, SearchResults['players'][0]>();

        registeredUsers.forEach(u => {
            const key = (u.minecraftUsername || u.name || u.id || "unknown").toLowerCase();
            let image = u.image;
            if (u.minecraftUsername) {
                image = `https://api.mineatar.io/face/${u.minecraftUsername}`;
            }

            playerMap.set(key, {
                id: u.id,
                name: u.name,
                image: image,
                minecraftUsername: u.minecraftUsername,
            });
        });

        statsPlayers.forEach(p => {
            if (!p.username) return;
            const key = p.username.toLowerCase();
            if (!playerMap.has(key)) {
                playerMap.set(key, {
                    id: `ghost-${p.username}`,
                    name: p.username,
                    image: null,
                    minecraftUsername: p.username,
                });
            }
        });

        const players = Array.from(playerMap.values()).slice(0, 15);
        console.log(`[Search] Results: updates=${updates.length}, events=${events.length}, guides=${eventGuides.length}, players=${players.length}`);

        return { updates, players, events, eventGuides };
    } catch (error) {
        console.error("[Search] Critical Error:", error);
        return { updates: [], players: [], events: [], eventGuides: [] };
    }
}
