"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateMinecraftUsername } from "@/lib/user-actions"
import type { Session } from "next-auth"
import { useRouter } from "next/navigation"

interface AccountCompletionModalProps {
    session: Session | null
}

export function AccountCompletionModal({ session }: AccountCompletionModalProps) {
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Determine if we should show the modal
    // Show if: 
    // 1. User is logged in (session.user exists)
    // 2. minecraftUsername is missing or empty
    // @ts-ignore
    const shouldShow = !!session?.user && !session.user.minecraftUsername

    if (!mounted) return null

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await updateMinecraftUsername(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            // Success! The server action revalidates path, so the session prop passed from server 
            // should eventually update if the layout re-renders. 
            // However, for immediate feedback and to close the modal locally:
            router.refresh()
            // We rely on router.refresh() to re-fetch server components (including layout => session).
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {shouldShow && (
                <>
                    {/* Backdrop - No click handler to close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
                    >
                        <div className="relative w-full rounded-2xl border bg-card p-8 shadow-2xl overflow-hidden flex flex-col justify-center">

                            {/* Decorative header */}
                            <div className="mb-6 text-center">
                                <h1 className="text-3xl font-heading font-bold tracking-tight">
                                    One Last Step!
                                </h1>
                                <p className="text-muted-foreground">
                                    Please enter your Minecraft username to complete your account.
                                </p>
                            </div>

                            {/* Form */}
                            <form action={handleSubmit} className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Minecraft Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="Steve"
                                        required
                                        disabled={loading}
                                        className="bg-background/50"
                                    />
                                    {error && <p className="text-xs text-red-500">{error}</p>}
                                </div>

                                <Button type="submit" className="w-full mt-4" disabled={loading}>
                                    {loading ? "Saving..." : "Complete Setup"}
                                </Button>
                            </form>

                            {/* Optional: Sign out if they are stuck/want to switch accounts? 
                                User prompt says "The only way to avoid... is deleting cookies".
                                I will leave it without a signout button to strictly follow "impossible to exit", 
                                relying on the user's browser knowledge or just closing the tab.
                            */}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
