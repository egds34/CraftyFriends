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

    const addToCart = (product: Product) => {
        let newItems = [...items]

        // Logic: Subscription Override
        if (product.type === 'subscription') {
            // Remove any other subscription of the same category (e.g. Memberships)
            // or just any subscription if we only allow one "primary" membership at a time.
            // Assumption: Categories are "Memberships"
            if (product.category === 'Memberships') {
                newItems = newItems.filter(item => item.category !== 'Memberships')
            }
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
