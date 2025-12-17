import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./profile-form"
import { SubscriptionButton } from "./subscription-button"
import { redirect } from "next/navigation"
import { DashboardSignOutButton } from "@/components/account/sign-out-button"
import { DashboardRefresher } from "@/components/dashboard-refresher"
import { PasswordSettings } from "@/components/account/password-settings"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) return redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscriptions: true }
    })

    // Fallback if user not found updates need session
    if (!user) return redirect("/api/auth/signin")

    const membershipSub = user.subscriptions.find(sub => sub.category === 'membership' || !sub.category)
    const addonSubs = user.subscriptions.filter(sub => sub.category === 'addon')

    return (
        <div className="space-y-8">
            <DashboardRefresher userId={user.id} />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
                    <p className="text-muted-foreground">Manage your account and subscriptions.</p>
                </div>
                <DashboardSignOutButton />
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

                {/* Password/Security Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <PasswordSettings
                        hasPassword={!!user.password}
                        isTwoFactorEnabled={user.isTwoFactorEnabled}
                        hasAuthenticator={!!user.twoFactorSecret}
                    />
                </div>

                {/* Membership Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5 mb-4">
                        <h3 className="font-semibold leading-none tracking-tight">Membership</h3>
                        <p className="text-sm text-muted-foreground">Primary access plan</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.role === 'PREMIUM' || user.role === 'ADMIN' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                                {membershipSub ? 'Active Premium' : 'Free Plan'}
                            </span>
                        </div>

                        {membershipSub ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Current Plan</p>
                                <p className="text-sm text-muted-foreground">
                                    {membershipSub.cancelAtPeriodEnd
                                        ? `Ends on ${membershipSub.currentPeriodEnd?.toLocaleDateString() || 'N/A'}`
                                        : `Renews on ${membershipSub.currentPeriodEnd?.toLocaleDateString() || 'N/A'}`
                                    }
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Upgrade to Premium to unlock exclusive features.
                            </p>
                        )}

                        <SubscriptionButton isPremium={!!membershipSub} />
                    </div>
                </div>

                {/* Add-ons Card (Only show if they have add-ons) */}
                {addonSubs.length > 0 && (
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-col space-y-1.5 mb-4">
                            <h3 className="font-semibold leading-none tracking-tight">Active Add-ons</h3>
                            <p className="text-sm text-muted-foreground">Extra features enabled</p>
                        </div>
                        <div className="space-y-4">
                            {addonSubs.map(sub => (
                                <div key={sub.transactionId} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <span className="font-medium">Add-on</span>
                                    <span className="text-muted-foreground">
                                        {sub.cancelAtPeriodEnd
                                            ? `Ends ${sub.currentPeriodEnd?.toLocaleDateString()}`
                                            : `Renews ${sub.currentPeriodEnd?.toLocaleDateString()}`
                                        }
                                    </span>
                                </div>
                            ))}
                            <div className="pt-2">
                                <p className="text-xs text-muted-foreground">Manage add-ons in the billing portal.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
