"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignInModal } from "@/components/sign-in-modal"
import { User } from "next-auth"

interface GetStartedButtonProps {
    user?: User
}

export function GetStartedButton({ user }: GetStartedButtonProps) {
    const [isSignInOpen, setIsSignInOpen] = useState(false)

    if (user) {
        return (
            <Link href="/account">
                <Button size="lg" variant="premium">
                    Get Started
                </Button>
            </Link>
        )
    }

    return (
        <>
            <Button size="lg" variant="premium" onClick={() => setIsSignInOpen(true)}>
                Get Started
            </Button>

            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />
        </>
    )
}
