"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useTheme } from "next-themes"

// Make sure to call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    tier: {
        name: string
        price: string
        priceId: string
        features: string[]
        color: string
    }
    userEmail?: string | null
}

function CheckoutForm({ onSuccess, onError }: { onSuccess: () => void, onError: (msg: string) => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsLoading(true)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL needs to be valid but we prefer handling it without redirect if possible?
                // Actually Stripe Payment Element usually requires redirect for 3DS etc.
                // But for card payments it might not.
                // However, confirmPayment usually redirects.
                // To avoid redirect we need handleNextAction?
                // Standard Element flow:
                return_url: `${window.location.origin}/dashboard?payment_success=true`,
            },
            redirect: "if_required"
        })

        if (error) {
            setMessage(error.message ?? "An unexpected error occurred.")
            onError(error.message ?? "Error")
            setIsLoading(false)
        } else {
            // Payment succeeded!
            onSuccess()
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-red-500 text-sm">{message}</div>}
            <Button
                disabled={isLoading || !stripe || !elements}
                className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                variant="premium" // Assuming we have this variant
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Pay Now"}
            </Button>
        </form>
    )
}

export function PaymentModal({ isOpen, onClose, tier, userEmail }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { theme } = useTheme()

    // Fetch client secret when modal opens
    useEffect(() => {
        if (isOpen && !clientSecret) {
            fetch("/api/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: tier.priceId })
            })
                .then(async res => {
                    const text = await res.text()
                    try {
                        const data = JSON.parse(text)
                        if (!res.ok) throw new Error(data.error || "Server error")
                        return data
                    } catch (e) {
                        console.error("Failed to parse response:", text)
                        if (!res.ok) throw new Error("Server Error (Check console for details)")
                        throw e
                    }
                })
                .then(data => {
                    console.log("[PaymentModal] Response Data:", data)
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret)
                    } else {
                        console.error("[PaymentModal] Missing clientSecret", data)
                        setError("Failed to retrieve payment details.")
                    }
                })
                .catch(err => setError(err.message || "Failed to initialize payment."))
        }
    })

    const handleSuccess = () => {
        setIsSuccess(true)
        // You would likely also want to trigger confetti here possibly
        setTimeout(() => {
            onClose()
            window.location.href = "/dashboard" // Redirect to dashboard to see new status
        }, 3000)
    }

    if (!isOpen) return null

    const appearance = {
        theme: theme === 'dark' ? 'night' : 'stripe',
        variables: {
            colorPrimary: '#7c3aed',
        },
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden border z-50 flex flex-col md:flex-row min-h-[600px]"
                    >
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* Left Side: Tier Info */}
                        <div className={`w-full md:w-2/5 p-8 text-white flex flex-col justify-between relative overflow-hidden ${tier.color}`}>
                            {/* Abstract background shapes */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-2">{tier.name}</h2>
                                <div className="text-5xl font-extrabold mb-1">{tier.price}<span className="text-lg font-medium opacity-80">/mo</span></div>
                                <p className="opacity-90 mb-8">Upgrade your experience today.</p>

                                <ul className="space-y-4">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="bg-white/20 p-1 rounded-full">
                                                <Check className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative z-10 mt-8 text-xs opacity-70">
                                Secure payment processed by Stripe. You can cancel anytime.
                            </div>
                        </div>

                        {/* Right Side: Payment Form */}
                        <div className="w-full md:w-3/5 p-8 bg-card flex flex-col justify-center relative">
                            {isSuccess ? (
                                <div className="text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
                                    >
                                        <Check className="h-10 w-10 text-white" strokeWidth={3} />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold">Payment Successful!</h3>
                                    <p className="text-muted-foreground">Welcome to the club. Redirecting you to your dashboard...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
                                    <p>{error}</p>
                                    <Button variant="outline" className="mt-4" onClick={onClose}>Close</Button>
                                </div>
                            ) : clientSecret ? (
                                // @ts-ignore
                                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold mb-1">Payment Details</h3>
                                        <p className="text-muted-foreground text-sm">Enter your card information below.</p>
                                    </div>
                                    <CheckoutForm onSuccess={handleSuccess} onError={(msg) => console.error(msg)} />
                                </Elements>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
