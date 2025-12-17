"use client"

import { Product } from "@/types/store"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { motion } from "framer-motion"
import { Sparkles, Trophy, MessageCircle, Gift, Zap } from "lucide-react"

interface ProductCardProps {
    product: Product
    index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addToCart } = useCart()

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Memberships': return <Trophy className="h-6 w-6 text-yellow-500" />
            case 'Boosts': return <Zap className="h-6 w-6 text-blue-500" />
            case 'Chat': return <MessageCircle className="h-6 w-6 text-pink-500" />
            case 'Donate': return <Gift className="h-6 w-6 text-green-500" />
            default: return <Sparkles className="h-6 w-6 text-purple-500" />
        }
    }

    return (
        <div
            style={{
                animation: 'fadeInUp 0.5s ease-out forwards',
                animationDelay: `${index * 100}ms`
            }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-md opacity-0"
        >
            <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    {getIcon(product.category)}
                </div>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <div className="text-right">
                        <span className="text-lg font-bold">
                            {product.price === 0 ? 'Free' : `$${product.price}`}
                        </span>
                        {product.type === 'subscription' && (
                            <span className="block text-xs text-muted-foreground">/mo</span>
                        )}
                    </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                </p>

                {product.features && (
                    <ul className="mb-6 space-y-1">
                        {product.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-primary/50" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Button
                onClick={() => addToCart(product)}
                className="w-full bg-primary/90 hover:bg-primary"
                variant={product.price === 0 ? "outline" : "default"}
                disabled={product.price === 0} // Can't add free tier to cart usually, logically handled elsewhere or auto-assigned
            >
                {product.price === 0 ? "Current Plan" : "Add to Cart"}
            </Button>
        </div>
    )
}
