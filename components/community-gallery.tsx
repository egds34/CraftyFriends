"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface CommunityGalleryProps {
    images: string[]
}

export function CommunityGallery({ images }: CommunityGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [lastInteraction, setLastInteraction] = useState(0)

    // Remove early return to allow rendering empty state structure
    // if (!images || images.length === 0) return null

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % images.length)
        setLastInteraction(Date.now()) // Reset timer
    }

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
        setLastInteraction(Date.now()) // Reset timer
    }

    const handleDotClick = (index: number) => {
        setActiveIndex(index)
        setLastInteraction(Date.now()) // Reset timer
    }

    useEffect(() => {
        if (!images || images.length === 0) return
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [images, lastInteraction]) // Reset interval when lastInteraction changes

    return (
        <section className="py-24 bg-muted/40 relative overflow-hidden">
            <div className="container px-4 mx-auto text-center relative z-10">
                <div className="flex flex-col items-center justify-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 text-primary tracking-tight">
                        Featured Builds
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        Featured builds from our community!
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center perspective-1000">
                    {(!images || images.length === 0) ? (
                        <div className="flex flex-col items-center justify-center text-zinc-500 border border-zinc-800 bg-zinc-900/30 rounded-3xl p-12 backdrop-blur-sm">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl font-medium">Nothing here... yet!</p>
                            <p className="text-sm mt-2">Join us and share your best moments!</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full">
                            {/* Images Container */}
                            <div
                                className="relative flex-1 h-full flex items-center justify-center overflow-visible"
                                style={{ perspective: '1000px' }}
                            >
                                <AnimatePresence initial={false} mode="popLayout">
                                    {images.map((img, i) => {
                                        const length = images.length
                                        let offset = (i - activeIndex) % length;
                                        if (offset < 0) offset += length;
                                        if (offset > length / 2) offset -= length;

                                        let zIndex = 0;
                                        let x = "0%";
                                        let scale = 0.6;
                                        let opacity = 0;
                                        let blur = "4px";
                                        let rotateY = 0;

                                        if (offset === 0) {
                                            zIndex = 10;
                                            x = "0%";
                                            scale = 1;
                                            opacity = 1;
                                            blur = "0px";
                                            rotateY = 0;
                                        } else if (offset === -1) {
                                            zIndex = 5;
                                            x = "-50%";
                                            scale = 0.8;
                                            opacity = 0.6;
                                            blur = "2px";
                                            rotateY = 15;
                                        } else if (offset === 1) {
                                            zIndex = 5;
                                            x = "50%";
                                            scale = 0.8;
                                            opacity = 0.6;
                                            blur = "2px";
                                            rotateY = -15;
                                        } else {
                                            zIndex = 1;
                                            scale = 0.5;
                                            opacity = 0;
                                            x = offset < 0 ? "-80%" : "80%";
                                            rotateY = 0;
                                        }

                                        return (
                                            <motion.div
                                                key={i}
                                                className={`absolute w-[80%] md:w-[65%] h-[90%] overflow-hidden ${offset === 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                                initial={false}
                                                animate={{
                                                    zIndex,
                                                    x,
                                                    scale,
                                                    opacity,
                                                    rotateY,
                                                    filter: `blur(${blur}) grayscale(${offset === 0 ? 0 : 0.5}) brightness(${offset === 0 ? 1 : 0.7})`,
                                                    borderRadius: '50px'
                                                }}
                                                drag={offset === 0 ? "x" : false}
                                                dragConstraints={{ left: 0, right: 0 }}
                                                dragElastic={1}
                                                onDragStart={() => {
                                                    setLastInteraction(Date.now()) // Reset timer on drag start
                                                }}
                                                onDragEnd={(e, { offset: swipeOffset, velocity }) => {
                                                    const swipeThreshold = 10000;
                                                    const distThreshold = 50;
                                                    if (swipeOffset.x > distThreshold || velocity.x > swipeThreshold) {
                                                        handlePrev();
                                                    } else if (swipeOffset.x < -distThreshold || velocity.x < -swipeThreshold) {
                                                        handleNext();
                                                    } else {
                                                        // Reset timer even if no swipe occurred
                                                        setLastInteraction(Date.now())
                                                    }
                                                }}
                                                transition={{
                                                    duration: 0.6,
                                                    ease: [0.32, 0.72, 0, 1]
                                                }}
                                                style={{ originX: 0.5, originY: 0.5 }}
                                                onClick={() => {
                                                    if (offset === -1) handlePrev();
                                                    if (offset === 1) handleNext();
                                                }}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`Community Highlight ${i + 1}`}
                                                    fill
                                                    className="object-cover pointer-events-none"
                                                    priority={offset === 0}
                                                />
                                                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 ${offset === 0 ? 'opacity-60' : 'opacity-80'}`} />
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dots Navigation */}
                {images && images.length > 0 && (
                    <div className="flex justify-center gap-3 mt-8">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleDotClick(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${itemsActiveIndex(i)
                                    ? "bg-primary w-8"
                                    : "bg-primary/20 hover:bg-primary/40"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )

    function itemsActiveIndex(i: number) {
        return i === activeIndex
    }
}
