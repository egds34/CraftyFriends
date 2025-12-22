import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== 'ADMIN') return redirect("/account")

    const users = await prisma.user.findMany({
        orderBy: { email: 'asc' },
        select: { id: true, email: true, role: true, minecraftUsername: true }
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users and system settings.</p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">All Users</h3>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Minecraft User</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' :
                                                user.role === 'PREMIUM' ? 'bg-indigo-500/10 text-indigo-500' :
                                                    'bg-secondary text-secondary-foreground'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">{user.minecraftUsername || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
