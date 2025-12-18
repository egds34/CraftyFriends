import { prisma } from "@/lib/prisma"
import { AchievementsView } from "@/components/achievements-view"
import { auth } from "@/auth"

export default async function AchievementsPage() {
    // Fetch all advancements and counts
    const advancements = await prisma.advancement.findMany({
        include: {
            _count: {
                select: { userAdvancements: { where: { done: true } } }
            }
        },
        orderBy: {
            category: 'asc'
        }
    })

    // Total number of unique players who have any advancement
    const totalPlayersCount = await prisma.userAdvancement.groupBy({
        by: ['username'],
        _count: true
    }).then((res: any[]) => res.length)

    // Fetch current user's progress
    const session = await auth()
    const userUnlocks = new Map<string, Date>()

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { minecraftUsername: true }
        })

        if (user?.minecraftUsername) {
            const unlocks = await prisma.userAdvancement.findMany({
                where: {
                    username: user.minecraftUsername,
                    done: true
                },
                select: {
                    advancementId: true,
                    updatedAt: true
                }
            })
            unlocks.forEach(u => userUnlocks.set(u.advancementId, u.updatedAt))
        }
    }

    const formattedAdvancements = advancements.map((adv: any) => ({
        id: adv.id,
        name: adv.name,
        description: adv.description,
        category: adv.category || 'other',
        icon: adv.icon || 'knowledge_book',
        completedCount: adv._count.userAdvancements,
        totalPlayers: totalPlayersCount,
        unlockedAt: userUnlocks.get(adv.id) || null
    }))

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AchievementsView advancements={formattedAdvancements} />
        </div>
    )
}
