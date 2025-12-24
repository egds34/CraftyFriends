import { LeaderboardView } from "@/components/leaderboard-view"
import { auth } from "@/auth"
import { getLeaderboardData } from "./actions"

export default async function LeaderboardPage() {
    const session = await auth()
    const initialData = await getLeaderboardData()

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LeaderboardView
                isAuthenticated={!!session}
                initialData={initialData}
            />
        </div>
    )
}
