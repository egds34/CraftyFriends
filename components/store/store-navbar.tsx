"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { mockProducts } from "@/lib/mock-products"

interface StoreNavbarProps {
    categories: string[]
    activeCategory?: string
}

export function StoreNavbar({ categories }: StoreNavbarProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0] || "Memberships")

    const scrollToCategory = (category: string) => {
        const element = document.getElementById(category)
        if (element) {
            const offset = 120 // Adjust for sticky headers
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
            setActiveCategory(category)
        }
    }

    // Scrollspy
    useEffect(() => {
        const handleScroll = () => {
            const sections = categories.map(cat => document.getElementById(cat))
            const scrollPosition = window.scrollY + 150

            for (const section of sections) {
                if (
                    section &&
                    section.offsetTop <= scrollPosition &&
                    (section.offsetTop + section.offsetHeight) > scrollPosition
                ) {
                    setActiveCategory(section.id)
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [categories])

    return (
        <nav className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 w-full items-center justify-center overflow-x-auto no-scrollbar">
                <div className="flex items-center space-x-1 px-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => scrollToCategory(category)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                                activeCategory === category
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {category}
                            {activeCategory === category && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    )
}
