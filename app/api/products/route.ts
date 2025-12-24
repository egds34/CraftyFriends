import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Fetch products directly from DB (no cache) to ensure fresh Admin updates appear immediately
        const products = await prisma.product.findMany({
            where: { active: true },
            orderBy: [
                { category: 'asc' },
                { price: 'asc' }
            ]
        })

        // Transform to match the Product type expected by the frontend
        const transformedProducts = products.map((product: any) => {
            const metadata = product.metadata as any
            return {
                id: product.id,
                stripeProductId: product.stripeProductId,
                stripePriceId: product.stripePriceId,
                name: product.name,
                description: product.description || "",
                summary: metadata?.summary || product.description || "",
                details: metadata?.details || product.description || "",
                price: product.price,
                category: product.category,
                type: product.type,
                features: product.features,
                priceId: product.stripePriceId || undefined,
                isActive: metadata?.isActive !== false, // Default to true
            }
        })

        return NextResponse.json(transformedProducts)
    } catch (error: any) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        )
    }
}
