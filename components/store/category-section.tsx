"use client"

import { useState, useEffect } from "react"
import { Product } from "@/types/store"
import { ProductCard } from "./product-card"

// Helper Hook for Grid Columns
function useGridColumns() {
    const [columns, setColumns] = useState(4); // Default to max (desktop)

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1280) setColumns(4); // xl
            else if (window.innerWidth >= 1024) setColumns(3); // lg
            else if (window.innerWidth >= 768) setColumns(2); // md
            else setColumns(1);
        }

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);
    return columns;
}

interface CategorySectionProps {
    category: string
    products: Product[]
}

export function CategorySection({ category, products }: CategorySectionProps) {
    const columns = useGridColumns();

    return (
        <section id={category} className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8 justify-center">
                <div className="h-px w-12 bg-border hidden md:block" />
                <h2 className="text-3xl font-heading font-bold text-center">{category}</h2>
                <div className="h-px w-12 bg-border hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {products.map((product, index) => {
                    // Calculate diagonal ripple delay
                    // Row = floor(index / columns)
                    // Col = index % columns
                    // Ripple = Row + Col
                    const row = Math.floor(index / columns);
                    const col = index % columns;
                    const rippleIndex = row + col;

                    return (
                        <ProductCard key={product.id} product={product} index={rippleIndex} />
                    )
                })}
            </div>
        </section>
    );
}
