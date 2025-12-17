"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";

interface DashboardRefresherProps {
    userId: string;
}

export function DashboardRefresher({ userId }: DashboardRefresherProps) {
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        // Use environment variable for key if available, otherwise fallback (ensure this matches lib/pusher.ts)
        // Client-side needs the key. Usually passed via NEXT_PUBLIC_...
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "YOUR_PUSHER_KEY";
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

        const pusher = new Pusher(pusherKey, {
            cluster: cluster,
        });

        const channel = pusher.subscribe(`user-${userId}`);

        channel.bind("dashboard-refresh", () => {
            console.log("[Dashboard] Received refresh signal");
            router.refresh();
        });

        return () => {
            pusher.unsubscribe(`user-${userId}`);
        };
    }, [userId, router]);

    return null;
}
