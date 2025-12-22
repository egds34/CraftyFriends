"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/actions"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setErrors({})

        const formData = new FormData(event.currentTarget)
        const result = await registerUser(formData)

        if (result?.error) {
            setErrors(result.error as Record<string, string[]>)
            setLoading(false)
        } else if (result?.success) {
            router.push("/auth/signin?registered=true")
        } else {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-black/95">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 blur-3xl rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
                    <p className="text-muted-foreground">Join our premium community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
