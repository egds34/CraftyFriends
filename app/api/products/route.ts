import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

const getCachedProducts = unstable_cache(
    async () => {
        return await prisma.product.findMany({
            where: { active: true },
            orderBy: [
                { category: 'asc' },
                { price: 'asc' }
            ]
        })
    },
    ["products-list"],
    { revalidate: 3600, tags: ["products"] }
)

export async function GET() {
    try {
        const products = await getCachedProducts()

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
