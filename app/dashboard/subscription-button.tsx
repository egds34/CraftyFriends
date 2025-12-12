"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SubscriptionButtonProps {
    isPremium: boolean
}

export function SubscriptionButton({ isPremium }: SubscriptionButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stripe/checkout", { method: "POST" })
            const data = await response.json()
            window.location.href = data.url
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleManage = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await response.json()
            window.location.href = data.url
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (isPremium) {
        return (
            <Button variant="outline" onClick={handleManage} disabled={loading}>
                {loading ? "Loading..." : "Manage Subscription"}
            </Button>
        )
    }

    return (
        <Button variant="premium" onClick={handleSubscribe} disabled={loading}>
            {loading ? "Proceeding..." : "Upgrade to Premium"}
        </Button>
    )
}
