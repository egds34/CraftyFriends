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
};

export async function searchGlobal(query: string): Promise<SearchResults> {
    if (!query || query.trim().length === 0) {
        return { updates: [], players: [] };
    }

    const cleanQuery = query.trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 0);
    const noSpacesQuery = cleanQuery.replace(/\s+/g, '');

    // Search Posts (Updates)
    const updates = await prisma.post.findMany({
        where: {
            OR: [
                { title: { contains: cleanQuery, mode: 'insensitive' } },
                { content: { contains: cleanQuery, mode: 'insensitive' } },
                { excerpt: { contains: cleanQuery, mode: 'insensitive' } },
            ],
            published: true,
        },
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

    // 1. Search Registered Users
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

    // 2. Search Player Statistics (Ghost Players who haven't registered)
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

    // 3. Merge and Unify
    const playerMap = new Map<string, SearchResults['players'][0]>();

    registeredUsers.forEach(u => {
        const key = (u.minecraftUsername || u.name || u.id || "unknown").toLowerCase();
        playerMap.set(key, {
            id: u.id,
            name: u.name,
            image: u.image,
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

    return { updates, players };
}
