"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/providers/SignOutProvider"
import { User } from "next-auth"

interface UserNavProps {
    user: User & { role?: string }
}

export function UserNav({ user }: UserNavProps) {
    const { signOut } = useSignOut()

    return (
        <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium hover:underline text-destructive/80">
                    Admin
                </Link>
            )}
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
            </Link>
            <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
            >
                Sign Out
            </Button>
        </div>
    )
}
