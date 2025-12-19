import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedMetrics = unstable_cache(
    async (take: number) => {
        const metrics = await prisma.serverMetric.findMany({
            take: take,
            orderBy: {
                timestamp: 'desc',
            },
        });

        // Serialize BigInts to strings while inside the cache boundary
        // This ensures the data is serializable by Next.js's caching layer
        return metrics.map(m => ({
            id: m.id,
            timestamp: m.timestamp.toISOString(),
            serverName: m.serverName,
            tps: m.tps,
            mspt: m.mspt,
            onlinePlayerCount: m.onlinePlayerCount,
            maxPlayers: m.maxPlayers,
            freeMemory: m.freeMemory.toString(),
            totalMemory: m.totalMemory.toString(),
            maxMemory: m.maxMemory.toString(),
            loadedChunks: m.loadedChunks,
            entityCount: m.entityCount,
            cpuUsage: m.cpuUsage,
            uploadBytes: m.uploadBytes.toString(),
            downloadBytes: m.downloadBytes.toString(),
            diskUsage: m.diskUsage.toString(),
            status: m.status,
            startTime: m.startTime.toString(),
            nextRestart: m.nextRestart
        }));
    },
    ["server-metrics-history"],
    { revalidate: 60, tags: ["metrics"] }
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '1h';

        let take = 60; // Default 1h (assuming 1 min interval)
        if (range === '24h') {
            take = 60 * 24; // 1440 points
        } else if (range === '1m') {
            take = 60; // 1m view actually starts with last 60 points of history anyway
        }

        // Fetch metrics (cached for 1 minute)
        // Data comes out already serialized from the cache
        const metrics = await getCachedMetrics(take);

        // Reverse to chronological order (oldest to newest) for charting
        const chronologicalMetrics = [...metrics].reverse();

        // Add display-specific formatting
        const formattedMetrics = chronologicalMetrics.map(m => ({
            ...m,
            // Format time for easy chart labels
            formattedTime: new Date(m.timestamp).toLocaleTimeString([], {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
        }));

        return NextResponse.json(formattedMetrics, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
