"use client"

import { Button } from "@/components/ui/button"
import { updateProfile } from "./actions"
import { useState } from "react"

export function ProfileForm({ initialUsername }: { initialUsername: string | null }) {
    const [error, setError] = useState<string | null>(null)

    async function action(formData: FormData) {
        setError(null)
        const res = await updateProfile(formData)
        if (res?.error) setError(res.error)
    }

    return (
        <form action={action} className="flex flex-col gap-4 max-w-sm">
            <div className="flex flex-col gap-2">
                <label htmlFor="minecraftUsername" className="text-sm font-medium">
                    Minecraft Username
                </label>
                <div className="flex gap-2">
                    <input
                        id="minecraftUsername"
                        name="minecraftUsername"
                        defaultValue={initialUsername || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Notch"
                    />
                    <Button type="submit" size="sm">Save</Button>
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
    )
}
