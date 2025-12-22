"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface HeroBackgroundProps {
    images: string[]
}

export function HeroBackground({ images }: HeroBackgroundProps) {
    // Fallback if no images are provided
    const bannerImages = images.length > 0 ? images : ["/images/banners/banner-1.png"]
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerImages.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [bannerImages.length])

    return (
        <div className="absolute inset-0 overflow-hidden -z-10 bg-black">
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10" />

            <div className="h-full w-full relative">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        className="absolute inset-0 h-full w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    >
                        <Image
                            src={bannerImages[currentIndex]}
                            alt={`Background ${currentIndex}`}
                            fill
                            className="object-cover"
                            priority={true}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
