"use client"

import { Button } from "@/components/ui/button"
import { useSignOut } from "@/providers/SignOutProvider"
import { LogOut } from "lucide-react"

export function DashboardSignOutButton() {
    const { signOut } = useSignOut()

    return (
        <Button
            variant="default"
            size="sm"
            onClick={() => signOut()}
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </Button>
    )
}
