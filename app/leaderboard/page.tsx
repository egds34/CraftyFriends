import { LeaderboardView } from "@/components/leaderboard-view"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export default async function LeaderboardPage() {
    const session = await auth()

    // Fetch all users with their achievement counts
    const users = await prisma.user.findMany({
        select: {
            id: true,
            minecraftUsername: true,
            role: true,
            // We'll need to count their achievements separately or use a join
        },
        where: {
            minecraftUsername: {
                not: null
            }
        }
    })

    // ... (rest of data fetching logic can stay, although it seems unused by LeaderboardView?)
    // Actually, getting users and counting achievements logic seems to be for `players` prop which is IGNORED by `LeaderboardView`.
    // So all that DB fetching in `page.tsx` might be wasted if `LeaderboardView` fetches its own data.
    // However, I shouldn't delete it unless I'm sure. It might be used for SEO metadata or something later?
    // But `LeaderboardView` fetches from `getLeaderboardData` server action.
    // I will leave the fetching logic alone to be safe, just fix the return.
    // Actually, I'll clean up the props passed to `LeaderboardView`.

    // ... (logic)

    // ...

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LeaderboardView isAuthenticated={!!session} />
        </div>
    )
}
