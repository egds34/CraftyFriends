import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { ADVANCEMENTS_DATA } from "@/lib/advancements-data";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation: Must have EITHER metrics, advancements OR stats
        if (!body || (!body.metrics && !body.advancements && !body.stats)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { serverName, timestamp, metrics, status, advancements, stats } = body;
        const now = new Date();

        // 0. LOG INCOMING REQUEST
        console.log(`\n[${now.toISOString()}] Webhook Received from "${serverName || 'Unknown'}":`);
        console.log(`   - Status: ${status || 'N/A'}`);
        console.log(`   - Contents: ${[
            metrics ? 'Server Metrics' : null,
            advancements ? 'Player Advancements' : null,
            stats ? 'Player Statistics' : null
        ].filter(Boolean).join(', ')}`);
        const isShutdown = status === 'shutdown' || status === 'OFFLINE';

        // 1. PROCESS METRICS & PUSHER (Only if metrics are present)
        if (metrics) {
            // Prepare variables
            const valStartTime = BigInt(isShutdown ? 0 : (body.startTime || metrics?.startTime || 0));
            let valNextRestart = isShutdown ? null : (body.nextRestart || metrics?.nextRestart || null);

            // Ensure nextRestart is a string if it's not null
            if (valNextRestart !== null && valNextRestart !== undefined) {
                valNextRestart = String(valNextRestart);
            }

            // BROADCAST TO PUSHER (Real-time)
            const pusherPayload = {
                ...body,
                metrics: {
                    ...metrics,
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

            // DATABASE THROTTLING (Sample every 60 seconds)
            const now = new Date();
            const minuteTimestamp = Math.floor(now.getTime() / 60000);
            const isTopOfMinute = now.getSeconds() === 0;

            if (isTopOfMinute || isShutdown) {
                const minuteId = `metric-${minuteTimestamp}`;
                try {
                    await prisma.serverMetric.upsert({
                        where: { id: minuteId },
                        update: {
                            status: status || "ONLINE",
                            tps: isShutdown ? 0 : (metrics.tps || 0),
                            onlinePlayerCount: isShutdown ? 0 : (metrics.onlinePlayerCount || 0),
                            cpuUsage: isShutdown ? 0 : (metrics.cpuUsage || 0),
                            freeMemory: BigInt(isShutdown ? 0 : (metrics.freeMemory || 0)),
                            uploadBytes: BigInt(isShutdown ? 0 : (metrics.uploadBytes || 0)),
                            downloadBytes: BigInt(isShutdown ? 0 : (metrics.downloadBytes || 0)),
                        },
                        create: {
                            id: minuteId,
                            serverName: serverName || "Unknown",
                            timestamp: timestamp ? new Date(timestamp) : new Date(),
                            status: status || "ONLINE",
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
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    prisma.serverMetric.deleteMany({
                        where: { timestamp: { lt: oneDayAgo } }
                    }).catch(e => console.error("Cleanup error:", e));

                } catch (dbError) {
                    console.warn("DB write throttled or skipped due to concurrency.");
                }
            }
        }

        // 2. PROCESS ADVANCEMENTS (Aggregated sync)
        if (advancements) {
            for (const [username, userAdvData] of Object.entries(advancements)) {
                const details = (userAdvData as any).details;
                if (!details) continue;

                // Optimization: Get what this user already has as 'done'
                // This prevents redundant nested loops and upserts for every heartbeat
                const existingDone = await prisma.userAdvancement.findMany({
                    where: { username, done: true },
                    select: { advancementId: true }
                });
                const existingSet = new Set(existingDone.map(e => e.advancementId));

                const novelUnlocks = Object.entries(details).filter(([advId, state]) =>
                    (state as any).done === true && !existingSet.has(advId)
                );

                if (novelUnlocks.length === 0) continue;

                console.log(`Processing ${novelUnlocks.length} new advancements for ${username}`);

                for (const [advId] of novelUnlocks) {
                    const info = ADVANCEMENTS_DATA[advId];

                    // Ensure the Advancement base record exists
                    await prisma.advancement.upsert({
                        where: { id: advId },
                        update: {},
                        create: {
                            id: advId,
                            name: info?.name || advId.split('/').pop() || advId,
                            description: info?.description || null,
                            category: info?.category || "other",
                            icon: info?.icon || "knowledge_book"
                        }
                    });

                    // Record the unlock for the user
                    await prisma.userAdvancement.upsert({
                        where: {
                            username_advancementId: {
                                username,
                                advancementId: advId
                            }
                        },
                        update: {
                            done: true,
                            updatedAt: new Date()
                        },
                        create: {
                            username,
                            advancementId: advId,
                            done: true
                        }
                    });
                }
            }
        }


        // 3. PROCESS STATISTICS (Relational & Dynamic)
        if (stats) {
            const usernames = Object.keys(stats);

            // Optimization 1: Fetch all existing statistic definitions once
            const existingStats = await prisma.statistic.findMany({ select: { id: true } });
            const existingStatIds = new Set(existingStats.map(s => s.id));

            // Optimization 2: Fetch all current values for all users in this payload
            const currentValues = await prisma.playerStatistic.findMany({
                where: { username: { in: usernames } },
                select: { username: true, statId: true, value: true }
            });

            // Map results for quick lookup: username -> statId -> value
            const valueMap: Record<string, Record<string, bigint>> = {};
            currentValues.forEach(cv => {
                if (!valueMap[cv.username]) valueMap[cv.username] = {};
                valueMap[cv.username][cv.statId] = cv.value;
            });

            for (const [username, userStats] of Object.entries(stats)) {
                for (const [category, categoryData] of Object.entries(userStats as any)) {
                    const processStatEntry = async (statName: string, rawValue: any) => {
                        const statId = statName === "total" ? `${category}:total` : `${category}:${statName}`;
                        const newValue = BigInt(Math.floor(Number(rawValue)));

                        // Check if value actually changed
                        const existingValue = valueMap[username]?.[statId];
                        if (existingValue !== undefined && existingValue === newValue) {
                            return; // No change, skip
                        }

                        // Ensure definition exists (if not already cached)
                        if (!existingStatIds.has(statId)) {
                            await prisma.statistic.upsert({
                                where: { id: statId },
                                update: {},
                                create: {
                                    id: statId,
                                    category,
                                    name: statName,
                                    displayName: statName === "total"
                                        ? category.split(':').pop()?.replace(/_/g, ' ') || category
                                        : statName.split(':').pop()?.replace(/_/g, ' ') || statName
                                }
                            });
                            existingStatIds.add(statId);
                        }

                        // Upsert the new value
                        await prisma.playerStatistic.upsert({
                            where: { username_statId: { username, statId } },
                            update: { value: newValue, updatedAt: new Date() },
                            create: { username, statId, value: newValue }
                        });
                    };

                    if (typeof categoryData === 'object' && categoryData !== null) {
                        for (const [statName, value] of Object.entries(categoryData)) {
                            await processStatEntry(statName, value);
                        }
                    } else if (typeof categoryData === 'number') {
                        await processStatEntry("total", categoryData);
                    }
                }
            }
        }

        console.log(`[${new Date().toISOString()}] Successfully processed message. Status: 200`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log(`[${new Date().toISOString()}] Error processing message. Status: 500`);
        console.error("Error Detail:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
