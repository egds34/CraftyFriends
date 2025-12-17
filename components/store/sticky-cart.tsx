"use client"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingCart } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function StickyCart() {
    const { items, removeFromCart, total } = useCart()

    return (
        <div className="sticky top-32 h-fit w-full max-w-sm rounded-xl border bg-card shadow-lg p-6">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                <div className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {items.length} items
                </div>
            </div>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-muted-foreground text-sm"
                        >
                            Your cart is empty.
                        </motion.div>
                    ) : (
                        items.map((item) => (
                            <motion.div
                                key={item.cartId}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-start justify-between gap-3 rounded-lg border p-3 bg-background/50"
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {item.type === 'subscription' ? 'Subscription' : 'One-time'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-sm">
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

            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" disabled={items.length === 0}>
                    Go to Checkout
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                    Tax included. Secure checkout via Stripe.
                </p>
            </div>
        </div>
    )
}
