"use client"

import { useState, useEffect } from "react"

import { motion, useScroll, useTransform, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroBackground } from "@/components/hero-background"
import { GetStartedButton } from "@/components/get-started-button"
import { User } from "next-auth"
import { ServerMetrics } from "@/components/server-metrics"
import { CommunityGallery } from "@/components/community-gallery"
import { VotingSection, VoteSite } from "@/components/voting-section"
import { WhoWeAre } from "@/components/who-we-are"
import Image from "next/image"

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

    const logoControls = useAnimation()

    useEffect(() => {
        // Force scroll to top on load to ensure Hero animation is seen
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        const sequence = async () => {
            // 1. Rapid Coin Flip (Immediate)
            await logoControls.start({
                rotateY: [0, 2140], // Spin ~3 times and land at -20deg (Left)
                transition: { duration: 3.0, ease: [0.22, 1, 0.36, 1] }
            })
            // 2. Idle Loop (Sway forever)
            logoControls.start({
                rotateY: [1060, 1100, 1060], // -20 -> 20 -> -20 (visual)
                transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            })
        }
        sequence()
    }, [logoControls]);



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
                    <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 lg:gap-32 max-w-[1600px] mx-auto px-8 z-20">

                        {/* Icon Left */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="shrink-0 order-1 md:order-1"
                            style={{ perspective: 1000 }}
                        >
                            <motion.div
                                animate={logoControls}
                                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/20"
                            >
                                <Image
                                    src="/images/logo.png"
                                    alt="Crafty Friends Logo"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>
                        </motion.div>

                        {/* Text Right */}
                        <div className="flex flex-col items-center md:items-center text-center md:text-center gap-6 order-2 md:order-2 max-w-2xl">
                            <motion.h1
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-4xl font-heading font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 leading-tight"
                            >
                                Crafty Friends Minecraft Server!
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-muted-foreground text-lg md:text-xl text-white/90 drop-shadow-md"
                            >
                                Join our premium community today. Unlock exclusive features, server access, and more with our subscription plans.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex gap-4 justify-center md:justify-center w-full"
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
