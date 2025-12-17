import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body || !body.metrics) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { serverName, timestamp, metrics, status } = body;
        const isShutdown = status === 'shutdown' || status === 'OFFLINE';

        // Prepare variables
        const valStartTime = BigInt(isShutdown ? 0 : (body.startTime || metrics?.startTime || 0));
        let valNextRestart = isShutdown ? null : (body.nextRestart || metrics?.nextRestart || null);

        // Ensure nextRestart is a string if it's not null
        if (valNextRestart !== null && valNextRestart !== undefined) {
            valNextRestart = String(valNextRestart);
        }

        // 1. BROADCAST TO PUSHER (Real-time, every request)
        // We serialize BigInts specifically for Pusher payload
        const pusherPayload = {
            ...body,
            metrics: {
                ...metrics,
                // Ensure usage of strings for BigInts in JSON
                freeMemory: metrics.freeMemory?.toString() || "0",
                totalMemory: metrics.totalMemory?.toString() || "0",
                maxMemory: metrics.maxMemory?.toString() || "0",
                uploadBytes: metrics.uploadBytes?.toString() || "0",
                downloadBytes: metrics.downloadBytes?.toString() || "0",
                diskUsage: metrics.diskUsage?.toString() || "0",
                startTime: valStartTime.toString(),
            },
            status: status || "ONLINE",
            timestamp: timestamp || Date.now(),
        };

        await pusherServer.trigger("metrics", "server-metrics", pusherPayload);

        // 2. DATABASE THROTTLING (Sample every 60 seconds)
        // Check the last recorded metric timestamp
        const lastMetric = await prisma.serverMetric.findFirst({
            orderBy: { timestamp: 'desc' },
            select: { timestamp: true }
        });

        const now = Date.now();
        const lastTime = lastMetric?.timestamp.getTime() || 0;
        const diff = now - lastTime;

        // If it has been more than 60 seconds (60000ms), OR if it is a Shutdown event (always record shutdown)
        if (diff > 60000 || isShutdown) {
            await prisma.serverMetric.create({
                data: {
                    serverName: serverName || "Unknown",
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                    status: status || "ONLINE",

                    // Zero out metrics if shutdown, otherwise use payload values
                    tps: isShutdown ? 0 : (metrics.tps || 0),
                    mspt: isShutdown ? 0 : (metrics.mspt || 0),
                    onlinePlayerCount: isShutdown ? 0 : (metrics.onlinePlayerCount || 0),
                    maxPlayers: isShutdown ? 0 : (metrics.maxPlayers || 0),
                    freeMemory: BigInt(isShutdown ? 0 : (metrics.freeMemory || 0)),
                    totalMemory: BigInt(isShutdown ? 0 : (metrics.totalMemory || 0)),
                    maxMemory: BigInt(isShutdown ? 0 : (metrics.maxMemory || 0)),
                    loadedChunks: isShutdown ? 0 : (metrics.loadedChunks || 0),
                    entityCount: isShutdown ? 0 : (metrics.entityCount || 0),
                    cpuUsage: isShutdown ? 0 : (metrics.cpuUsage || 0),

                    uploadBytes: BigInt(isShutdown ? 0 : (metrics.uploadBytes || 0)),
                    downloadBytes: BigInt(isShutdown ? 0 : (metrics.downloadBytes || 0)),
                    diskUsage: BigInt(isShutdown ? 0 : (metrics.diskUsage || 0)),

                    startTime: valStartTime,
                    nextRestart: valNextRestart,
                },
            });

            // Cleanup old data (Retention: 24h)
            // We run this only when we write, to save resources
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            prisma.serverMetric.deleteMany({
                where: {
                    timestamp: {
                        lt: oneDayAgo
                    }
                }
            }).catch(e => console.error("Failed to cleanup old metrics:", e));
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error saving Minecraft metrics:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
