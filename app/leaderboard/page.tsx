import { LeaderboardView } from "@/components/leaderboard-view"

export default async function LeaderboardPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LeaderboardView />
        </div>
    )
}
