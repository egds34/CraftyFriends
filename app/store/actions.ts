"use server"

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { revalidatePath, revalidateTag } from "next/cache"
import { Product } from "@/types/store"

export type ProductFormData = {
    name: string
    description: string
    price: number
    category: string
    type: 'one-time' | 'subscription'
    features: string
    summary: string
    details: string
}

export async function createStripeProduct(data: ProductFormData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    try {
        const product = await stripe.products.create({
            name: data.name,
            description: data.description || data.summary || undefined,
            active: true,
            metadata: {
                category: data.category,
                type: data.type,
                features: JSON.stringify(data.features.split('\n').filter(f => f.trim())),
                summary: data.summary,
                details: data.details,
                isActive: 'true'
            },
            default_price_data: {
                currency: 'usd',
                unit_amount: Math.round(data.price * 100),
                recurring: data.type === 'subscription' ? { interval: 'month' } : undefined
            }
        })

        revalidatePath('/store')
        return { success: true, productId: product.id }
    } catch (error: any) {
        console.error("Stripe Create Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateStripeProduct(productId: string, priceId: string | undefined, data: ProductFormData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    try {
        // 1. Update Product Details
        await stripe.products.update(productId, {
            name: data.name,
            description: data.description || data.summary || undefined,
            metadata: {
                category: data.category,
                type: data.type,
                features: JSON.stringify(data.features.split('\n').filter(f => f.trim())),
                summary: data.summary,
                details: data.details,
                isActive: 'true'
            }
        })

        // 2. Handle Price Change
        const newAmount = Math.round(data.price * 100)

        const newPrice = await stripe.prices.create({
            product: productId,
            currency: 'usd',
            unit_amount: newAmount,
            recurring: data.type === 'subscription' ? { interval: 'month' } : undefined
        })

        await stripe.products.update(productId, {
            default_price: newPrice.id
        })

        revalidatePath('/store')
        return { success: true }
    } catch (error: any) {
        console.error("Stripe Update Error:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteStripeProduct(productId: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    try {
        await stripe.products.update(productId, { active: false })
        revalidatePath('/store')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
