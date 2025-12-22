"use client";

import { useState, useEffect } from "react";

interface UptimeCounterProps {
    startTime: string | number; // Support both string and number
    status: string;
}

export function UptimeCounter({ startTime, status }: UptimeCounterProps) {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (status === 'OFFLINE' || status === 'shutdown') return;

        // Update every 60 seconds is enough for "hours m minutes"
        const timer = setInterval(() => forceUpdate(n => n + 1), 60000);
        return () => clearInterval(timer);
    }, [status]);

    if (status === 'OFFLINE' || status === 'shutdown') {
        return <span>Offline</span>;
    }

    const start = Number(startTime);
    if (isNaN(start) || start <= 0) return <span>Sleeping...</span>;

    const now = Date.now();
    const diff = Math.max(0, now - start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return <span>{hours}h {minutes}m</span>;
}
