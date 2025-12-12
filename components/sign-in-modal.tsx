"use client"

import { X } from "lucide-react"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithCredentials, signInWithGoogle, signInWithGithub } from "@/app/auth/actions"
import { registerUser } from "@/lib/actions"

interface SignInModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [mounted, setMounted] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    async function handleRegister(formData: FormData) {
        setLoading(true)
        setErrors({})
        const result = await registerUser(formData)

        if (result?.error) {
            setErrors(result.error as Record<string, string[]>)
            setLoading(false)
        } else if (result?.success) {
            setIsSignUp(false)
            setLoading(false)
        } else {
            setLoading(false)
        }
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                        <div className="relative w-full rounded-2xl border bg-card p-8 shadow-2xl overflow-hidden min-h-[600px] flex flex-col justify-center">
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>

                            {/* Decorative gradient for premium feel */}
                            <div className="mb-6 text-center">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {isSignUp ? "Create Account" : "Welcome Back"}
                                </h1>
                                <p className="text-muted-foreground">
                                    {isSignUp ? "Join our premium community" : "Sign in to your account"}
                                </p>
                            </div>

                            {/* Forms */}
                            <AnimatePresence mode="popLayout">
                                {isSignUp ? (
                                    <motion.form
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        action={handleRegister}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" placeholder="Steve" required disabled={loading} className="bg-background/50" />
                                            {errors.name && <p className="text-xs text-red-500">{errors.name[0]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="steve@minecraft.com" required disabled={loading} className="bg-background/50" />
                                            {errors.email && <p className="text-xs text-red-500">{errors.email[0]}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input id="password" name="password" type="password" required disabled={loading} className="bg-background/50" />
                                                {errors.password && <p className="text-xs text-red-500">{errors.password[0]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm</Label>
                                                <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={loading} className="bg-background/50" />
                                                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword[0]}</p>}
                                            </div>
                                        </div>
                                        {errors._form && <p className="text-sm text-red-500 text-center">{errors._form[0]}</p>}
                                        <Button type="submit" className="w-full mt-4" disabled={loading} variant="premium">
                                            {loading ? "Creating..." : "Sign Up"}
                                        </Button>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="signin"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <form action={signInWithCredentials} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" name="email" type="email" placeholder="steve@minecraft.com" required className="bg-background/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password">Password</Label>
                                                </div>
                                                <Input id="password" name="password" type="password" required className="bg-background/50" />
                                            </div>

                                            <Button type="submit" className="w-full" variant="premium">
                                                Sign In with Credentials
                                            </Button>
                                        </form>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 justify-center">
                                            <form action={signInWithGoogle}>
                                                <Button variant="outline" className="w-16 h-16 p-0 rounded-xl hover:bg-muted/50 transition-colors" type="submit" title="Sign in with Google">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path></svg>
                                                </Button>
                                            </form>

                                            <form action={signInWithGithub}>
                                                <Button variant="outline" className="w-16 h-16 p-0 rounded-xl hover:bg-muted/50 transition-colors" type="submit" title="Sign in with GitHub">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                                                </Button>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 text-center text-sm">
                                <span className="text-muted-foreground">{isSignUp ? "Already have an account? " : "Don't have an account? "}</span>
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp)
                                        setErrors({})
                                    }}
                                    className="font-medium text-primary hover:underline bg-transparent border-0 p-0"
                                >
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
