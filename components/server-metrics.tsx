"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, HeartCrack } from "lucide-react";
import Pusher from "pusher-js";
import { PillowCard } from "@/components/ui/pillow-card"
import { JellyTabs } from "@/components/ui/jelly-tabs";
import { UptimeCounter } from "@/components/uptime-counter";


interface Metric {
    id: string;
    timestamp: string;
    status: string;
    startTime: string;
    nextRestart?: string;
    tps: number;
    cpuUsage: number;
    maxMemory: string;
    totalMemory: string;
    freeMemory: string;
    uploadBytes: string;
    downloadBytes: string;
    formattedTime: string;
    onlinePlayerCount: number;
}

interface ChartPoint {
    time: string;
    timestamp: number;
    tps: number | null;
    cpu: number | null;
    tx: number | null;
    rx: number | null;
    players: number | null;
    isReal: boolean;
}

// Simple Tick Component
const CustomAxisTick = (props: any) => {
    const { x, y, payload, showSeconds } = props;
    return (
        <text x={x} y={y} dy={16} textAnchor="middle" fill="#71717a" fontSize={10}>
            {new Date(payload.value).toLocaleTimeString([], {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: showSeconds ? '2-digit' : undefined
            })}
        </text>
    );
};

export function ServerMetrics() {
    const [data, setData] = useState<Metric[]>([]);
    const [latest, setLatest] = useState<Metric | null>(null);
    const [timeRange, setTimeRange] = useState<'1m' | '1h' | '24h'>('1m');
    const timeRangeRef = useRef(timeRange);

    useEffect(() => {
        timeRangeRef.current = timeRange;
    }, [timeRange]);

    // CACHE
    const cache = useRef<{ [key: string]: { data: Metric[], timestamp: number } }>({});

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (cache.current[timeRange]) {
                const cached = cache.current[timeRange];
                if (cached.data.length > 0) {
                    setData(cached.data);
                    if (timeRange === '1m') setLatest(cached.data[cached.data.length - 1]);
                }
            }

            try {
                const res = await fetch(`/api/metrics?range=${timeRange}`);
                const json = await res.json();
                if (Array.isArray(json)) {
                    cache.current[timeRange] = { data: json, timestamp: Date.now() };
                    setData(json);

                    // Only update 'latest' from fetch if we are initializing or if the fetch provided newer data than we have
                    // But actually, Pusher is the source of truth for 'Latest'. 
                    // If we fetch 1h history, the last item is 60s old. We DON'T want to setLatest(old).
                    // So only setLatest if we strictly don't have one yet.
                    if (json.length > 0 && !latest) {
                        setLatest(json[json.length - 1]);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch metrics", e);
            }
        };

        fetchData();
    }, [timeRange]); // Removed 'latest' from dependency to avoid loop, it's fine.

    // Pusher Subscription (Always active for liveness)
    useEffect(() => {
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) return;

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
        });

        const channel = pusher.subscribe("metrics");

        channel.bind("server-metrics", (payload: any) => {
            const newMetric: Metric = {
                id: payload.id || `rt-${Date.now()}`,
                timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
                status: payload.status,
                startTime: payload.metrics.startTime,
                nextRestart: payload.nextRestart,
                tps: payload.metrics.tps,
                cpuUsage: payload.metrics.cpuUsage,
                maxMemory: payload.metrics.maxMemory,
                totalMemory: payload.metrics.totalMemory,
                freeMemory: payload.metrics.freeMemory,
                uploadBytes: payload.metrics.uploadBytes,
                downloadBytes: payload.metrics.downloadBytes,
                formattedTime: new Date(payload.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                onlinePlayerCount: payload.metrics.onlinePlayerCount || 0,
            };

            // Always update global latest state for Status Cards
            setLatest(newMetric);

            // Only update Chart Data if we are in '1m' view
            if (timeRangeRef.current === '1m') {
                setData((prev) => {
                    const updated = [...prev, newMetric];
                    if (updated.length > 120) return updated.slice(updated.length - 120);
                    cache.current['1m'] = { data: updated, timestamp: Date.now() };
                    return updated;
                });
            }
        });

        return () => {
            pusher.unsubscribe("metrics");
            pusher.disconnect();
        };
    }, []); // Empty dependency array = Single subscription that persists!

    // Throttle graph updates
    // Graph 'now' - simply use latest data point or current time, but don't state-update it every second
    const graphNow = useMemo(() => {
        if (data.length > 0) return new Date(data[data.length - 1].timestamp).getTime();
        return Date.now();
    }, [data]);

    const finalChartData = useMemo(() => {
        let duration = 60 * 1000;
        let step = 1000;
        if (timeRange === '1h') {
            duration = 60 * 60 * 1000;
            step = 60 * 1000;
        } else if (timeRange === '24h') {
            duration = 24 * 60 * 60 * 1000;
            step = 5 * 60 * 1000;
        }

        const endTime = graphNow;
        const startTime = endTime - duration;

        const filledData: ChartPoint[] = [];
        const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        let dataIndex = 0;
        const tolerance = step / 1.5;

        // HOLD LOGIC
        let lastKnownMetric: Metric | null = null;

        // Optimization: Find the first relevant data point index
        // to avoid iterating everything
        // But we need lastKnownMetric even before startTime if possible to fill initial gap
        // So just iterate is fine unless huge.

        for (let t = startTime; t <= endTime; t += step) {
            let found: Metric | null = null;

            // Look for exact match in this bucket
            while (dataIndex < sortedData.length) {
                const item = sortedData[dataIndex];
                const itemTime = new Date(item.timestamp).getTime();

                if (itemTime < t - tolerance) {
                    // Update last known as we pass it
                    lastKnownMetric = item;
                    dataIndex++;
                    continue;
                } else if (itemTime > t + tolerance) {
                    break;
                } else {
                    found = item;
                    // found is also the new last known
                    lastKnownMetric = item;
                    break;
                }
            }

            if (found) {
                // REAL DATA
                // Calculate rates
                const foundIdx = data.lastIndexOf(found);
                const prevRaw = foundIdx > 0 ? data[foundIdx - 1] : null;

                let txRate = 0;
                let rxRate = 0;
                if (prevRaw) {
                    const timeDiff = (new Date(found.timestamp).getTime() - new Date(prevRaw.timestamp).getTime()) / 1000;
                    if (timeDiff > 0) {
                        txRate = Number(BigInt(found.uploadBytes) - BigInt(prevRaw.uploadBytes)) / timeDiff;
                        rxRate = Number(BigInt(found.downloadBytes) - BigInt(prevRaw.downloadBytes)) / timeDiff;
                    }
                }

                filledData.push({
                    time: found.formattedTime,
                    timestamp: t,
                    tps: found.tps,
                    cpu: found.cpuUsage,
                    tx: Math.max(0, Math.round(txRate / 1024)),
                    rx: Math.max(0, Math.round(rxRate / 1024)),
                    players: found.onlinePlayerCount,
                    isReal: true
                });
            } else {
                // NO DATA -> GUESSTIMATE
                // Check if we can "Forward Fill"
                const STALENESS_THRESHOLD = 90 * 1000; // 90 seconds allowed gap (covers 60s throttle)

                if (lastKnownMetric && (t - new Date(lastKnownMetric.timestamp).getTime() < STALENESS_THRESHOLD)) {
                    // FORWARD FILL
                    filledData.push({
                        time: new Date(t).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        timestamp: t,
                        tps: lastKnownMetric.tps,
                        cpu: lastKnownMetric.cpuUsage,
                        tx: 0,
                        rx: 0,
                        players: lastKnownMetric.onlinePlayerCount,
                        isReal: false
                    });
                } else {
                    // EXPIRED -> ZERO
                    filledData.push({
                        time: new Date(t).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        timestamp: t,
                        tps: 0, // Drop to 0
                        cpu: 0,
                        tx: 0,
                        rx: 0,
                        players: 0,
                        isReal: false
                    });
                }
            }
        }
        return filledData;
    }, [data, timeRange, graphNow]);

    // if (!latest && finalChartData.length === 0) return null;

    const rawLatest = latest || (data.length > 0 ? data[data.length - 1] : null);

    // Liveness Check
    let isLive = false;
    if (rawLatest) {
        const lastTime = new Date(rawLatest.timestamp).getTime();
        const diff = Date.now() - lastTime;
        // 1m view: expects 1s updates (allow 5s slack)
        // History views: expects 60s updates (allow 90s slack)
        const threshold = timeRange === '1m' ? 5000 : 90000;
        isLive = diff < threshold;
    }

    const displayLatest = isLive && rawLatest ? rawLatest : {
        status: 'OFFLINE',
        tps: 0,
        cpuUsage: 0,
        totalMemory: rawLatest?.totalMemory || '0',
        freeMemory: rawLatest?.freeMemory || '0',   // Show full 'used' or 'free'? usually 0 usage if offline.
        maxMemory: rawLatest?.maxMemory || '0',
        startTime: rawLatest?.startTime || '0',
        formattedTime: rawLatest?.formattedTime || '',
    } as any;

    // Override memory calculation for offline state
    const totalMem = Number(displayLatest.totalMemory);
    // If offline, used should be 0.
    const usedMem = isLive ? (totalMem - Number(displayLatest.freeMemory)) : 0;
    const maxMem = Number(displayLatest.maxMemory);

    const usedGB = (usedMem / 1024 / 1024 / 1024).toFixed(1);
    const maxGB = (maxMem / 1024 / 1024 / 1024).toFixed(1);
    const memPercentage = maxMem > 0 ? Math.round((usedMem / maxMem) * 100) : 0;

    // Calculate Peaks based on current `data` (which matches timeRange)
    const peaks = useMemo(() => {
        if (data.length === 0) return { cpu: 0, ram: 0, tps: 0, tx: 0, rx: 0, players: 0 };
        return data.reduce((acc, curr) => {
            const used = Number(curr.totalMemory) - Number(curr.freeMemory);
            return {
                cpu: Math.max(acc.cpu, curr.cpuUsage),
                ram: Math.max(acc.ram, used),
                tps: Math.max(acc.tps, curr.tps),
                // Note: For Rates (Tx/Rx), we don't have them pre-calculated in 'Metric' usually
                // But for simplicity/accuracy, let's use the same logic as the graph or just max(uploadBytes) which is cumulative?
                // Cumulative doesn't make sense for "Peak Speed".
                // We'd need to calculate rates.
                // Let's use the calculated chartData for Network Peaks!
                tx: acc.tx,
                rx: acc.rx,
                players: Math.max(acc.players, curr.onlinePlayerCount)
            };
        }, { cpu: 0, ram: 0, tps: 0, tx: 0, rx: 0, players: 0 });
    }, [data]);

    // Calculate Network Peaks from Final Chart Data (which has rates)
    const netPeaks = useMemo(() => {
        return finalChartData.reduce((acc, curr) => ({
            tx: Math.max(acc.tx, curr.tx || 0),
            rx: Math.max(acc.rx, curr.rx || 0)
        }), { tx: 0, rx: 0 });
    }, [finalChartData]);

    let duration = 60 * 1000;
    if (timeRange === '1h') duration = 60 * 60 * 1000;
    else if (timeRange === '24h') duration = 24 * 60 * 60 * 1000;

    const xDomainMin = finalChartData.length > 0 ? finalChartData[0].timestamp : (graphNow - duration);
    const xDomainMax = finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].timestamp : graphNow;

    let tickInterval = 10000;
    if (timeRange === '1m') tickInterval = 10000;
    else if (timeRange === '1h') tickInterval = 10 * 60 * 1000;
    else if (timeRange === '24h') tickInterval = 4 * 60 * 60 * 1000;

    const ticks: number[] = [];
    let t = Math.ceil(xDomainMin / tickInterval) * tickInterval;
    while (t <= xDomainMax) {
        ticks.push(t);
        t += tickInterval;
    }

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Blob for aesthetics */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-heading font-black text-primary mb-6 tracking-tight drop-shadow-sm">
                        Server Vitals
                    </h2>

                    <JellyTabs
                        tabs={[
                            { id: '1m', label: '1m' },
                            { id: '1h', label: '1h' },
                            { id: '24h', label: '24h' }
                        ]}
                        activeTab={timeRange}
                        onTabChange={(id) => setTimeRange(id as '1m' | '1h' | '24h')}
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[95%] mx-auto auto-rows-[minmax(200px,auto)]">

                    {/* 1. Status Card (1x1) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                        className="md:col-span-2 lg:col-span-1 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName={displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown'
                                ? 'bg-emerald-500/20 dark:bg-emerald-500/60 dark:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                                : 'bg-red-500/20 dark:bg-red-500/60 dark:shadow-[0_0_25px_rgba(239,68,68,0.4)]'}
                            contentClassName="flex flex-col justify-center items-center text-center h-full p-8"
                            className="w-full h-full"
                        >
                            <div className="relative mb-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-inner
                                        ${displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-500'}
                                    `}>
                                    {displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown' ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                        >
                                            <Heart className="w-8 h-8 fill-current" />
                                        </motion.div>
                                    ) : (
                                        <HeartCrack className="w-8 h-8" />
                                    )}
                                </div>
                                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border
                                        ${displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown'
                                        ? 'bg-emerald-500 border-emerald-400 text-white'
                                        : 'bg-red-500 border-red-400 text-white'}
                                    `}>
                                    {displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown' ? 'Online' : 'Offline'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Uptime</p>
                                <p className="text-xl font-black text-foreground font-heading">
                                    {displayLatest ? (
                                        <UptimeCounter
                                            startTime={displayLatest.startTime}
                                            status={displayLatest.status}
                                        />
                                    ) : '...'}
                                </p>
                            </div>
                        </PillowCard>
                    </motion.div>

                    {/* 2. Players Graph (2x2 - The Hero Tile) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        className="md:col-span-2 lg:col-span-2 lg:row-span-2 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName="bg-indigo-500/20 dark:bg-indigo-500/60 dark:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                            contentClassName="flex flex-col h-full"
                            className="w-full h-full"
                        >
                            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-2xl flex items-center gap-2">
                                        Community Activity
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Live player trends</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black text-indigo-500">
                                        {displayLatest.onlinePlayerCount || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-tighter">
                                        Peak: {peaks.players || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-grow w-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={finalChartData}>
                                        <defs>
                                            <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '16px', padding: '12px' }}
                                            labelStyle={{ color: '#71717a', fontWeight: 'bold', marginBottom: '4px' }}
                                            formatter={(value: number) => [value, "Players"]}
                                            labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        />
                                        <XAxis
                                            dataKey="timestamp"
                                            type="number"
                                            domain={[xDomainMin, xDomainMax]}
                                            ticks={ticks}
                                            tick={<CustomAxisTick showSeconds={timeRange === '1m'} />}
                                            axisLine={false}
                                            tickLine={false}
                                            height={30}
                                            interval={0}
                                        />
                                        <Area type="monotone" name="Players" dataKey="players" stroke="#6366f1" strokeWidth={5} fill="url(#colorPlayers)" animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </PillowCard>
                    </motion.div>

                    {/* 3. CPU Load (1x1) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                        className="lg:col-span-1 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName="bg-purple-500/20 dark:bg-purple-500/60 dark:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                            contentClassName="flex flex-col justify-between h-full p-8"
                            className="w-full h-full"
                        >
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="font-bold text-lg leading-none">CPU</h3>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-purple-500">{displayLatest.cpuUsage.toFixed(0)}%</span>
                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">Peak: {peaks.cpu.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="flex-grow flex items-center justify-center">
                                <div className="h-6 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5 p-1">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full shadow-sm"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(displayLatest.cpuUsage, 100)}%` }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                    />
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">System Load</p>
                            </div>
                        </PillowCard>
                    </motion.div>

                    {/* 4. TPS (1x1) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="lg:col-span-1 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName="bg-amber-500/20 dark:bg-amber-500/60 dark:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                            contentClassName="flex flex-col justify-between h-full p-8"
                            className="w-full h-full"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        TPS
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-black ${displayLatest.tps > 19 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {displayLatest.tps.toFixed(1)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                                        Target: 20.0
                                    </p>
                                </div>
                            </div>
                            <div className="h-[100px] w-full mt-auto opacity-70">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={finalChartData}>
                                        <defs>
                                            <linearGradient id="colorTpsCute" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" name="TPS" dataKey="tps" stroke="#fbbf24" strokeWidth={3} fill="url(#colorTpsCute)" animationDuration={1000} isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </PillowCard>
                    </motion.div>

                    {/* 5. RAM (1x1) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                        className="md:col-span-2 lg:col-span-1 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName="bg-pink-500/20 dark:bg-pink-500/60 dark:shadow-[0_0_25px_rgba(236,72,153,0.4)]"
                            contentClassName="flex flex-col justify-between h-full p-8"
                            className="w-full h-full"
                        >
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="font-bold text-lg leading-none">RAM</h3>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-pink-500">{memPercentage}%</span>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-bold">{usedGB}/{maxGB} GB</p>
                                </div>
                            </div>
                            <div className="flex-grow flex items-center justify-center">
                                <div className="h-6 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5 p-1">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-sm"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${memPercentage}%` }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                    />
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Memory Usage</p>
                            </div>
                        </PillowCard>
                    </motion.div>

                    {/* 6. Network (4x1 - Wide Base) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.25 }}
                        className="md:col-span-2 lg:col-span-4 h-full"
                    >
                        <PillowCard
                            noHover
                            shadowClassName="bg-sky-500/20 dark:bg-sky-500/60 dark:shadow-[0_0_25px_rgba(14,165,233,0.4)]"
                            contentClassName="flex flex-col h-full p-8"
                            className="w-full h-full"
                        >
                            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-2xl flex items-center gap-2">
                                        Global Traffic
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Network throughput in KB/s</p>
                                </div>
                                <div className="flex gap-8 text-right">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-1">Download</p>
                                        <p className="text-3xl font-black text-pink-500">
                                            {finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].rx : 0} <span className="text-sm font-normal text-muted-foreground">KB/s</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-1">Upload</p>
                                        <p className="text-3xl font-black text-sky-500">
                                            {finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].tx : 0} <span className="text-sm font-normal text-muted-foreground">KB/s</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[180px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={finalChartData}>
                                        <defs>
                                            <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '16px', padding: '12px' }}
                                            labelStyle={{ color: '#71717a', fontWeight: 'bold', marginBottom: '4px' }}
                                            formatter={(value: number, name: string) => [`${value} KB/s`, name]}
                                            labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        />
                                        <XAxis
                                            dataKey="timestamp"
                                            type="number"
                                            domain={[xDomainMin, xDomainMax]}
                                            ticks={ticks}
                                            tick={<CustomAxisTick showSeconds={timeRange === '1m'} />}
                                            axisLine={false}
                                            tickLine={false}
                                            height={30}
                                            interval={0}
                                        />
                                        <Area type="monotone" name="Download" dataKey="rx" stroke="#f472b6" strokeWidth={4} fill="url(#colorRx)" animationDuration={1000} />
                                        <Area type="monotone" name="Upload" dataKey="tx" stroke="#38bdf8" strokeWidth={4} fill="url(#colorTx)" animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </PillowCard>
                    </motion.div>

                </div>
            </div>
        </section >
    );
}

