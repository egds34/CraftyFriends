import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // Fetch metrics
        const metrics = await prisma.serverMetric.findMany({
            take: take,
            orderBy: {
                timestamp: 'desc',
            },
        });

        // Reverse to chronological order (oldest to newest) for charting
        const chronologicalMetrics = metrics.reverse();

        // Serialize BigInts to strings/numbers for JSON
        const serializedMetrics = chronologicalMetrics.map(m => ({
            ...m,
            status: m.status, // Pass status through
            freeMemory: m.freeMemory.toString(),
            totalMemory: m.totalMemory.toString(),
            maxMemory: m.maxMemory.toString(),
            uploadBytes: m.uploadBytes.toString(),
            downloadBytes: m.downloadBytes.toString(),
            diskUsage: m.diskUsage.toString(),
            startTime: m.startTime.toString(),
            nextRestart: m.nextRestart,
            // Format time for easy chart labels
            formattedTime: new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }));

        return NextResponse.json(serializedMetrics, { status: 200 });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
