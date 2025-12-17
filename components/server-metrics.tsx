"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Pusher from "pusher-js";

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
}

interface ChartPoint {
    time: string;
    timestamp: number;
    tps: number | null;
    cpu: number | null;
    tx: number | null;
    rx: number | null;
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
    const [now, setNow] = useState<number>(Date.now());
    const [timeRange, setTimeRange] = useState<'1m' | '1h' | '24h'>('1m');
    const timeRangeRef = useRef(timeRange);

    useEffect(() => {
        timeRangeRef.current = timeRange;
    }, [timeRange]);

    // CACHE
    const cache = useRef<{ [key: string]: { data: Metric[], timestamp: number } }>({});

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

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
    const graphNow = timeRange === '1m' ? now : (Math.floor(now / 60000) * 60000);

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
                        isReal: false
                    });
                }
            }
        }
        return filledData;
    }, [data, timeRange, graphNow]);

    if (!latest && finalChartData.length === 0) return null;

    const rawLatest = latest || (data.length > 0 ? data[data.length - 1] : null);

    // Liveness Check
    let isLive = false;
    if (rawLatest) {
        const lastTime = new Date(rawLatest.timestamp).getTime();
        const diff = now - lastTime;
        // 1m view: expects 1s updates (allow 5s slack)
        // History views: expects 60s updates (allow 90s slack)
        const threshold = timeRange === '1m' ? 5000 : 90000;
        isLive = diff < threshold;
    }

    const displayLatest = isLive && rawLatest ? rawLatest : {
        status: 'OFFLINE',
        tps: 0,
        cpuUsage: 0,
        totalMemory: rawLatest?.totalMemory || '0', // Keep config if available
        freeMemory: rawLatest?.totalMemory || '0',  // Show full 'used' or 'free'? usually 0 usage if offline.
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
        if (data.length === 0) return { cpu: 0, ram: 0, tps: 0, tx: 0, rx: 0 };
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
                rx: acc.rx
            };
        }, { cpu: 0, ram: 0, tps: 0, tx: 0, rx: 0 });
    }, [data]);

    // Calculate Network Peaks from Final Chart Data (which has rates)
    const netPeaks = useMemo(() => {
        return finalChartData.reduce((acc, curr) => ({
            tx: Math.max(acc.tx, curr.tx || 0),
            rx: Math.max(acc.rx, curr.rx || 0)
        }), { tx: 0, rx: 0 });
    }, [finalChartData]);

    const xDomainMin = finalChartData.length > 0 ? finalChartData[0].timestamp : graphNow;
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
        <section className="py-20 bg-muted/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 flex flex-col items-center justify-center gap-6 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
                        Server Statistics
                    </h2>

                    <div className="flex bg-card/50 p-1 rounded-xl border border-primary/10 backdrop-blur-md shadow-sm">
                        {(['1m', '1h', '24h'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`
                                    px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-300
                                    ${timeRange === range
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}
                                `}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* UI Cards same as before... */}
                    <motion.div
                        className="h-full"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0 }}
                    >
                        <Card className="bg-card/50 border-primary/10 hover:border-primary/20 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md flex flex-col justify-center items-center py-6 h-full rounded-2xl">
                            <CardHeader className="pb-2 p-0 text-center">
                                <CardTitle className="text-primary/80 text-sm font-semibold tracking-wide uppercase">Server Status</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-red-400'} `}></div>
                                    <span className={`text-4xl font-bold ${displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown' ? 'text-emerald-500' : 'text-red-500'} `}>
                                        {displayLatest.status !== 'OFFLINE' && displayLatest.status !== 'shutdown' ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-muted-foreground text-xs font-medium">
                                        Uptime: {(() => {
                                            const start = Number(displayLatest.startTime);
                                            if (start <= 0 || displayLatest.status === 'OFFLINE' || displayLatest.status === 'shutdown') return 'Unknown';
                                            const diff = Math.max(0, now - start);
                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                            return `${hours}h ${minutes}m`;
                                        })()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="h-full"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
                    >
                        <Card className="bg-card/50 border-primary/10 hover:border-primary/20 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md h-full rounded-2xl">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-primary/80 text-sm font-semibold tracking-wide uppercase">CPU Load</CardTitle>
                                <span className="text-xs text-muted-foreground font-mono">Peak: {peaks.cpu.toFixed(1)}%</span>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-purple-500">{displayLatest.cpuUsage.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-400 to-pink-300 transition-all duration-500 rounded-full"
                                        style={{ width: `${Math.min(displayLatest.cpuUsage, 100)}% ` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="h-full lg:col-span-2"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
                    >
                        <Card className="bg-card/50 border-primary/10 hover:border-primary/20 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md h-full rounded-2xl">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-primary/80 text-sm font-semibold tracking-wide uppercase">RAM Usage</CardTitle>
                                <span className="text-xs text-muted-foreground font-mono">Peak: {(peaks.ram / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-4xl font-bold text-pink-500">{usedGB}</span>
                                            <span className="text-muted-foreground text-sm font-medium">GB Used</span>
                                        </div>
                                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                                            <div
                                                className="h-full bg-gradient-to-r from-pink-400 to-rose-300 transition-all duration-500 rounded-full"
                                                style={{ width: `${memPercentage}% ` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end">
                                        <span className="text-2xl font-bold text-foreground/80">{maxGB} GB</span>
                                        <span className="text-xs text-muted-foreground uppercase font-medium">Total Allocated</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-4"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0 }}
                    >
                        <Card className="bg-card/50 border-primary/10 hover:border-primary/20 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md h-full rounded-2xl">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-primary/80 text-sm font-semibold tracking-wide uppercase">TPS (Performance)</CardTitle>
                                <span className="text-xs text-muted-foreground font-mono">Low: {peaks.tps.toFixed(1)} / Peak: 20.0</span>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className={`text-4xl font-bold ${displayLatest.tps > 19 ? 'text-emerald-500' : displayLatest.tps > 15 ? 'text-yellow-500' : 'text-red-500'} `}>
                                        {displayLatest.tps.toFixed(1)}
                                    </span>
                                    <span className="text-muted-foreground text-sm font-medium">/ 20.0</span>
                                </div>
                                <div className="h-[150px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={finalChartData}>
                                            <defs>
                                                <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="timestamp"
                                                type="number"
                                                domain={['dataMin', 'dataMax']}
                                                ticks={ticks}
                                                tick={<CustomAxisTick showSeconds={timeRange === '1m'} />}
                                                interval={0}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e4e4e7', color: '#18181b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            />
                                            <Area
                                                animationDuration={500}
                                                type="monotone"
                                                dataKey="tps"
                                                stroke="#a78bfa"
                                                fillOpacity={1}
                                                fill="url(#colorTps)"
                                                strokeWidth={3}
                                                connectNulls={true}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-4"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0 }}
                    >
                        <Card className="bg-card/50 border-primary/10 hover:border-primary/20 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md h-full rounded-2xl">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-primary/80 text-sm font-semibold tracking-wide uppercase">Network Traffic</CardTitle>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>Peak ↓: {netPeaks.rx} KB/s</span>
                                    <span>Peak ↑: {netPeaks.tx} KB/s</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-xs text-muted-foreground mb-2 px-2 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-pink-400 border border-pink-300"></div>
                                        Inbound: {finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].rx : 0} KB/s
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300"></div>
                                        Outbound: {finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].tx : 0} KB/s
                                    </div>
                                </div>
                                <div className="h-[150px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={finalChartData}>
                                            <defs>
                                                <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="timestamp"
                                                type="number"
                                                domain={['dataMin', 'dataMax']}
                                                ticks={ticks}
                                                tick={<CustomAxisTick showSeconds={timeRange === '1m'} />}
                                                interval={0}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e4e4e7', color: '#18181b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: '#18181b' }}
                                                labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            />
                                            <Area animationDuration={500} type="monotone" dataKey="rx" name="Download (KB/s)" stroke="#f472b6" fillOpacity={1} fill="url(#colorRx)" strokeWidth={3} connectNulls={true} />
                                            <Area animationDuration={500} type="monotone" dataKey="tx" name="Upload (KB/s)" stroke="#38bdf8" fillOpacity={1} fill="url(#colorTx)" strokeWidth={3} connectNulls={true} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
