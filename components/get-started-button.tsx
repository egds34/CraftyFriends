"use client"

import { useState } from "react"
import Link from "next/link"
import { SignInModal } from "@/components/sign-in-modal"
import { JellyButton } from "@/components/ui/jelly-button"
import { User } from "next-auth"

interface GetStartedButtonProps {
    user?: User
}

export function GetStartedButton({ user }: GetStartedButtonProps) {
    const [isSignInOpen, setIsSignInOpen] = useState(false)

    if (user) {
        return (
            <Link href="/account">
                <JellyButton size="lg">
                    Get Started
                </JellyButton>
            </Link>
        )
    }

    return (
        <>
            <JellyButton size="lg" onClick={() => setIsSignInOpen(true)}>
                Get Started
            </JellyButton>

            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />
        </>
    )
}
