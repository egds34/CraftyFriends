"use client"

import Link from "next/link"
import { X } from "lucide-react"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithCredentials, signInWithGoogle, signInWithGithub, requestTwoFactorEmail } from "@/app/auth/actions"
import { registerUser, reset } from "@/lib/actions"
import { AuthError } from "next-auth"
import { PasswordStrengthChecker } from "@/components/ui/password-strength-checker"

interface SignInModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [mounted, setMounted] = useState(false)
    const [view, setView] = useState<"signin" | "signup" | "forgot_password" | "2fa" | "success_verification" | "success_reset">("signin")
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState("")
    const [submittedPassword, setSubmittedPassword] = useState("")
    const [twoFactorType, setTwoFactorType] = useState<"APP" | "EMAIL" | null>(null)
    const [signupPassword, setSignupPassword] = useState("")
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
    const [resetPassword, setResetPassword] = useState("")

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setView("signin")
            setErrors({})
            setLoading(false)
            setSubmittedEmail("")
            setSubmittedPassword("")
            setTwoFactorType(null)
            setSignupPassword("")
            setSignupConfirmPassword("")
            setResetPassword("")
        }
    }, [isOpen])

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Register Handler
    async function handleRegister(formData: FormData) {
        setLoading(true)
        setErrors({})
        const email = formData.get("email") as string
        const result = await registerUser(formData)

        if (result?.error) {
            setErrors(result.error as Record<string, string[]>)
            setLoading(false)
        } else if (result?.success) {
            setSubmittedEmail(email)
            setView("success_verification")
            setLoading(false)
        } else {
            setLoading(false)
        }
    }

    // Login Handler
    async function handleLogin(formData: FormData) {
        setLoading(true);
        setErrors({});

        try {
            const result = await signInWithCredentials(formData);
            console.log("Client Login Result:", result); // Debug log

            // Handle 2FA requirement
            if (result?.error === "2FA") {
                console.log("Client: Switching to 2FA view"); setErrors({});
                setSubmittedEmail(formData.get("email") as string);
                setSubmittedPassword(formData.get("password") as string);

                // @ts-ignore
                setTwoFactorType(result.twoFactorType || "EMAIL")

                setView("2fa");
            } else if (result?.error) {
                // Handle generic errors
                setErrors({ _form: [result.error] });
            }
        } catch (error) {
            // ... existing catch ...
            // Handle Next.js Redirect (Success) as an error in Server Actions
            if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
                onClose();
                return;
            }

            // Handle actual errors
            console.error("Login error:", error);
            setErrors({ _form: ["Invalid email or password."] });
        }

        setLoading(false);
    }

    // Forgot Password Handler
    async function handleForgot(formData: FormData) {
        setLoading(true)
        setErrors({})
        const email = formData.get("email") as string

        const result = await reset({ email });
        if (result?.error) {
            setErrors({ email: [result.error], _form: [result.error] })
        } else if (result?.success) {
            setSubmittedEmail(email)
            setView("success_reset")
        }
        setLoading(false)
    }

    // Dynamic Title & Description
    let title = "Welcome Back"
    let description = "Sign in to your account"

    switch (view) {
        case "signup":
            title = "Create Account"
            description = "Join our premium community"
            break
        case "forgot_password":
            title = "Reset Password"
            description = "Enter your email to receive a reset link"
            break
        case "2fa":
            title = "Two-Factor Authentication"
            description = "Enter the code sent to your email"
            break
        case "success_verification":
        case "success_reset":
            title = "Check your inbox"
            description = ""
            break
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
                    >
                        <div className="relative w-full rounded-2xl border bg-card p-8 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>

                            {/* Success Views */}
                            {(view === "success_verification" || view === "success_reset") ? (
                                <div className="flex flex-col items-center justify-center space-y-4 text-center p-4 animate-in fade-in zoom-in duration-300">
                                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold">{title}</h2>
                                    <p className="text-muted-foreground">
                                        We've sent a {view === "success_reset" ? "password reset" : "verification"} link to <br />
                                        <span className="font-medium text-foreground">{submittedEmail}</span>
                                    </p>
                                    <Button onClick={onClose} className="w-full mt-4" variant="outline">
                                        Close
                                    </Button>
                                    <Button variant="ghost" className="w-full" onClick={() => setView("signin")}>
                                        Back to Sign In
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 text-center">
                                        <h1 className="text-3xl font-heading font-bold tracking-tight">{title}</h1>
                                        <p className="text-muted-foreground">{description}</p>
                                    </div>

                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {view === "signup" && (
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        value={signupPassword}
                                                        onChange={(e) => setSignupPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        className="bg-background/50"
                                                    />
                                                    {errors.password && <p className="text-xs text-red-500">{errors.password[0]}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={signupConfirmPassword}
                                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        className="bg-background/50"
                                                    />
                                                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword[0]}</p>}
                                                    <AnimatePresence>
                                                        {signupPassword && signupConfirmPassword && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="h-5 flex items-center">
                                                                    <AnimatePresence mode="wait">
                                                                        <motion.p
                                                                            key={signupPassword === signupConfirmPassword ? "match" : "no-match"}
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                            transition={{ duration: 0.15 }}
                                                                            className={`text-xs flex items-center gap-1 ${signupPassword === signupConfirmPassword
                                                                                ? "text-green-600 dark:text-green-400"
                                                                                : "text-red-500"
                                                                                }`}
                                                                        >
                                                                            {signupPassword === signupConfirmPassword ? (
                                                                                <>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                                    Passwords match
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                                    Passwords don't match
                                                                                </>
                                                                            )}
                                                                        </motion.p>
                                                                    </AnimatePresence>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <PasswordStrengthChecker password={signupPassword} />

                                                {errors._form && <p className="text-sm text-red-500 text-center">{errors._form[0]}</p>}
                                                <Button type="submit" className="w-full mt-4" disabled={loading} variant="premium">
                                                    {loading ? "Creating..." : "Sign Up"}
                                                </Button>
                                            </motion.form>
                                        )}

                                        {(view === "signin" || view === "2fa") && (
                                            <motion.div
                                                key="signin-flow"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                            >
                                                <form action={handleLogin} className="space-y-4">
                                                    {view === "signin" ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="email">Email</Label>
                                                                <Input id="email" name="email" type="email" placeholder="steve@minecraft.com" required className="bg-background/50" />
                                                                {errors.email && <p className="text-xs text-red-500">{errors.email[0]}</p>}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Label htmlFor="password">Password</Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setView("forgot_password"); setErrors({}); }}
                                                                        className="text-xs text-primary hover:underline"
                                                                    >
                                                                        Forgot password?
                                                                    </button>
                                                                </div>
                                                                <Input id="password" name="password" type="password" required className="bg-background/50" />
                                                                {errors.password && <p className="text-xs text-red-500">{errors.password[0]}</p>}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="p-3 bg-primary/10 rounded-md text-sm text-center">
                                                                {twoFactorType === "APP"
                                                                    ? "Open your Authenticator App to get the code."
                                                                    : "A 2FA code has been sent to your email."
                                                                }
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="code">Two-Factor Code</Label>
                                                                <Input id="code" name="code" placeholder="123456" required className="bg-background/50 text-center text-lg tracking-widest" />
                                                                {errors.code && <p className="text-xs text-red-500">{errors.code[0]}</p>}
                                                            </div>
                                                            <input type="hidden" name="email" value={submittedEmail} />
                                                            <input type="hidden" name="password" value={submittedPassword} />
                                                        </div>
                                                    )}
                                                    {view === "2fa" && (
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    const res = await requestTwoFactorEmail(submittedEmail);
                                                                    if (res?.success) {
                                                                        setErrors({ code: ["Email sent!"] });
                                                                    } else {
                                                                        setErrors({ code: ["Failed to send email"] });
                                                                    }
                                                                }}
                                                                className="text-xs text-primary hover:underline bg-transparent border-0"
                                                            >
                                                                Send code to email instead
                                                            </button>
                                                        </div>
                                                    )}
                                                    {errors._form && <p className="text-sm text-red-500 text-center">{errors._form[0]}</p>}
                                                    <Button type="submit" className="w-full" variant="premium" disabled={loading}>
                                                        {view === "2fa" ? "Confirm" : "Sign In with Credentials"}
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

                                        {view === "forgot_password" && (
                                            <motion.form
                                                key="forgot"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                                action={handleForgot}
                                            >
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" name="email" type="email" placeholder="steve@minecraft.com" required disabled={loading} className="bg-background/50" />
                                                    {errors.email && <p className="text-xs text-red-500">{errors.email[0]}</p>}
                                                </div>
                                                {errors._form && <p className="text-sm text-red-500 text-center">{errors._form[0]}</p>}

                                                <Button type="submit" className="w-full mt-4" disabled={loading} variant="premium">
                                                    {loading ? "Sending..." : "Send Reset Link"}
                                                </Button>

                                                <div className="mt-4 text-center">
                                                    <button type="button" onClick={() => { setView("signin"); setErrors({}); }} className="text-sm text-muted-foreground hover:text-primary">
                                                        Back to Sign In
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>

                                    {view !== "forgot_password" && view !== "2fa" && (
                                        <div className="mt-8 text-center text-sm">
                                            <span className="text-muted-foreground">{view === "signup" ? "Already have an account? " : "Don't have an account? "}</span>
                                            <button
                                                onClick={() => {
                                                    setView(view === "signup" ? "signin" : "signup")
                                                    setErrors({})
                                                }}
                                                className="font-medium text-primary hover:underline bg-transparent border-0 p-0"
                                            >
                                                {view === "signup" ? "Sign In" : "Sign Up"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

