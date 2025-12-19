"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignInModal } from "@/components/sign-in-modal"

export function NavbarAuthButtons() {
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get("signin") === "true") {
            setIsSignInOpen(true)
        }
    }, [searchParams])

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
