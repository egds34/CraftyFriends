import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { active: true },
            orderBy: [
                { category: 'asc' },
                { price: 'asc' }
            ]
        })

        // Transform to match the Product type expected by the frontend
        const transformedProducts = products.map(product => ({
            id: product.id,
            stripeProductId: product.stripeProductId,
            stripePriceId: product.stripePriceId,
            name: product.name,
            description: product.description || "",
            price: product.price,
            category: product.category,
            type: product.type,
            features: product.features,
            priceId: product.stripePriceId || undefined,
        }))

        return NextResponse.json(transformedProducts)
    } catch (error: any) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        )
    }
}
