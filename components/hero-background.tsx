"use client"

import { motion } from "framer-motion"

interface HeroBackgroundProps {
    images: string[]
}

export function HeroBackground({ images }: HeroBackgroundProps) {
    // Fallback if no images are provided
    const bannerImages = images.length > 0 ? images : ["/images/banners/banner-1.png"]
    return (
        <div className="absolute inset-0 overflow-hidden -z-10 bg-black">
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10" />

            <div className="relative flex h-full overflow-hidden">
                <motion.div
                    className="flex h-full min-w-full items-center"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 120, // 2 minutes for full rotation - nice and slow
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {/* Double the images to create seamless loop */}
                    {[...bannerImages, ...bannerImages].map((src, i) => (
                        <div key={i} className="relative h-full aspect-video min-w-[800px] flex-shrink-0">
                            <img
                                src={src}
                                alt={`Background ${i}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
