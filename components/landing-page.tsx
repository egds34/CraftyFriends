"use client"

import { useState, useEffect } from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroBackground } from "@/components/hero-background"
import { GetStartedButton } from "@/components/get-started-button"
import { User } from "next-auth"
import { PaymentModal } from "@/components/payment-modal"
import { ServerMetrics } from "@/components/server-metrics"

interface LandingPageProps {
    bannerImages: string[]
    user?: User
}

export function LandingPage({ bannerImages, user }: LandingPageProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [selectedTier, setSelectedTier] = useState<{
        name: string
        price: string
        priceId: string
        features: string[]
        color: string
    } | null>(null)

    useEffect(() => {
        // Force scroll to top on load to ensure Hero animation is seen
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    const handleSubscribe = async (tier: any) => {
        if (!user) {
            window.location.href = "/api/auth/signin"
            return
        }

        // --- PIVOT TO HOSTED CHECKOUT ---
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: tier.priceId })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("Failed to create checkout session")
            }
        } catch (error) {
            console.error("Error creating checkout session:", error)
        }

        // ORIGINAL MODAL LOGIC (PRESERVED)
        // setSelectedTier(tier)
        // setIsPaymentOpen(true)
    }

    return (
        <main className="flex-1">
            {/* Payment Modal */}
            {selectedTier && (
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    tier={selectedTier}
                    userEmail={user?.email}
                />
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                <HeroBackground images={bannerImages} />

                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                        >
                            Crafty Friends Minecraft Server!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-muted-foreground text-lg md:text-xl max-w-[600px] text-white/90 drop-shadow-md"
                        >
                            Join our premium community today. Unlock exclusive features, server access, and more with our subscription plans.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex gap-4"
                        >
                            <GetStartedButton user={user} />
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-background/50 hover:bg-background/70 border-white/20 text-white backdrop-blur-sm"
                                onClick={(e) => {
                                    e.preventDefault()
                                    const target = document.querySelector('#features')
                                    if (!target) return

                                    const targetPosition = target.getBoundingClientRect().top + window.scrollY
                                    const startPosition = window.scrollY
                                    const distance = targetPosition - startPosition
                                    const duration = 800
                                    let start: number | null = null

                                    function animation(currentTime: number) {
                                        if (start === null) start = currentTime
                                        const timeElapsed = currentTime - start
                                        // Ease out cubic function for "quick and dampening" feel
                                        const ease = (t: number) => 1 - Math.pow(1 - t, 3)

                                        const run = ease(timeElapsed / duration) * distance + startPosition
                                        window.scrollTo(0, run)

                                        if (timeElapsed < duration) requestAnimationFrame(animation)
                                    }

                                    requestAnimationFrame(animation)
                                }}
                            >
                                Learn More
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Server Metrics Section */}
            <ServerMetrics />

            {/* Features Section */}
            <section id="features" className="py-20 bg-muted/50">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Go Premium?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Exclusive Access", description: "Get whitelisted on our private high-performance servers." },
                            { title: "Custom Cosmetics", description: "Stand out with unique capes and cosmetics in-game." },
                            { title: "Priority Support", description: "Direct line to our support team for any issues." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
                    <p className="text-muted-foreground mb-12">Select the perfect tier for your needs.</p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Basic Tier */}
                        <Link href="/dashboard" className="group block rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full relative overflow-hidden">
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <h3 className="text-xl font-bold mb-2 transition-colors">Basic</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-6">
                                    <span className="text-3xl font-bold">$4.99</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8 text-left text-sm flex-1">
                                    {["Server Access", "Discord Role"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 h-11 px-8 border border-input bg-background group-hover:border-0 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
                                    Subscribe
                                </div>
                            </div>
                        </Link>

                        {/* Premium Tier (Middle) */}
                        <div
                            onClick={() => handleSubscribe({
                                name: "Premium",
                                price: "$9.99",
                                priceId: "premium",
                                features: ["All Basic Features", "Gold Chat Name & Badge", "30+ Custom Cosmetics", "Monthly Bonus Items"],
                                color: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                            })}
                            className="group block rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
                                POPULAR
                            </div>
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <h3 className="text-2xl font-bold mb-2 transition-colors">Premium</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-6">
                                    <span className="text-4xl font-extrabold">$9.99</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8 text-left flex-1">
                                    {["All Basic Features", "Gold Chat Name & Badge", "30+ Custom Cosmetics", "Monthly Bonus Items"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 h-11 px-8 border border-input bg-background group-hover:border-0 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
                                    Subscribe Now
                                </div>
                            </div>
                        </div>

                        {/* Elite Tier */}
                        <div className="group block rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full relative overflow-hidden opacity-50 cursor-not-allowed">
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <h3 className="text-xl font-bold mb-2 transition-colors">Elite</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-6">
                                    <span className="text-3xl font-bold">$19.99</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8 text-left text-sm flex-1">
                                    {["All Premium Features", "Custom Chat Color", "Private Channel Access", "Priority Support"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 h-11 px-8 border border-input bg-background group-hover:border-0 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
