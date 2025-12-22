"use client"

import { Product } from "@/types/store"
import { Button } from "@/components/ui/button"
import { X, Check } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ProductDetailModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product
    onAddToCart: (product: Product) => void
}

export function ProductDetailModal({ isOpen, onClose, product, onAddToCart }: ProductDetailModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const handleAddToCart = () => {
        onAddToCart(product)
        onClose()
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] overflow-y-auto"
                    />

                    {/* Modal Container - Centers content and handles scrolling */}
                    <div className="fixed inset-0 z-[101] overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="relative w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative w-full rounded-2xl border bg-card/95 shadow-2xl backdrop-blur-xl max-h-[85vh] flex flex-col">
                                    {/* Close Button - Fixed at top */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 z-50 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-full"
                                        onClick={onClose}
                                    >
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Close</span>
                                    </Button>

                                    {/* Scrollable Content */}
                                    <div className="overflow-y-auto p-8">
                                        {/* Header */}
                                        <div className="mb-6 pr-8">
                                            <h2 className="text-3xl font-heading font-bold tracking-tight mb-2">
                                                {product.name}
                                            </h2>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-primary">
                                                    {product.price === 0 ? 'Free' : `$${product.price}`}
                                                </span>
                                                {product.type === 'subscription' && (
                                                    <span className="text-sm text-muted-foreground">/mo</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-6">
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                {product.details || product.description}
                                            </p>

                                            {product.features && product.features.length > 0 && (
                                                <div className="bg-muted/30 rounded-xl p-6">
                                                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Included Features</h3>
                                                    <ul className="grid gap-3">
                                                        {product.features.map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                                <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                                    <Check className="h-3 w-3 text-primary" />
                                                                </div>
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button
                                                    onClick={handleAddToCart}
                                                    className={`w-full h-12 text-lg font-bold transition-all rounded-xl shadow-lg ${product.isActive === false
                                                            ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted'
                                                            : 'bg-primary hover:bg-primary/90 hover:shadow-primary/25'
                                                        }`}
                                                    disabled={product.price === 0 || product.isActive === false}
                                                >
                                                    {product.isActive === false
                                                        ? "Out of Stock"
                                                        : product.price === 0
                                                            ? "Current Plan"
                                                            : "Add to Cart"
                                                    }
                                                </Button>
                                                {product.price === 0 && product.isActive !== false && (
                                                    <p className="text-center text-xs text-muted-foreground mt-3">
                                                        You are already on this plan.
                                                    </p>
                                                )}
                                                {product.isActive === false && (
                                                    <p className="text-center text-xs text-muted-foreground mt-3">
                                                        This item is currently unavailable.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
