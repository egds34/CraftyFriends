"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SignInModal } from "@/components/sign-in-modal"

export function NavbarAuthButtons() {
    const [isSignInOpen, setIsSignInOpen] = useState(false)

    return (
        <>
            <Button
                size="sm"
                onClick={() => setIsSignInOpen(true)}
                className={isSignInOpen ? "bg-accent text-accent-foreground" : ""}
            >
                Sign In
            </Button>

            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />
        </>
    )
}
