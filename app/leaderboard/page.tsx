import { LeaderboardView } from "@/components/leaderboard-view"
import { prisma } from "@/lib/prisma"

export default async function LeaderboardPage() {
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

    // Fetch achievement counts for all users who have a minecraftUsername
    const achievementCounts = await prisma.userAdvancement.groupBy({
        by: ['username'],
        _count: {
            advancementId: true
        },
        where: {
            done: true
        }
    })

    // Convert to map for easy lookup
    const countMap = new Map<string, number>(
        achievementCounts.map((ac: any) => [ac.username, Number(ac._count?.advancementId || 0)])
    )

    // Total achievements available
    const totalAchievementsCount = await prisma.advancement.count()

    const leaderboardData = users
        .map(user => {
            const achievements = Number(countMap.get(user.minecraftUsername!) || 0);
            return {
                username: user.minecraftUsername!,
                achievements,
                totalAchievements: totalAchievementsCount,
                role: user.role === 'ADMIN' ? 'Elite' : user.role === 'PREMIUM' ? 'Premium' : 'Basic',
            };
        })
        .sort((a, b) => b.achievements - a.achievements)
        .map((player, index) => ({
            ...player,
            rank: index + 1
        }))

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LeaderboardView players={leaderboardData} />
        </div>
    )
}
