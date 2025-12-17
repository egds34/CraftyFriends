"use client"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingCart, X, ChevronUp, Sparkles, Trophy, MessageCircle, Gift, Zap } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function FloatingCart() {
    const { items, removeFromCart, total, isLoaded } = useCart()
    const [isOpen, setIsOpen] = useState(false)

    if (!isLoaded) return null

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Memberships': return <Trophy className="h-4 w-4 text-yellow-500" />
            case 'Boosts': return <Zap className="h-4 w-4 text-blue-500" />
            case 'Chat': return <MessageCircle className="h-4 w-4 text-pink-500" />
            case 'Donate': return <Gift className="h-4 w-4 text-green-500" />
            default: return <Sparkles className="h-4 w-4 text-purple-500" />
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto w-80 md:w-96 rounded-2xl bg-card/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col max-h-[70vh] origin-bottom-right"
                    >
                        {/* Header */}
                        <motion.div layout className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                <h2 className="font-bold">Your Cart</h2>
                                <span className="text-xs text-muted-foreground">({items.length})</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </motion.div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {items.length === 0 ? (
                                    <motion.div
                                        layout
                                        key="empty-cart"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2"
                                    >
                                        <ShoppingCart className="h-12 w-12 opacity-20" />
                                        <p>Your cart is empty</p>
                                    </motion.div>
                                ) : (
                                    items.map((item) => (
                                        <motion.div
                                            key={item.cartId}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.2 } }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                                marginBottom: 0,
                                                padding: 0,
                                                borderColor: "transparent", // Fade border out 
                                                transition: {
                                                    opacity: { duration: 0.2 },
                                                    default: { delay: 0.2, duration: 0.2 }
                                                }
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 group transition-colors overflow-hidden"
                                        >
                                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                                                {getIcon(item.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {item.type === 'subscription' ? 'Subscription' : 'One-time'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-sm tab-nums">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <motion.div layout className="p-4 bg-muted/30 space-y-3">
                            <div className="flex justify-between items-center font-bold">
                                <span>Total</span>
                                <span className="text-xl">${total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full font-bold shadow-lg shadow-primary/20" size="lg" disabled={items.length === 0}>
                                Go to Checkout
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative">
                    {isOpen ? (
                        <ChevronUp className="h-8 w-8" />
                    ) : (
                        <ShoppingCart className="h-8 w-8" />
                    )}

                    {!isOpen && items.length > 0 && (
                        <span className="absolute -top-5 -right-5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                            {items.length}
                        </span>
                    )}
                </div>
            </motion.button>
        </div>
    )
}
