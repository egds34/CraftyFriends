"use client"

import { useState } from "react"
import { Product } from "@/types/store"
import { useCart } from "@/components/providers/cart-provider"
import { motion } from "framer-motion"
import { Sparkles, Trophy, MessageCircle, Gift, Zap, ArrowUpRight } from "lucide-react"

import { PillowCard, PillowButton } from "@/components/ui/pillow-card"
import { ProductDetailModal } from "./product-detail-modal"
import { ProductAdminModal } from "./product-admin-modal"
import { cn } from "@/lib/utils"


interface ProductCardProps {
    product: Product
    index?: number
    isAdmin?: boolean
}

export function ProductCard({ product, index = 0, isAdmin = false }: ProductCardProps) {
    const { addToCart } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // Normalize category to handle lowercase singular values from Stripe
    const normalizeCategory = (cat: string): string => {
        const lower = cat.toLowerCase()
        switch (lower) {
            case 'membership':
            case 'memberships': return 'Memberships'
            case 'boost':
            case 'boosts': return 'Boosts'
            case 'chat': return 'Chat'
            case 'donate': return 'Donate'
            case 'misc': return 'Misc'
            default: return 'Misc'
        }
    }

    const getIcon = (cat: string) => {
        const normalized = normalizeCategory(cat)
        switch (normalized) {
            case 'Memberships': return <Trophy className="h-16 w-16 text-yellow-500" />
            case 'Boosts': return <Zap className="h-16 w-16 text-blue-500" />
            case 'Chat': return <MessageCircle className="h-16 w-16 text-pink-500" />
            case 'Donate': return <Gift className="h-16 w-16 text-green-500" />
            default: return <Sparkles className="h-16 w-16 text-purple-500" />
        }
    }

    const getShadowColor = (cat: string) => {
        const normalized = normalizeCategory(cat)
        switch (normalized) {
            case 'Memberships': return 'bg-amber-500/40 dark:shadow-[0_0_25px_rgba(245,158,11,0.4)]'
            case 'Boosts': return 'bg-blue-500/40 dark:shadow-[0_0_25px_rgba(59,130,246,0.4)]'
            case 'Chat': return 'bg-pink-500/40 dark:shadow-[0_0_25px_rgba(236,72,153,0.4)]'
            case 'Donate': return 'bg-emerald-500/40 dark:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
            default: return 'bg-purple-500/40 dark:shadow-[0_0_25px_rgba(168,85,247,0.4)]'
        }
    }

    const getButtonHoverColor = (cat: string) => {
        const normalized = normalizeCategory(cat)
        switch (normalized) {
            case 'Memberships': return 'group-hover:bg-amber-500 dark:group-hover:bg-amber-400 group-hover:text-white'
            case 'Boosts': return 'group-hover:bg-blue-500 dark:group-hover:bg-blue-400 group-hover:text-white'
            case 'Chat': return 'group-hover:bg-pink-500 dark:group-hover:bg-pink-400 group-hover:text-white'
            case 'Donate': return 'group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 group-hover:text-white'
            default: return 'group-hover:bg-purple-500 dark:group-hover:bg-purple-400 group-hover:text-white'
        }
    }

    return (
        <>
            <motion.div
                initial={{ scale: 0.8, y: 50 }}
                whileInView={{ scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.2 }}
                className="group h-full"
            >
                <PillowCard
                    shadowClassName={getShadowColor(product.category)}
                    className="h-full cursor-pointer"
                    contentClassName="flex flex-col p-6 pb-0"
                    onClick={() => { if (!isAdmin) setIsModalOpen(true) }}
                >
                    {/* Main content area - grows to fill space */}
                    <div className="flex-1 mb-6" onClick={() => isAdmin && setIsModalOpen(true)}>
                        {/* Large centered icon */}
                        <div className="flex justify-center mb-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                {getIcon(product.category)}
                            </div>
                        </div>

                        {/* Name (left) and Price (right) */}
                        <div className="flex justify-between items-baseline mb-4 gap-4">
                            <h3 className="font-heading font-bold text-lg leading-tight">
                                {product.name}
                            </h3>
                            <div className="shrink-0">
                                <span className="text-lg font-bold">
                                    {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
                                </span>
                                {product.type === 'subscription' && (
                                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                                )}
                            </div>
                        </div>

                        {/* Summary - left aligned */}
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 text-left">
                            {product.summary || product.description}
                        </p>
                    </div>

                    {/* Bottom action area */}
                    <PillowButton
                        className="-mx-6 -mb-0 w-[calc(100%+3rem)] h-14 text-xs font-black items-stretch"
                        highlightClassName={product.isActive === false ? 'text-muted-foreground' : getButtonHoverColor(product.category)}
                    >
                        {isAdmin ? (
                            <div className="flex w-full h-full">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center hover:bg-primary/20 transition-colors hover:text-primary"
                                >
                                    Edit
                                </button>
                                <div className="w-px bg-black/10 dark:bg-white/10 my-3" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center hover:bg-primary/20 transition-colors hover:text-primary"
                                >
                                    View
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                {product.isActive === false
                                    ? "Out of Stock"
                                    : product.price === 0
                                        ? "Current Plan"
                                        : (
                                            <>
                                                Learn More
                                                <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                                            </>
                                        )
                                }
                            </div>
                        )}
                    </PillowButton>
                </PillowCard>
            </motion.div>

            <ProductDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
                onAddToCart={addToCart}
            />

            <ProductAdminModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={product}
            />
        </>
    )
}
