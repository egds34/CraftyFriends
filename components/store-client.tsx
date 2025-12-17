"use client"

import { StoreNavbar } from "./store/store-navbar"
import { ProductCard } from "./store/product-card"
import { FloatingCart } from "./store/floating-cart"
import { User } from "next-auth"
import { mockProducts } from "@/lib/mock-products"

interface StoreClientProps {
    user?: User
}

export function StoreClient({ user }: StoreClientProps) {
    // Using mock data temporarily
    const products = mockProducts

    // Group products by category
    const categories = Array.from(new Set(products.map(p => p.category)))

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="pt-24 pb-12 px-4 text-center relative">
                <div
                    className="absolute inset-0 bg-primary/5 transition-colors duration-500"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Server Shop</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Enhance your experience with ranks, boosts, and exclusive cosmetics.
                    </p>
                </div>
            </div>

            {/* Sticky Nav */}
            <StoreNavbar />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {products.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <p className="text-muted-foreground">No products available at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-24 min-h-[150vh]">
                        {categories.map((category) => (
                            <section key={category} id={category} className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8 justify-center">
                                    <div className="h-px w-12 bg-border hidden md:block" />
                                    <h2 className="text-3xl font-bold text-center">{category}</h2>
                                    <div className="h-px w-12 bg-border hidden md:block" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products
                                        .filter(p => p.category === category)
                                        .map((product, index) => (
                                            <ProductCard key={product.id} product={product} index={index} />
                                        ))
                                    }
                                </div>
                            </section>
                        ))}

                        {/* Extra space at bottom for "indefinite" scrolling feel to hit top nav */}
                        <div className="h-[55vh]" />
                    </div>
                )}
            </div>

            <FloatingCart />
        </main>
    )
}
