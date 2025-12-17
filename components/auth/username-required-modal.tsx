'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"
import { updateMinecraftUsername } from "@/app/actions/update-username"

export function UsernameRequiredModal() {
    const { data: session, status, update } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        // Only show if authenticated and no username is set
        if (status === 'authenticated' && session?.user && !session.user.minecraftUsername) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [status, session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await updateMinecraftUsername(username)
            // Force session update
            await update() 
            setIsOpen(false)
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to update username")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Prevent closing by returning null for the backdrop click handler
    // and not passing any onClose prop

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Fixed Backdrop - No click handler */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-background/95 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md p-4"
                    >
                        <div className="bg-card border shadow-2xl rounded-2xl p-8 text-center space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-heading">Account Completion</h2>
                                <p className="text-muted-foreground">
                                    To finish setting up your account, please enter your Minecraft Java username.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <label htmlFor="username" className="text-sm font-medium ml-1">
                                        Minecraft Username
                                    </label>
                                    <Input
                                        id="username"
                                        placeholder="Enter your username..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-12 bg-muted/50 text-lg"
                                        autoComplete="off"
                                        autoFocus
                                        minLength={3}
                                        maxLength={16}
                                        required
                                    />
                                    {error && <p className="text-sm text-destructive ml-1">{error}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                    disabled={!username || isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Complete Setup"}
                                </Button>
                            </form>

                            <p className="text-xs text-muted-foreground">
                                Validating this is required to receive in-game rewards.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
