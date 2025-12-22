"use client"

import { createContext, useContext, ReactNode, useState, useCallback } from "react"
import { signOut as nextAuthSignOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SignOutModal } from "@/components/auth/SignOutModal"

interface SignOutContextType {
    signOut: () => Promise<void>
}

const SignOutContext = createContext<SignOutContextType | undefined>(undefined)

export function SignOutProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    const signOut = useCallback(async () => {
        // 1. Show Modal (Spinner)
        setIsModalOpen(true)
        setIsSuccess(false)

        try {
            // 2. Perform actual sign out, but prevent auto-redirect
            // We use redirect: false so we can show the success state
            await nextAuthSignOut({ redirect: false })

            // 3. Show Success state
            setIsSuccess(true)

            // 4. Wait for a moment to let the user see the success message
            setTimeout(() => {
                // 5. Redirect to landing page
                router.push("/")
                router.refresh() // Ensure server components refresh state

                // Optional: Short delay before closing modal to allow page transition
                setTimeout(() => {
                    setIsModalOpen(false)
                    setIsSuccess(false)
                }, 500)
            }, 2000)

        } catch (error) {
            console.error("Sign out failed", error)
            // Handle error state if needed, for now just close
            setIsModalOpen(false)
        }
    }, [router])

    return (
        <SignOutContext.Provider value={{ signOut }}>
            {children}
            <SignOutModal isOpen={isModalOpen} isSuccess={isSuccess} />
        </SignOutContext.Provider>
    )
}

export function useSignOut() {
    const context = useContext(SignOutContext)
    if (context === undefined) {
        throw new Error("useSignOut must be used within a SignOutProvider")
    }
    return context
}
