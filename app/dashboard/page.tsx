import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./profile-form"
import { SubscriptionButton } from "./subscription-button"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) return redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    })

    // Fallback if user not found updates need session
    if (!user) return redirect("/api/auth/signin")

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage your account and subscription.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5 mb-4">
                        <h3 className="font-semibold leading-none tracking-tight">Profile</h3>
                        <p className="text-sm text-muted-foreground">Your personal information</p>
                    </div>
                    <div className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-sm font-medium">Email</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <ProfileForm initialUsername={user.minecraftUsername} />
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5 mb-4">
                        <h3 className="font-semibold leading-none tracking-tight">Subscription Status</h3>
                        <p className="text-sm text-muted-foreground">Premium access details</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.role === 'PREMIUM' || user.role === 'ADMIN' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                                {user.role === 'PREMIUM' || user.role === 'ADMIN' ? 'Active Premium' : 'Free Plan'}
                            </span>
                        </div>
                        {user.role === 'PREMIUM' || user.role === 'ADMIN' ? (
                            <p className="text-sm text-muted-foreground">
                                Your subscription renews on {user.subscription?.currentPeriodEnd?.toLocaleDateString() || 'N/A'}.
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Upgrade to Premium to unlock exclusive features on our servers.
                            </p>
                        )}

                        <SubscriptionButton isPremium={user.role === 'PREMIUM' || user.role === 'ADMIN'} />
                    </div>
                </div>
            </div>
        </div>
    )
}
