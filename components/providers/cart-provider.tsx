"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { CartItem, Product } from "@/types/store"

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product) => void
    removeFromCart: (cartId: string) => void
    clearCart: () => void
    total: number
    isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isMounted, setIsMounted] = useState(false)

    // Load from local storage
    useEffect(() => {
        setIsMounted(true)
        const saved = localStorage.getItem('crafty_cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('crafty_cart', JSON.stringify(items))
        }
    }, [items, isMounted])

    // Refresh cart with latest product data
    useEffect(() => {
        if (!isMounted) return

        const refreshCart = async () => {
            try {
                const response = await fetch('/api/products')
                if (!response.ok) return
                const products: Product[] = await response.json()

                setItems(prevItems => {
                    const freshItems = prevItems.map(item => {
                        const freshProduct = products.find(p => p.id === item.id)
                        if (!freshProduct || freshProduct.isActive === false) return null // Remove if deleted or inactive
                        return { ...freshProduct, cartId: item.cartId } // Update details, keep cartId
                    }).filter((item): item is CartItem => item !== null)

                    // Only update if changed (basic comparison)
                    if (JSON.stringify(freshItems) !== JSON.stringify(prevItems)) {
                        return freshItems
                    }
                    return prevItems
                })
            } catch (err) {
                console.error("Failed to refresh cart", err)
            }
        }

        refreshCart()
    }, [isMounted])

    const addToCart = (product: Product) => {
        let newItems = [...items]

        // Logic: Enforce single subscription
        if (product.type === 'subscription') {
            // Remove any existing subscription to ensure only one subscription per cart
            newItems = newItems.filter(item => item.type !== 'subscription')
        }

        const cartItem: CartItem = {
            ...product,
            cartId: crypto.randomUUID()
        }

        setItems([...newItems, cartItem])
    }

    const removeFromCart = (cartId: string) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId))
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => sum + item.price, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, isLoaded: isMounted }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
