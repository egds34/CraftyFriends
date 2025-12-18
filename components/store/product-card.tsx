"use client"

import { useState } from "react"
import { Product } from "@/types/store"
import { useCart } from "@/components/providers/cart-provider"
import { motion } from "framer-motion"
import { Sparkles, Trophy, MessageCircle, Gift, Zap } from "lucide-react"
import { PillowCard } from "@/components/ui/pillow-card"
import { ProductDetailModal } from "./product-detail-modal"

interface ProductCardProps {
    product: Product
    index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addToCart } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)

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
            case 'Memberships': return 'bg-amber-500/40'
            case 'Boosts': return 'bg-blue-500/40'
            case 'Chat': return 'bg-pink-500/40'
            case 'Donate': return 'bg-emerald-500/40'
            default: return 'bg-purple-500/40'
        }
    }

    const getButtonHoverColor = (cat: string) => {
        const normalized = normalizeCategory(cat)
        switch (normalized) {
            case 'Memberships': return 'group-hover:bg-amber-500'
            case 'Boosts': return 'group-hover:bg-blue-500'
            case 'Chat': return 'group-hover:bg-pink-500'
            case 'Donate': return 'group-hover:bg-emerald-500'
            default: return 'group-hover:bg-purple-500'
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
                    onClick={() => setIsModalOpen(true)}
                >
                    {/* Main content area - grows to fill space */}
                    <div className="flex-1 mb-6">
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
                                    {product.price === 0 ? 'Free' : `$${product.price}`}
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

                    {/* Bottom action area - fixed height h-[5.5rem] is approx h-22 */}
                    <div className={`-mx-6 -mb-6 w-[calc(100%+3rem)] h-[5.5rem] flex items-center justify-center font-bold text-lg transition-all pb-6 ${product.isActive === false
                        ? 'bg-muted/70 dark:bg-muted/50 text-muted-foreground cursor-not-allowed'
                        : `bg-muted/50 dark:bg-muted/30 ${getButtonHoverColor(product.category)} group-hover:text-white`
                        }`}>
                        {product.isActive === false
                            ? "Out of Stock"
                            : product.price === 0
                                ? "Current Plan"
                                : "Learn More"
                        }
                    </div>
                </PillowCard>
            </motion.div>

            <ProductDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
                onAddToCart={addToCart}
            />
        </>
    )
}
