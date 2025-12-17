"use client"

import { useState, useEffect } from "react"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroBackground } from "@/components/hero-background"
import { GetStartedButton } from "@/components/get-started-button"
import { User } from "next-auth"
import { ServerMetrics } from "@/components/server-metrics"
import { CommunityGallery } from "@/components/community-gallery"
import { VotingSection, VoteSite } from "@/components/voting-section"
import { WhoWeAre } from "@/components/who-we-are"

interface LandingPageProps {
    bannerImages: string[]
    user?: User
    communityImages: string[]
    votingSites: VoteSite[]
}

export function LandingPage({ bannerImages, user, communityImages, votingSites }: LandingPageProps) {
    // ... existing state ...
    // ... existing state ...

    const [viewportHeight, setViewportHeight] = useState(0)

    useEffect(() => {
        setViewportHeight(window.innerHeight)
        const handleResize = () => setViewportHeight(window.innerHeight)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const { scrollY } = useScroll()

    // Scroll logic:
    // 0 -> 70vh: Banner shrinks 100vh->30vh. Banner Y is 0.
    // > 70vh: Banner Height fixed 30vh. Banner Y moves up (scrolling away).
    const range = viewportHeight > 0 ? viewportHeight * 0.7 : 1000

    const bannerHeight = useTransform(scrollY, [0, range], ["100vh", "30vh"])
    const bannerY = useTransform(scrollY, [range, range * 2], [0, -range])

    useEffect(() => {
        // Force scroll to top on load to ensure Hero animation is seen
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);



    return (
        <main className="flex-1">
            {/* Payment Modal */}


            {/* Hero Section - Fixed Position */}
            <motion.div
                className="fixed top-0 left-0 right-0 z-0 overflow-hidden shadow-2xl flex items-start justify-center"
                style={{
                    height: bannerHeight,
                    y: bannerY
                }}
            >
                <div className="w-full h-full relative">
                    <HeroBackground images={bannerImages} />

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6 max-w-3xl mx-auto px-4 z-20">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-heading font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
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
                                    // Scroll to just past the hero section
                                    window.scrollTo({
                                        top: window.innerHeight,
                                        behavior: 'smooth'
                                    })
                                }}
                            >
                                Learn More
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Spacer to push content down below the initial full-screen banner */}
            <div className="h-screen w-full relative z-[-1]" />

            {/* Content Section - Flows naturally after the spacer */}
            <div className="relative z-10 bg-background">
                <WhoWeAre />
                <ServerMetrics />

                {/* Community & Voting Layers */}
                <CommunityGallery images={communityImages} />
                <VotingSection sites={votingSites} />
            </div>

        </main>
    )
}
